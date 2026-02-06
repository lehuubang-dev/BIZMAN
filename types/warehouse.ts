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
  images?: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
}

// New API structure for warehouse stock items
export interface WarehouseStockItem {
  warehouseStock: {
    id: string;
    createdAt: string | null;
    updatedAt: string;
    note: string;
    quantityOnHand: number;
    quantityAvailable: number;
    quantityReserved: number;
    location: string;
    lastMovementDate: string;
    warehouse: {
      id: string;
      createdAt: string;
      updatedAt: string;
      code: string | null;
      description: string;
      name: string;
      address: string;
      type: WarehouseType;
    };
  };
  productBatch: {
    id: string;
    createdAt: string;
    updatedAt: string;
    batchCode: string;
    manufactureDate: string;
    expiryDate: string;
    receivedDate: string;
    quantityReceived: number;
    quantityRemaining: number;
    costPrice: number;
    productVariant: {
      id: string;
      createdAt: string;
      updatedAt: string;
      sku: string;
      name: string;
      model: string;
      partNumber: string;
      attributes: Record<string, any>;
      unit: string;
      standardCost: number;
      lastPurchaseCost: number;
      active: boolean;
      product: {
        id: string;
        createdAt: string;
        updatedAt: string;
        productCategory: {
          id: string;
          createdAt: string;
          updatedAt: string;
          name: string;
          profitMargin: number;
          description: string;
        };
        productGroup: {
          id: string;
          createdAt: string;
          updatedAt: string;
          name: string;
          jobType: string;
          description: string;
          tncnntax: number;
          gtgttax: number;
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
        code: string;
        name: string;
        active: boolean;
        description: string;
        type: string;
      };
      documents: Array<{
        id: string;
        createdAt: string;
        updatedAt: string;
        fileName: string;
        filePath: string;
        uploadedAt: string;
      }>;
      supplier: {
        id: string;
        createdAt: string;
        updatedAt: string;
        code: string;
        name: string;
        address: string;
        taxCode: string;
        phoneNumber: string;
        email: string;
        bankName: string;
        bankAccount: string;
        bankBranch: string;
        paymentTermDays: number;
        description: string;
        active: boolean;
        supplierType: string;
        debtRecognitionMode: string;
        debtDate: string | null;
        maxDebt: number;
      };
    };
  };
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
