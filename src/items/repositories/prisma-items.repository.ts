import { Injectable } from '@nestjs/common';
import { Item } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IItemsRepository } from './items.repository.interface';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';

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

  async findAll(companyId: string): Promise<Item[]> {
    return this.prisma.item.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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
}
