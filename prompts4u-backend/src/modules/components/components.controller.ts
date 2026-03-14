import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { QueryComponentsDto } from './dto/query-components.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('components')
export class ComponentsController {
  constructor(private componentsService: ComponentsService) {}

  @Get()
  async findAll(@Query() query: QueryComponentsDto) {
    return this.componentsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.componentsService.findOne(id);
  }

  @Get('slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return this.componentsService.findOneBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createComponentDto: CreateComponentDto) {
    return this.componentsService.create(createComponentDto);
  }

  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  async copy(@Req() req, @Param('id') componentId: string) {
    const userId = req.user.userId;
    // Get user's subscription status
    const user = await this.componentsService['prisma'].user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true },
    });

    return this.componentsService.copy(
      componentId,
      userId,
      user?.subscriptionStatus || 'free',
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.componentsService.delete(id);
  }
}
