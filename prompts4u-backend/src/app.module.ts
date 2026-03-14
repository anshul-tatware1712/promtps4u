import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ComponentsModule } from './modules/components/components.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CopyTrackingModule } from './modules/copy-tracking/copy-tracking.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ComponentsModule,
    PaymentsModule,
    CopyTrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
