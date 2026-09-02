import { Injectable } from '@nestjs/common';
import { Item } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IItemsRepository } from './items.repository.interface';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemFilterDto } from '../dto/item-filter.dto';
import { AdjustmentDto } from '../dto/adjustment.dto';

@Injectable()
export class PrismaItemsRepository implements IItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateItemDto): Promise<Item> {
    return this.prisma.item.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async findById(companyId: string, id: string): Promise<Item | null> {
    return this.prisma.item.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });
  }

  async findBySku(companyId: string, sku: string): Promise<Item | null> {
    return this.prisma.item.findFirst({
      where: {
        sku,
        companyId,
        deletedAt: null,
      },
    });
  }

  async findAll(companyId: string, filters: ItemFilterDto = {}): Promise<{ data: Item[]; nextCursor: string | null; hasMore: boolean }> {
    const { cursor, limit = 10, status, search, category, minQuantity, maxQuantity } = filters;

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    
    if (minQuantity !== undefined || maxQuantity !== undefined) {
      where.quantity = {};
      if (minQuantity !== undefined) where.quantity.gte = minQuantity;
      if (maxQuantity !== undefined) where.quantity.lte = maxQuantity;
    }

    const items = await this.prisma.item.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        id: 'asc', // Cursor pagination usually relies on sequential stable id or created_at
      },
    });

    let hasMore = false;
    let nextCursor: string | null = null;

    if (items.length > limit) {
      hasMore = true;
      const nextItem = items.pop();
      nextCursor = items[items.length - 1].id;
    } else if (items.length > 0) {
      nextCursor = items[items.length - 1].id;
    }

    return {
      data: items,
      nextCursor: hasMore ? nextCursor : null,
      hasMore,
    };
  }

  async update(companyId: string, id: string, dto: UpdateItemDto): Promise<Item> {
    return this.prisma.item.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async softDelete(companyId: string, id: string): Promise<Item> {
    return this.prisma.item.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async adjustQuantity(companyId: string, id: string, dto: AdjustmentDto, userId: string): Promise<Item> {
    return this.prisma.$transaction(async (prisma) => {
      const item = await prisma.item.findFirst({
        where: { id, companyId, deletedAt: null },
      });

      if (!item) {
        throw new Error('Item not found');
      }

      const updatedItem = await prisma.item.update({
        where: { id },
        data: {
          quantity: item.quantity + dto.quantityChange,
        },
      });

      if (updatedItem.quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }

      await prisma.auditLog.create({
        data: {
          companyId,
          userId,
          entity: 'Item',
          entityId: id,
          action: 'ADJUST_QUANTITY',
          before: { quantity: item.quantity },
          after: { quantity: updatedItem.quantity, reason: dto.reason },
        },
      });

      return updatedItem;
    });
  }
}
