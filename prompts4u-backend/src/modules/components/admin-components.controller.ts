import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/components')
@UseGuards(JwtAuthGuard)
export class AdminComponentsController {
  constructor(private componentsService: ComponentsService) {}

  /**
   * Create a new component (admin only)
   */
  @Post()
  async create(@Body() createComponentDto: CreateComponentDto) {
    return this.componentsService.create(createComponentDto);
  }

  /**
   * Delete a component (admin only)
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.componentsService.delete(id);
  }
}
