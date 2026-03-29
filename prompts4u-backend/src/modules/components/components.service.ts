import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { QueryComponentsDto } from './dto/query-components.dto';

@Injectable()
export class ComponentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryComponentsDto) {
    try {
      const { category, search, tier, page = 1, limit = 20 } = query;

      const where: any = {};

      if (category) {
        where.category = category;
      }

      if (tier) {
        where.tier = tier;
      }

      if (search && search.trim().length > 0) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { tags: { has: search } },
        ];
      }

      const [data, total] = await Promise.all([
        this.prisma.component.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.component.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new BadRequestException(`Failed to fetch components: ${error.message}`);
    }
  }

  async findOne(id: string) {
    const component = await this.prisma.component.findUnique({
      where: { id },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    return component;
  }

  async findOneBySlug(slug: string) {
    const component = await this.prisma.component.findUnique({
      where: { slug },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    return component;
  }

  async create(createComponentDto: CreateComponentDto) {
    const { tags = [], ...data } = createComponentDto;

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return this.prisma.component.create({
      data: {
        ...data,
        slug,
        tags,
      },
    });
  }

  async copy(componentId: string, userId: string, subscriptionStatus: string) {
    const component = await this.prisma.component.findUnique({
      where: { id: componentId },
    });

    if (!component) {
      throw new NotFoundException('Component not found');
    }

    // Check if component is paid and user doesn't have subscription
    if (component.tier === 'paid' && subscriptionStatus !== 'active') {
      throw new ForbiddenException('Subscription required to copy this component');
    }

    // Log the copy
    await this.prisma.copyLog.create({
      data: {
        userId,
        componentId,
      },
    });

    // Increment copy count
    const updatedComponent = await this.prisma.component.update({
      where: { id: componentId },
      data: { copyCount: { increment: 1 } },
    });

    return {
      ...updatedComponent,
      promptContent: component.promptContent,
    };
  }

  async delete(id: string) {
    await this.prisma.component.delete({
      where: { id },
    });

    return { message: 'Component deleted successfully' };
  }
}
