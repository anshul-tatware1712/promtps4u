import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScreenshotService } from './screenshot.service';
import { HtmlCleanerService } from './html-cleaner.service';
import { ScraperService } from './scraper.service';
import { ScraperProcessor } from './scraper.processor';
import { PagesService } from './pages.service';
import { AdminPagesController } from './admin-pages.controller';
import { ScrapeProgressService } from './scrape-progress.service';
import { ScrapeProgressController } from './scrape-progress.controller';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../common/prisma/prisma.module';

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
    AiModule,
    PrismaModule,
  ],
  providers: [
    ScreenshotService,
    HtmlCleanerService,
    ScraperService,
    ScraperProcessor,
    PagesService,
    ScrapeProgressService,
  ],
  controllers: [AdminPagesController, ScrapeProgressController],
  exports: [
    ScreenshotService,
    HtmlCleanerService,
    ScraperService,
    PagesService,
    ScrapeProgressService,
    BullModule,
  ],
})
export class ScraperModule {}
