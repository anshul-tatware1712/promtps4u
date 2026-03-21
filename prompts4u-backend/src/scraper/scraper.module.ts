import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScreenshotService } from './screenshot.service';
import { HtmlCleanerService } from './html-cleaner.service';
import { ScraperService } from './scraper.service';
import { ScraperProcessor } from './scraper.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scrape-queue',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    }),
  ],
  providers: [
    ScreenshotService,
    HtmlCleanerService,
    ScraperService,
    ScraperProcessor,
  ],
  exports: [
    ScreenshotService,
    HtmlCleanerService,
    ScraperService,
    BullModule,
  ],
})
export class ScraperModule {}
