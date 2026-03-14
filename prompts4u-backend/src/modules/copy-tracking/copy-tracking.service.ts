import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CopyTrackingService {
  constructor(private prisma: PrismaService) {}

  async getUserCopyHistory(userId: string, limit: number = 20) {
    return this.prisma.copyLog.findMany({
      where: { userId },
      orderBy: { copiedAt: 'desc' },
      take: limit,
      include: {
        component: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
          },
        },
      },
    });
  }

  async getComponentCopyCount(componentId: string) {
    const count = await this.prisma.copyLog.count({
      where: { componentId },
    });

    return { componentId, copyCount: count };
  }

  async getPopularComponents(limit: number = 10) {
    return this.prisma.component.findMany({
      orderBy: { copyCount: 'desc' },
      take: limit,
    });
  }

  async getUserStats(userId: string) {
    const totalCopies = await this.prisma.copyLog.count({
      where: { userId },
    });

    const uniqueCategories = await this.prisma.copyLog.groupBy({
      by: ['componentId'],
      where: { userId },
    });

    return {
      totalCopies,
      uniqueComponents: uniqueCategories.length,
    };
  }
}
