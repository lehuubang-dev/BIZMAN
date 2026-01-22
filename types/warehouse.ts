/**
 * Warehouse Types
 */

export type WarehouseType = 'MAIN' | 'TEMP';

export interface Warehouse {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  address: string;
  type: WarehouseType;
  description: string;
}

export interface WarehouseProduct {
  id: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  sellPrice: number;
  location: string;
  stack: number;
  expiredDate: string | null;
  images: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
}

export interface ProductDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  productCategory: {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string;
  };
  productGroup: {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    jobType: string;
    description: string;
    gtgttax: number;
    tncnntax: number;
  };
  brand: {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string;
  };
  tags: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
  }>;
  images: Array<{
    id: string;
    createdAt: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
  warehouse: {
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    name: string;
    address: string;
    type: WarehouseType;
  };
  sku: string;
  model: string;
  partNumber: string;
  serialNumber: string;
  name: string;
  unit: string;
  minStock: number;
  description: string;
  type: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  expiredDate: string | null;
  stack: number;
  location: string;
}
