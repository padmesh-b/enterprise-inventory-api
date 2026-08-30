import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('v1/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateItemDto,
  ): Promise<ItemResponseDto> {
    return this.itemsService.create(companyId, dto);
  }

  @Get()
  async findAll(@CurrentUser('companyId') companyId: string): Promise<ItemResponseDto[]> {
    return this.itemsService.findAll(companyId);
  }

  @Get(':id')
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ): Promise<ItemResponseDto> {
    return this.itemsService.findOne(companyId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async update(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ): Promise<ItemResponseDto> {
    return this.itemsService.update(companyId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.itemsService.remove(companyId, id);
  }
}
