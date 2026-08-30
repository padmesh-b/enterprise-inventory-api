import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ItemStatus } from '@prisma/client';
import { IItemsRepository } from './repositories/items.repository.interface';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly itemsRepository: IItemsRepository) {}

  async create(companyId: string, dto: CreateItemDto): Promise<ItemResponseDto> {
    const existing = await this.itemsRepository.findBySku(companyId, dto.sku);
    if (existing) {
      throw new ConflictException(`Item with SKU '${dto.sku}' already exists in your company`);
    }

    const status = dto.status || this.calculateStatus(dto.quantity);
    const item = await this.itemsRepository.create(companyId, {
      ...dto,
      status,
    });

    return this.mapToResponse(item);
  }

  async findAll(companyId: string): Promise<ItemResponseDto[]> {
    const items = await this.itemsRepository.findAll(companyId);
    return items.map((item) => this.mapToResponse(item));
  }

  async findOne(companyId: string, id: string): Promise<ItemResponseDto> {
    const item = await this.itemsRepository.findById(companyId, id);
    if (!item) {
      throw new NotFoundException(`Item with ID '${id}' not found`);
    }
    return this.mapToResponse(item);
  }

  async update(companyId: string, id: string, dto: UpdateItemDto): Promise<ItemResponseDto> {
    const existing = await this.itemsRepository.findById(companyId, id);
    if (!existing) {
      throw new NotFoundException(`Item with ID '${id}' not found`);
    }

    const quantity = dto.quantity !== undefined ? dto.quantity : existing.quantity;
    const status = dto.status || this.calculateStatus(quantity);

    const updated = await this.itemsRepository.update(companyId, id, {
      ...dto,
      status,
    });

    return this.mapToResponse(updated);
  }

  async remove(companyId: string, id: string): Promise<{ message: string }> {
    const existing = await this.itemsRepository.findById(companyId, id);
    if (!existing) {
      throw new NotFoundException(`Item with ID '${id}' not found`);
    }

    await this.itemsRepository.softDelete(companyId, id);
    return { message: `Item with ID '${id}' successfully deleted` };
  }

  private calculateStatus(quantity: number): ItemStatus {
    if (quantity <= 0) return ItemStatus.OUT_OF_STOCK;
    if (quantity <= 5) return ItemStatus.LOW_STOCK;
    return ItemStatus.IN_STOCK;
  }

  private mapToResponse(item: any): ItemResponseDto {
    return {
      id: item.id,
      sku: item.sku,
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      status: item.status,
      companyId: item.companyId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
