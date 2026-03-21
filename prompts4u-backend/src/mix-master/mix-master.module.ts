import { Module } from '@nestjs/common';
import { MixMasterService } from './mix-master.service';
import { MixMasterController } from './mix-master.controller';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [AiModule, PrismaModule],
  providers: [MixMasterService],
  controllers: [MixMasterController],
  exports: [MixMasterService],
})
export class MixMasterModule {}
