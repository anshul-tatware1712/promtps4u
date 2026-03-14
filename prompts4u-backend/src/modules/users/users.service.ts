import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async updateSubscription(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const { subscriptionId, status, subscriptionEnd } = updateSubscriptionDto;

    return this.prisma.user.update({
      where: { id },
      data: {
        subscriptionId,
        subscriptionStatus: status,
        subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : null,
      },
    });
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionEnd: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      status: user.subscriptionStatus,
      subscriptionEnd: user.subscriptionEnd,
    };
  }
}
