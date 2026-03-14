import { Controller, Get, UseGuards, Req, Param } from '@nestjs/common';
import { CopyTrackingService } from './copy-tracking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('copy-tracking')
@UseGuards(JwtAuthGuard)
export class CopyTrackingController {
  constructor(private copyTrackingService: CopyTrackingService) {}

  @Get('history')
  async getCopyHistory(@Req() req, @Req() query?: { limit?: number }) {
    const userId = req.user.userId;
    return this.copyTrackingService.getUserCopyHistory(
      userId,
      query?.limit || 20,
    );
  }

  @Get('stats')
  async getUserStats(@Req() req) {
    const userId = req.user.userId;
    return this.copyTrackingService.getUserStats(userId);
  }

  @Get('component/:id')
  async getComponentCopyCount(@Param('id') componentId: string) {
    return this.copyTrackingService.getComponentCopyCount(componentId);
  }

  @Get('popular')
  async getPopularComponents() {
    return this.copyTrackingService.getPopularComponents(10);
  }
}
