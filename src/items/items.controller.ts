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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Inventory Items')
@ApiBearerAuth()
@Controller('v1/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new inventory item (Admin/Manager)' })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateItemDto,
  ): Promise<ItemResponseDto> {
    return this.itemsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active inventory items for tenant company' })
  async findAll(@CurrentUser('companyId') companyId: string): Promise<ItemResponseDto[]> {
    return this.itemsService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific inventory item by ID' })
  async findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ): Promise<ItemResponseDto> {
    return this.itemsService.findOne(companyId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update an inventory item (Admin/Manager)' })
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
  @ApiOperation({ summary: 'Soft delete an inventory item (Admin/Manager)' })
  async remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.itemsService.remove(companyId, id);
  }
}
