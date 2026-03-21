import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Logger,
} from '@nestjs/common';
import type { CreateMixMasterJobDto } from './mix-master.dto';
import { MixMasterService } from './mix-master.service';

@Controller('admin/mix-master')
export class MixMasterController {
  private readonly logger = new Logger(MixMasterController.name);

  constructor(private readonly mixMasterService: MixMasterService) {}

  /**
   * Create a Mix Master job (synthesizes multiple prompts)
   */
  @Post()
  async createJob(@Body() body: CreateMixMasterJobDto) {
    const { category, sourcePromptIds } = body;

    if (!category || !sourcePromptIds || sourcePromptIds.length < 2) {
      return {
        error: 'Category and at least 2 source prompt IDs are required',
      };
    }

    const job = await this.mixMasterService.createJob(body);

    // Process immediately (in production, this would be queued)
    const result = await this.mixMasterService.processJob(job.id);

    this.logger.log(`MixMaster job created and processed: ${job.id}`);

    return {
      jobId: job.id,
      resultPromptId: result.resultPromptId,
      status: 'completed',
    };
  }

  /**
   * Get job status and result
   */
  @Get(':id')
  async getJob(@Param('id') id: string) {
    return this.mixMasterService.getJob(id);
  }

  /**
   * Get published prompts by category (for selecting sources)
   */
  @Get('prompts/:category')
  async getPublishedPrompts(@Param('category') category: string) {
    return this.mixMasterService.getPublishedPrompts(category);
  }

  /**
   * Get available categories
   */
  @Get('categories/list')
  async getCategories() {
    return {
      categories: [
        'navbar',
        'hero',
        'features',
        'pricing',
        'testimonials',
        'cta',
        'footer',
        'faq',
        'stats',
        'logo-cloud',
        'auth-form',
        'sidebar',
      ],
    };
  }
}
