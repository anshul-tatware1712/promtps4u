import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { ScraperService } from './scraper.service';
import type { ScrapeJob } from './scraper.types';

@Processor('scrape-queue')
export class ScraperProcessor {
  private readonly logger = new Logger(ScraperProcessor.name);

  constructor(private readonly scraperService: ScraperService) {}

  @Process('scrape')
  async handleScrape(job: Job<ScrapeJob>): Promise<{ promptCount: number }> {
    try {
      return await this.scraperService.processScrapeJob(job);
    } catch (error) {
      this.logger.error(`Scrape job failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
