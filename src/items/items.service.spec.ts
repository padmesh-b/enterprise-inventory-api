import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ItemStatus } from '@prisma/client';
import { ItemsService } from './items.service';
import { IItemsRepository } from './repositories/items.repository.interface';

describe('ItemsService', () => {
  let service: ItemsService;
  let repository: any;
  let cacheManager: any;

  const mockCompanyId = 'company-123';
  const mockUserId = 'user-456';
  const mockItem = {
    id: 'item-1',
    sku: 'SKU-001',
    title: 'Test Laptop',
    description: 'A test laptop',
    category: 'Electronics',
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
      adjustQuantity: jest.fn(),
    };

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: IItemsRepository,
          useValue: repository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
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

    it('should create an item, auto-calculate IN_STOCK status and invalidate cache', async () => {
      repository.findBySku.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockItem);

      const result = await service.create(mockCompanyId, {
        sku: 'SKU-001',
        title: 'Test Laptop',
        quantity: 10,
      });

      expect(result.sku).toBe('SKU-001');
      expect(result.status).toBe(ItemStatus.IN_STOCK);
      expect(cacheManager.del).toHaveBeenCalledWith(`cache:items:summary:${mockCompanyId}`);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if item does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(mockCompanyId, 'non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should return item if found', async () => {
      repository.findById.mockResolvedValue(mockItem);

      const result = await service.findOne(mockCompanyId, 'item-1');
      expect(result.id).toBe('item-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated and mapped items', async () => {
      repository.findAll.mockResolvedValue({ data: [mockItem], nextCursor: null, hasMore: false });

      const result = await service.findAll(mockCompanyId, {});
      expect(result.data.length).toBe(1);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if item not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.update(mockCompanyId, 'item-1', {})).rejects.toThrow(NotFoundException);
    });

    it('should update item and invalidate cache', async () => {
      repository.findById.mockResolvedValue(mockItem);
      repository.update.mockResolvedValue({ ...mockItem, title: 'Updated' });

      const result = await service.update(mockCompanyId, 'item-1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
      expect(cacheManager.del).toHaveBeenCalledWith(`cache:items:summary:${mockCompanyId}`);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if item not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.remove(mockCompanyId, 'item-1')).rejects.toThrow(NotFoundException);
    });

    it('should soft delete and invalidate cache', async () => {
      repository.findById.mockResolvedValue(mockItem);
      repository.softDelete.mockResolvedValue(mockItem);

      const result = await service.remove(mockCompanyId, 'item-1');
      expect(result.message).toBe("Item with ID 'item-1' successfully deleted");
      expect(cacheManager.del).toHaveBeenCalledWith(`cache:items:summary:${mockCompanyId}`);
    });
  });

  describe('adjustQuantity', () => {
    it('should adjust quantity and invalidate cache', async () => {
      repository.adjustQuantity.mockResolvedValue({ ...mockItem, quantity: 15 });

      const result = await service.adjustQuantity(mockCompanyId, 'item-1', { quantityChange: 5, reason: 'restock' }, mockUserId);
      expect(result.quantity).toBe(15);
      expect(cacheManager.del).toHaveBeenCalledWith(`cache:items:summary:${mockCompanyId}`);
    });
  });

  describe('getSummary', () => {
    it('should return from cache if present', async () => {
      cacheManager.get.mockResolvedValue({ totalItems: 100 });
      const result = await service.getSummary(mockCompanyId);
      expect(result.totalItems).toBe(100);
      expect(repository.findAll).not.toHaveBeenCalled();
    });

    it('should calculate and cache if not in cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findAll.mockResolvedValue({ data: [mockItem], nextCursor: null, hasMore: false });

      const result = await service.getSummary(mockCompanyId);
      expect(result.IN_STOCK).toBe(1);
      expect(result.totalItems).toBe(10);
      expect(cacheManager.set).toHaveBeenCalledWith(`cache:items:summary:${mockCompanyId}`, expect.any(Object), 60000);
    });
  });
});
