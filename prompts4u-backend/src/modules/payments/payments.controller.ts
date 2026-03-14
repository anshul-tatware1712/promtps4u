import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Headers,
  Get,
  Param,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    // Use userId from JWT token instead of body
    const userId = req.user.userId;
    return this.paymentsService.createPaymentLink({ userId });
  }

  @Post('create-payment-link')
  @UseGuards(JwtAuthGuard)
  async createPaymentLink(@Req() req) {
    const userId = req.user.userId;
    return this.paymentsService.createPaymentLink({ userId });
  }

  @Get('payment-link/:id')
  @UseGuards(JwtAuthGuard)
  async getPaymentLinkStatus(@Param('id') paymentLinkId: string) {
    return this.paymentsService.getPaymentLinkStatus(paymentLinkId);
  }

  @Post('verify-payment-link/:id')
  @UseGuards(JwtAuthGuard)
  async verifyPaymentLink(@Req() req, @Param('id') paymentLinkId: string, @Body() body: any = {}) {
    const userId = req.user.userId;
    return this.paymentsService.verifyPaymentLink(paymentLinkId, userId);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(@Req() req, @Body() verifyPaymentDto: VerifyPaymentDto) {
    const userId = req.user.userId;
    return this.paymentsService.verifyPayment(verifyPaymentDto, userId);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const body = await req.json();
    return this.paymentsService.handleWebhook(body, signature);
  }

  @Get('success')
  async handleSuccessCallback(@Req() req) {
    // This handles the callback after payment is successful
    const { payment_id, payment_link_id } = req.query;

    if (payment_id && payment_link_id) {
      // Fetch the payment link status
      const paymentLink = await this.paymentsService.getPaymentLinkStatus(payment_link_id as string);

      if (paymentLink.status === 'paid') {
        return {
          success: true,
          message: 'Payment successful! Your subscription is being activated.',
          paymentId: payment_id,
        };
      }
    }

    return {
      success: false,
      message: 'Payment status could not be verified',
    };
  }
}
