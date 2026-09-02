import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { IItemsRepository } from './repositories/items.repository.interface';
import { PrismaItemsRepository } from './repositories/prisma-items.repository';

@Module({
  imports: [CacheModule.register()],
  controllers: [ItemsController],
  providers: [
    ItemsService,
    {
      provide: IItemsRepository,
      useClass: PrismaItemsRepository,
    },
  ],
  exports: [ItemsService, IItemsRepository],
})
export class ItemsModule {}
