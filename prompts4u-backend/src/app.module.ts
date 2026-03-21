import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ComponentsModule } from './modules/components/components.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CopyTrackingModule } from './modules/copy-tracking/copy-tracking.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ScraperModule } from './scraper/scraper.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: new URL(configService.get<string>('REDIS_URL') || 'redis://localhost:6379').hostname,
          port: parseInt(new URL(configService.get<string>('REDIS_URL') || 'redis://localhost:6379').port) || 6379,
          password: new URL(configService.get<string>('REDIS_URL') || 'redis://localhost:6379').password || undefined,
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ComponentsModule,
    PaymentsModule,
    CopyTrackingModule,
    ScraperModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
