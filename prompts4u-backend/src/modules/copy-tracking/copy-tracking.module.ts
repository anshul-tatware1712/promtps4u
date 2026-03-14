import { Module } from '@nestjs/common';
import { CopyTrackingController } from './copy-tracking.controller';
import { CopyTrackingService } from './copy-tracking.service';

@Module({
  controllers: [CopyTrackingController],
  providers: [CopyTrackingService],
  exports: [CopyTrackingService],
})
export class CopyTrackingModule {}
