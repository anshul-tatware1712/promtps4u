import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CreateOAuthUserDto } from './dto/create-oauth-user.dto';
import { Resend } from 'resend';

@Injectable()
export class AuthService {
  private resend: Resend | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    console.log('RESEND_API_KEY loaded:', !!resendApiKey);

    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  async sendOtp(sendOtpDto: SendOtpDto) {
    const { email } = sendOtpDto;
    const normalizedEmail = email.toLowerCase().trim();

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log(`Generated OTP for ${normalizedEmail}: ${code}`);

    // Save OTP
    await this.prisma.otpCode.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt,
      },
    });

    // Send email
    if (this.resend) {
      try {
        const response = await this.resend.emails.send({
          from: 'onboarding@resend.dev',
          to: 'anshultatware01@gmail.com',
          subject: 'Your Prompts4U Login Code',
          html: `<h1>Your Login Code</h1>
         <p style="font-size:24px;font-weight:bold">${code}</p>`,
        });

        console.log('Email sent:', response);
      } catch (error) {
        console.error('Resend email error:', error);
        throw new InternalServerErrorException('Failed to send OTP email');
      }
    } else {
      console.log(`[DEV MODE] OTP for ${email}: ${code}`);
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, code } = verifyOtpDto;

    // Normalize email to lowercase for consistent lookup
    const normalizedEmail = email.toLowerCase().trim();

    // Trim the code as well to handle any whitespace issues
    const trimmedCode = code.trim();

    console.log(`Verifying OTP for ${normalizedEmail}: ${trimmedCode}`);
    console.log(`Email bytes: ${Buffer.from(normalizedEmail).toString('hex')}`);
    console.log(`Code bytes: ${Buffer.from(trimmedCode).toString('hex')}`);

    // First, let's see all OTPs for this email to debug
    const allOtps = await this.prisma.otpCode.findMany({
      where: { email: normalizedEmail },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log('Recent OTPs for this email:', allOtps.map(o => ({
      code: o.code,
      used: o.used,
      expiresAt: o.expiresAt,
      createdAt: o.createdAt,
      isExpired: o.expiresAt < new Date(),
    })));

    // Find the most recent unused OTP that hasn't expired
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        code: trimmedCode,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('OTP found:', !!otp);
    console.log('OTP details:', otp ? { id: otp.id, code: otp.code, used: otp.used, expiresAt: otp.expiresAt } : null);

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          provider: 'email',
        },
      });
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      provider: user.provider,
    });

    return {
      user,
      token,
    };
  }

  async findOrCreateOAuthUser(dto: CreateOAuthUserDto) {
    const { provider, providerId, email, name, avatar } = dto;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (providerId && !user.providerId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { providerId },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          avatar,
          provider,
          providerId,
        },
      });
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      provider: user.provider,
    });

    return {
      user,
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
