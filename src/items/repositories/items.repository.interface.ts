import { Item } from '@prisma/client';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';

import { ItemFilterDto } from '../dto/item-filter.dto';
import { AdjustmentDto } from '../dto/adjustment.dto';

export abstract class IItemsRepository {
  abstract create(companyId: string, dto: CreateItemDto): Promise<Item>;
  abstract findById(companyId: string, id: string): Promise<Item | null>;
  abstract findBySku(companyId: string, sku: string): Promise<Item | null>;
  abstract findAll(companyId: string, filters?: ItemFilterDto): Promise<{ data: Item[]; nextCursor: string | null; hasMore: boolean }>;
  abstract update(companyId: string, id: string, dto: UpdateItemDto): Promise<Item>;
  abstract softDelete(companyId: string, id: string): Promise<Item>;
  abstract adjustQuantity(companyId: string, id: string, dto: AdjustmentDto, userId: string): Promise<Item>;
}
