import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Logger,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PagesService } from './pages.service';
import * as crypto from 'crypto';

export class SubmitUrlDto {
  @IsString()
  url: string;
}

export class UpdatePromptStatusDto {
  @IsString()
  status: 'draft' | 'published';
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

  /**
   * Update prompt publish status
   */
  @Patch('prompts/:promptId/status')
  async updatePromptStatus(
    @Param('promptId') promptId: string,
    @Body() body: UpdatePromptStatusDto,
  ) {
    const { status } = body;

    if (!['draft', 'published'].includes(status)) {
      return { error: 'Invalid status. Must be "draft" or "published"' };
    }

    const updatedPrompt = await this.pagesService.updatePromptStatus(promptId, status);

    this.logger.log(`Prompt ${promptId} status updated to: ${status}`);

    return {
      message: 'Prompt status updated',
      prompt: updatedPrompt,
    };
  }

  /**
   * Bulk publish prompts from a page
   */
  @Post('pages/:pageId/publish')
  async publishPagePrompts(@Param('pageId') pageId: string) {
    const result = await this.pagesService.publishPagePrompts(pageId);

    this.logger.log(`Published ${result.publishedCount} prompts from page ${pageId}`);

    return {
      message: 'Prompts published successfully',
      publishedCount: result.publishedCount,
      prompts: result.prompts,
    };
  }

  /**
   * Bulk unpublish prompts from a page
   */
  @Post('pages/:pageId/unpublish')
  async unpublishPagePrompts(@Param('pageId') pageId: string) {
    const result = await this.pagesService.unpublishPagePrompts(pageId);

    this.logger.log(`Unpublished ${result.unpublishedCount} prompts from page ${pageId}`);

    return {
      message: 'Prompts unpublished successfully',
      unpublishedCount: result.unpublishedCount,
      prompts: result.prompts,
    };
  }
}
