import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PerplexityClient } from '../ai/perplexity.client';
import { MIX_MASTER_SYSTEM_PROMPT } from './mix-master.prompt';

export interface CreateMixMasterJobDto {
  category: string;
  sourcePromptIds: string[];
}

@Injectable()
export class MixMasterService {
  private readonly logger = new Logger(MixMasterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiClient: PerplexityClient,
  ) {}

  /**
   * Create a new Mix Master job
   */
  async createJob(dto: CreateMixMasterJobDto): Promise<any> {
    const job = await this.prisma.mixMasterJob.create({
      data: {
        category: dto.category,
        sourcePromptIds: dto.sourcePromptIds,
        status: 'pending',
      },
    });

    this.logger.log(`MixMaster job created: ${job.id}`);
    return job;
  }

  /**
   * Process a Mix Master job - synthesize prompts
   */
  async processJob(jobId: string): Promise<any> {
    const job = await this.prisma.mixMasterJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error(`MixMaster job not found: ${jobId}`);
    }

    await this.updateJobStatus(jobId, 'processing');
    this.logger.log(`Processing MixMaster job: ${jobId}`);

    // Fetch source prompts
    const sourcePrompts = await this.prisma.prompt.findMany({
      where: {
        id: {
          in: job.sourcePromptIds,
        },
      },
      orderBy: {
        copyCount: 'desc',
      },
    });

    if (sourcePrompts.length < 2) {
      throw new Error('Need at least 2 source prompts to mix');
    }

    // Build input for AI
    const promptsList = sourcePrompts
      .map((p, i) => `--- Reference ${i + 1}: ${p.title || 'Prompt'} ---\n${p.promptText}`)
      .join('\n\n');

    const userInput = `
Category: ${job.category}
Number of references: ${sourcePrompts.length}

${promptsList}
`;

    // Generate mixed prompt
    const mixedPromptText = await this.aiClient.chat(
      MIX_MASTER_SYSTEM_PROMPT,
      userInput,
      false,
    );

    this.logger.log(`Mixed prompt generated: ${mixedPromptText.length} chars`);

    // Save as new prompt (Mix Master results don't have a pageId, so we use a placeholder)
    const resultPrompt = await this.prisma.prompt.create({
      data: {
        pageId: 'mix-master', // Placeholder - Mix Master prompts aren't tied to a specific page
        promptText: mixedPromptText,
        componentType: job.category,
        category: job.category,
        title: `Mix Master: ${job.category} (${sourcePrompts.length} refs)`,
        isMixMaster: true,
        sourcePromptIds: job.sourcePromptIds,
        status: 'draft',
        tags: ['mix-master', 'synthesized', job.category],
      },
    });

    // Update job with result
    await this.prisma.mixMasterJob.update({
      where: { id: jobId },
      data: {
        status: 'done',
        resultPromptId: resultPrompt.id,
      },
    });

    this.logger.log(`MixMaster job completed: ${jobId} → ${resultPrompt.id}`);

    return {
      jobId: job.id,
      resultPromptId: resultPrompt.id,
      promptText: mixedPromptText,
    };
  }

  /**
   * Update job status
   */
  private async updateJobStatus(jobId: string, status: string): Promise<void> {
    await this.prisma.mixMasterJob.update({
      where: { id: jobId },
      data: { status },
    });
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<any> {
    return this.prisma.mixMasterJob.findUnique({
      where: { id: jobId },
      include: {
        resultPrompt: {
          select: {
            id: true,
            title: true,
            status: true,
            promptText: true,
          },
        },
      },
    });
  }

  /**
   * Get all jobs for a category
   */
  async getJobsByCategory(category: string): Promise<any[]> {
    return this.prisma.mixMasterJob.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
      include: {
        resultPrompt: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Get published prompts by category for selection
   */
  async getPublishedPrompts(category: string): Promise<any[]> {
    return this.prisma.prompt.findMany({
      where: {
        category,
        status: 'published',
        isMixMaster: false, // Don't include mix master results as sources
      },
      orderBy: { copyCount: 'desc' },
      select: {
        id: true,
        title: true,
        componentType: true,
        copyCount: true,
        tags: true,
      },
    });
  }
}
