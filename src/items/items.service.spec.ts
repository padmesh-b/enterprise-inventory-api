import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ItemStatus } from '@prisma/client';
import { ItemsService } from './items.service';
import { IItemsRepository } from './repositories/items.repository.interface';

describe('ItemsService', () => {
  let service: ItemsService;
  let repository: any;

  const mockCompanyId = 'company-123';
  const mockItem = {
    id: 'item-1',
    sku: 'SKU-001',
    title: 'Test Laptop',
    description: 'A test laptop',
    quantity: 10,
    status: ItemStatus.IN_STOCK,
    companyId: mockCompanyId,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: IItemsRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if SKU already exists in company', async () => {
      repository.findBySku.mockResolvedValue(mockItem);

      await expect(
        service.create(mockCompanyId, {
          sku: 'SKU-001',
          title: 'Test Item',
          quantity: 5,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create an item and auto-calculate IN_STOCK status', async () => {
      repository.findBySku.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockItem);

      const result = await service.create(mockCompanyId, {
        sku: 'SKU-001',
        title: 'Test Laptop',
        quantity: 10,
      });

      expect(result.sku).toBe('SKU-001');
      expect(result.status).toBe(ItemStatus.IN_STOCK);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if item does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(mockCompanyId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return item if found', async () => {
      repository.findById.mockResolvedValue(mockItem);

      const result = await service.findOne(mockCompanyId, 'item-1');
      expect(result.id).toBe('item-1');
    });
  });
});
