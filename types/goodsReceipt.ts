// Goods Receipt Types

export type GoodsReceiptStatus = 'DRAFT' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';

export interface GoodsReceiptProduct {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  product: {
    id: string;
    name: string;
    sku?: string;
    model?: string;
    partNumber?: string;
    serialNumber?: string;
    unit?: string;
    costPrice?: number;
    sellPrice?: number;
  };
  productId?: string;
  location: string;
  stack: number;
  quantity: number;
  note?: string;
  unitPrice: number;
  totalPrice: number;
  fee: number;
}

export interface GoodsReceiptDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export interface GoodsReceipt {
  id: string;
  createdAt: string;
  updatedAt: string;
  purchaseOrder: {
    id: string;
    orderNumber: string;
    orderDate: string;
    orderStatus: string;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
    description?: string;
  };
  warehouse: {
    id: string;
    name: string;
    address?: string;
    type?: string;
    description?: string;
  };
  supplier: {
    id: string;
    code: string;
    name: string;
    address?: string;
    taxCode?: string;
    phoneNumber?: string;
    email?: string;
    supplierType?: string;
  };
  documents: GoodsReceiptDocument[];
  products: GoodsReceiptProduct[];
  receiptCode: string;
  description?: string;
  note?: string;
  status: GoodsReceiptStatus;
  receiptDate: string;
  subTotal: number;
}

export interface GoodsReceiptListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  receiptCode: string;
  receiptDate: string;
  status: GoodsReceiptStatus;
  subTotal: number;
  note?: string;
  purchaseOrder?: {
    id: string;
    orderNumber: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
}

export interface CreateGoodsReceiptProductData {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  location: string;
  stack: number;
  fee: number;
  note?: string;
}

export interface CreateGoodsReceiptData {
  purchaseOrderId: string;
  warehouseId: string;
  supplierId: string;
  documents: string[];
  products: CreateGoodsReceiptProductData[];
  description?: string;
  note?: string;
  status: GoodsReceiptStatus;
  receiptDate: string;
  subTotal: number;
}

export interface UpdateGoodsReceiptData extends CreateGoodsReceiptData {
  id: string;
}
