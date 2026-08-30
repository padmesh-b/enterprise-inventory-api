import { ItemStatus } from '@prisma/client';

export class ItemResponseDto {
  id!: string;
  sku!: string;
  title!: string;
  description!: string | null;
  quantity!: number;
  status!: ItemStatus;
  companyId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
