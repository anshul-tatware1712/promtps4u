import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async testRedis(): Promise<{ redis: string }> {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    const client = new Redis(redisUrl);

    try {
      await client.set('test', 'ok');
      const val = await client.get('test');
      await client.quit();
      return { redis: val === 'ok' ? 'connected' : 'failed' };
    } catch (error) {
      this.logger.error('Redis connection failed', error);
      await client.quit();
      return { redis: 'disconnected' };
    }
  }
}
