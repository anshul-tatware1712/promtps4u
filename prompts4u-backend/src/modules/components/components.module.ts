import { Module } from '@nestjs/common';
import { ComponentsController } from './components.controller';
import { AdminComponentsController } from './admin-components.controller';
import { ComponentsService } from './components.service';

@Module({
  controllers: [ComponentsController, AdminComponentsController],
  providers: [ComponentsService],
  exports: [ComponentsService],
})
export class ComponentsModule {}
