import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

export interface PaymentLinkResponse {
  id: string;
  linkUrl: string;
  shortUrl: string;
  amount: number;
  status: string;
  expiresAt: string;
}

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;
  private readonly subscriptionAmount = 2000; // 2000 paise = ₹20 for testing, change to 200000 for $20
  private readonly subscriptionCurrency = 'INR';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const keyId = this.configService.get('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }

  async createPaymentLink(createOrderDto: CreateOrderDto): Promise<PaymentLinkResponse> {
    const { userId } = createOrderDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has an active subscription
    if (user.subscriptionStatus === 'active' && user.subscriptionEnd && user.subscriptionEnd > new Date()) {
      throw new BadRequestException('User already has an active subscription');
    }

    // Create Razorpay Payment Link
    const paymentLinkData = {
      amount: this.subscriptionAmount,
      currency: this.subscriptionCurrency,
      accept_partial: false,
      expire_by: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expires in 24 hours
      reference_id: `sub_${userId.slice(0, 20)}_${Date.now().toString().slice(-8)}`, // Max 40 chars
      description: 'Prompts4U Monthly Subscription',
      notes: {
        userId,
        plan: 'monthly',
      },
      customer: {
        name: user.name || 'Customer',
        email: user.email,
        contact: user.phone || undefined,
      },
      notify: {
        sms: false,
        email: true,
      },
      reminder_enable: true,
      callback_url: `${this.configService.get('FRONTEND_URL')}/payment/success`,
      callback_method: 'get',
    };

    try {
      const paymentLink = await this.razorpay.paymentLink.create(paymentLinkData);

      // Store payment link info in database for tracking
      await this.prisma.paymentLink.create({
        data: {
          userId,
          paymentLinkId: paymentLink.id,
          amount: Number(paymentLink.amount),
          currency: paymentLink.currency,
          status: paymentLink.status,
          expiresAt: new Date(paymentLink.expire_by * 1000),
          referenceId: paymentLink.reference_id,
        },
      });

      return {
        id: paymentLink.id,
        linkUrl: paymentLink.short_url,
        shortUrl: paymentLink.short_url,
        amount: Number(paymentLink.amount),
        status: paymentLink.status,
        expiresAt: new Date(paymentLink.expire_by * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new BadRequestException('Failed to create payment link');
    }
  }

  async verifyPaymentLink(paymentLinkId: string, userId: string) {
    try {
      // Fetch payment link status from Razorpay
      const paymentLink = await this.razorpay.paymentLink.fetch(paymentLinkId);

      // Update local payment link record
      await this.prisma.paymentLink.updateMany({
        where: {
          paymentLinkId,
          userId,
        },
        data: {
          status: paymentLink.status,
        },
      });

      // Check if payment is completed
      if (paymentLink.status === 'paid') {
        // Get payments for this payment link
        const payments = paymentLink.payments;

        console.log('[verifyPaymentLink] Payment link fetched:', {
          status: paymentLink.status,
          payments: JSON.stringify(payments),
          paymentLinkId,
          userId,
        });

        // Razorpay returns payments as an object with payment_id field when payment is made
        // Handle different possible structures
        let paymentId: string | null = null;
        let amount: number = 0;

        if (payments) {
          // Case 1: payments is an object with payment_id
          if (payments.payment_id) {
            paymentId = payments.payment_id;
            amount = Number(payments.amount) || this.subscriptionAmount;
          }
          // Case 2: payments is an array (some API versions)
          else if (Array.isArray(payments) && payments.length > 0) {
            paymentId = payments[0].payment_id || payments[0].entity?.payment_id;
            amount = Number(payments[0].amount) || this.subscriptionAmount;
          }
        }

        if (paymentId) {
          console.log('[verifyPaymentLink] Payment found:', paymentId, 'Amount:', amount);

          // Update user subscription
          const subscriptionEnd = new Date();
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

          await this.prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'active',
              subscriptionId: paymentId,
              subscriptionEnd,
            },
          });

          console.log('[verifyPaymentLink] Subscription updated for user:', userId);

          return {
            success: true,
            message: 'Subscription activated successfully',
            paymentId,
            amount,
            subscriptionEnd,
          };
        } else {
          console.log('[verifyPaymentLink] No payment_id found in payments:', JSON.stringify(payments));
          // Even if payment_id is not found, if status is 'paid', update subscription
          // This handles edge cases where Razorpay API returns incomplete payment data
          const subscriptionEnd = new Date();
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

          await this.prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'active',
              subscriptionId: `plink_${paymentLinkId}`,
              subscriptionEnd,
            },
          });

          return {
            success: true,
            message: 'Subscription activated successfully (payment link status)',
            paymentId: `plink_${paymentLinkId}`,
            amount: this.subscriptionAmount,
            subscriptionEnd,
          };
        }
      }

      return {
        success: false,
        message: 'Payment not yet completed',
        status: paymentLink.status,
      };
    } catch (error) {
      console.error('Error verifying payment link:', error);
      throw new BadRequestException('Failed to verify payment link');
    }
  }

  async getPaymentLinkStatus(paymentLinkId: string) {
    try {
      const paymentLink = await this.razorpay.paymentLink.fetch(paymentLinkId);

      return {
        id: paymentLink.id,
        status: paymentLink.status,
        amount: Number(paymentLink.amount),
        currency: paymentLink.currency,
        payments: paymentLink.payments || null,
      };
    } catch (error) {
      console.error('Error fetching payment link status:', error);
      throw new NotFoundException('Payment link not found');
    }
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    // Delegate to createPaymentLink for backward compatibility
    return this.createPaymentLink(createOrderDto);
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto, userId: string) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verifyPaymentDto;

    // For payment links, we verify by fetching the payment link status
    if (razorpay_order_id && razorpay_order_id.startsWith('pl_')) {
      return this.verifyPaymentLink(razorpay_order_id, userId);
    }

    // Legacy order verification (keep for backward compatibility)
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', keySecret)
      .update(sign.toString())
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Update user subscription
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'active',
        subscriptionId: razorpay_payment_id,
        subscriptionEnd,
      },
    });

    return {
      success: true,
      message: 'Subscription activated successfully',
      subscriptionEnd,
    };
  }

  async handleWebhook(
    body: any,
    signature: string,
  ) {
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
    const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = body.event;
    const payload = body.payload;

    console.log('Received Razorpay webhook event:', event);

    // Handle payment link specific events
    switch (event) {
      case 'payment_link.paid':
        await this.handlePaymentLinkPaid(payload);
        break;
      case 'payment_link.payment_failed':
        await this.handlePaymentLinkFailed(payload);
        break;
      case 'payment.captured':
        await this.handlePaymentCaptured(payload);
        break;
      case 'subscription.charged':
        await this.handleSubscriptionCharged(payload);
        break;
    }

    return { received: true };
  }

  private async handlePaymentLinkPaid(payload: any) {
    const paymentLinkId = payload.payment_link?.entity?.id;

    if (!paymentLinkId) {
      console.log('No payment link ID in payload');
      return;
    }

    // Find the payment link record
    const paymentLinkRecord = await this.prisma.paymentLink.findFirst({
      where: { paymentLinkId },
    });

    if (!paymentLinkRecord) {
      console.log('Payment link record not found:', paymentLinkId);
      return;
    }

    // Update payment link status
    await this.prisma.paymentLink.update({
      where: { id: paymentLinkRecord.id },
      data: { status: 'paid' },
    });

    // Get the payment details from payload
    const payment = payload.payment?.entity;

    if (payment && payment.id) {
      const userId = paymentLinkRecord.userId;

      // Activate subscription
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'active',
          subscriptionId: payment.id,
          subscriptionEnd,
        },
      });

      console.log(`Subscription activated for user ${userId} via payment link ${paymentLinkId}`);
    }
  }

  private async handlePaymentLinkFailed(payload: any) {
    const paymentLinkId = payload.payment_link?.entity?.id;

    if (paymentLinkId) {
      await this.prisma.paymentLink.updateMany({
        where: { paymentLinkId },
        data: { status: 'failed' },
      });
      console.log(`Payment link failed: ${paymentLinkId}`);
    }
  }

  private async handlePaymentCaptured(payload: any) {
    const paymentId = payload.payment?.entity?.id;
    const paymentLinkId = payload.payment?.entity?.payment_link_id;

    if (paymentLinkId && paymentId) {
      // Find payment link record
      const paymentLinkRecord = await this.prisma.paymentLink.findFirst({
        where: { paymentLinkId },
      });

      if (paymentLinkRecord) {
        const subscriptionEnd = new Date();
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

        await this.prisma.user.update({
          where: { id: paymentLinkRecord.userId },
          data: {
            subscriptionStatus: 'active',
            subscriptionId: paymentId,
            subscriptionEnd,
          },
        });
      }
    }
  }

  private async handleSubscriptionCharged(payload: any) {
    const subscriptionId = payload.subscription?.entity?.id;

    if (subscriptionId) {
      // Find user by subscription ID
      const user = await this.prisma.user.findFirst({
        where: { subscriptionId },
      });

      if (user) {
        const subscriptionEnd = new Date();
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'active',
            subscriptionEnd,
          },
        });
      }
    }
  }
}
