import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ItemStatus } from '@prisma/client';
import { IItemsRepository } from './repositories/items.repository.interface';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { ItemFilterDto } from './dto/item-filter.dto';
import { AdjustmentDto } from './dto/adjustment.dto';

@Injectable()
export class ItemsService {
  constructor(
    private readonly itemsRepository: IItemsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
    
    await this.invalidateSummaryCache(companyId);

    return this.mapToResponse(item);
  }

  async findAll(companyId: string, filters: ItemFilterDto = {}): Promise<{ data: ItemResponseDto[]; nextCursor: string | null; hasMore: boolean }> {
    const result = await this.itemsRepository.findAll(companyId, filters);
    return {
      data: result.data.map((item) => this.mapToResponse(item)),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
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
    
    await this.invalidateSummaryCache(companyId);

    return this.mapToResponse(updated);
  }

  async remove(companyId: string, id: string): Promise<{ message: string }> {
    const existing = await this.itemsRepository.findById(companyId, id);
    if (!existing) {
      throw new NotFoundException(`Item with ID '${id}' not found`);
    }

    await this.itemsRepository.softDelete(companyId, id);
    await this.invalidateSummaryCache(companyId);
    
    return { message: `Item with ID '${id}' successfully deleted` };
  }

  async adjustQuantity(companyId: string, id: string, dto: AdjustmentDto, userId: string): Promise<ItemResponseDto> {
    const updated = await this.itemsRepository.adjustQuantity(companyId, id, dto, userId);
    await this.invalidateSummaryCache(companyId);
    return this.mapToResponse(updated);
  }

  async getSummary(companyId: string): Promise<any> {
    const cacheKey = `cache:items:summary:${companyId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const items = await this.itemsRepository.findAll(companyId);
    
    const summary = {
      IN_STOCK: 0,
      LOW_STOCK: 0,
      OUT_OF_STOCK: 0,
      totalItems: 0,
    };

    items.data.forEach((item) => {
      summary[item.status]++;
      summary.totalItems += item.quantity;
    });

    await this.cacheManager.set(cacheKey, summary, 60000); // 60s TTL
    return summary;
  }

  private async invalidateSummaryCache(companyId: string): Promise<void> {
    const cacheKey = `cache:items:summary:${companyId}`;
    await this.cacheManager.del(cacheKey);
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
      category: item.category,
      quantity: item.quantity,
      status: item.status,
      companyId: item.companyId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
