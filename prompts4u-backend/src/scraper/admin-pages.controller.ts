import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { IsString } from 'class-validator';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PagesService } from './pages.service';
import * as crypto from 'crypto';

export class SubmitUrlDto {
  @IsString()
  url: string;
}

@Controller('admin/pages')
export class AdminPagesController {
  private readonly logger = new Logger(AdminPagesController.name);

  constructor(
    @InjectQueue('scrape-queue') private readonly scrapeQueue: Queue,
    private readonly pagesService: PagesService,
  ) {}

  /**
   * Submit a URL for scraping
   */
  @Post()
  async submitUrl(@Body() body: SubmitUrlDto) {
    const { url } = body;

    if (!url) {
      return { error: 'URL is required' };
    }

    // Generate URL hash for deduplication
    const urlHash = crypto.createHash('md5').update(url).digest('hex');

    // Check if already exists
    const existing = await this.pagesService.findByUrlHash(urlHash);
    if (existing) {
      return {
        message: 'URL already processed',
        page: existing,
        resubmit: true,
      };
    }

    // Create page entry
    const page = await this.pagesService.create(url, urlHash);

    // Add to queue
    await this.scrapeQueue.add(
      'scrape',
      {
        pageId: page.id,
        url,
        priority: 'normal',
      },
      {
        jobId: page.id,
        priority: 1,
      },
    );

    this.logger.log(`URL submitted for scraping: ${url}`);

    return {
      message: 'URL submitted for scraping',
      page: {
        id: page.id,
        url: page.url,
        status: page.scrapeStatus,
      },
    };
  }

  /**
   * Get all pages
   */
  @Get()
  async getAllPages() {
    return this.pagesService.getAllPages();
  }

  /**
   * Get page by ID with components and prompts
   */
  @Get(':id')
  async getPageById(@Param('id') id: string) {
    return this.pagesService.findById(id);
  }
}
