import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface DetectedComponent {
  id: string;
  type: string;
  title: string;
  position: number;
  colorScheme?: string;
  designStyle?: string;
  layout?: any;
  interactiveElements?: any[];
  animations?: any[];
  colorTokens?: any;
  svgElements?: any[];
  responsiveBehavior?: string;
  specialEffects?: string[];
  mediaElements?: any;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new page entry
   */
  async create(url: string, urlHash: string): Promise<any> {
    const page = await this.prisma.page.create({
      data: {
        url,
        urlHash,
        scrapeStatus: 'pending',
      },
    });
    this.logger.log(`Page created: ${page.id}`);
    return page;
  }

  /**
   * Update page status
   */
  async updateStatus(pageId: string, status: string): Promise<void> {
    await this.prisma.page.update({
      where: { id: pageId },
      data: { scrapeStatus: status },
    });
    this.logger.log(`Page ${pageId} status: ${status}`);
  }

  /**
   * Mark page as done with screenshot
   */
  async markDone(
    pageId: string,
    screenshotUrl: string,
    title?: string,
  ): Promise<void> {
    await this.prisma.page.update({
      where: { id: pageId },
      data: {
        fullScreenshotUrl: screenshotUrl,
        title: title || null,
        scrapeStatus: 'done',
        scrapedAt: new Date(),
      },
    });
    this.logger.log(`Page ${pageId} marked as done`);
  }

  /**
   * Mark page as failed
   */
  async markFailed(pageId: string, errorMessage: string): Promise<void> {
    await this.prisma.page.update({
      where: { id: pageId },
      data: {
        scrapeStatus: 'failed',
        scrapeError: errorMessage,
      },
    });
    this.logger.error(`Page ${pageId} failed: ${errorMessage}`);
  }

  /**
   * Save detected components
   */
  async saveComponents(
    pageId: string,
    components: DetectedComponent[],
  ): Promise<any[]> {
    const created = await Promise.all(
      components.map((component, index) =>
        this.prisma.detectedComponent.create({
          data: {
            pageId,
            componentType: component.type,
            layoutDescription: JSON.stringify(component.layout),
            colorScheme: component.colorScheme,
            designStyle: component.designStyle,
            interactionStates: component.interactiveElements || null,
            animations: component.animations || null,
            cssTokens: component.colorTokens || null,
            svgElements: component.svgElements || null,
            responsiveBehavior: component.responsiveBehavior,
            detectionRaw: component as any,
            positionOnPage: component.position || index,
          },
        }),
      ),
    );

    this.logger.log(`Saved ${created.length} components for page ${pageId}`);
    return created;
  }

  /**
   * Save prompts
   */
  async savePrompts(
    pageId: string,
    prompts: Array<{
      componentId: string;
      promptText: string;
      componentType: string;
      title?: string;
      screenshotUrl?: string;
      suggestedImages?: any;
      tags?: string[];
    }>,
  ): Promise<any[]> {
    const created = await Promise.all(
      prompts.map((prompt) =>
        this.prisma.prompt.create({
          data: {
            pageId,
            componentId: prompt.componentId,
            promptText: prompt.promptText,
            componentType: prompt.componentType,
            title: prompt.title,
            screenshotUrl: prompt.screenshotUrl,
            suggestedImages: prompt.suggestedImages,
            tags: prompt.tags || [],
            status: 'draft',
          },
        }),
      ),
    );

    this.logger.log(`Saved ${created.length} prompts for page ${pageId}`);
    return created;
  }

  /**
   * Get page by ID
   */
  async findById(pageId: string): Promise<any> {
    return this.prisma.page.findUnique({
      where: { id: pageId },
      include: {
        components: true,
        prompts: true,
      },
    });
  }

  /**
   * Get page by URL hash
   */
  async findByUrlHash(urlHash: string): Promise<any> {
    return this.prisma.page.findUnique({
      where: { urlHash },
    });
  }

  /**
   * Get all pages
   */
  async getAllPages(): Promise<any[]> {
    return this.prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        components: {
          select: {
            id: true,
            componentType: true,
            designStyle: true,
            colorScheme: true,
          },
        },
        prompts: {
          select: {
            id: true,
            status: true,
            componentType: true,
          },
        },
      },
    });
  }
}
