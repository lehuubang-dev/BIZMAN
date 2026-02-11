// Goods Receipt Types

export type GoodsReceiptStatus = 'DRAFT' | 'RECEIVED' | 'PARTIAL' | 'PARTIAL_COMPLETED' | 'CANCELLED';

export interface GoodsReceiptProduct {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  variant: {
    id: string;
    name: string;
    sku?: string;
    model?: string;
    partNumber?: string;
    attributes?: any;
    unit?: string;
    standardCost?: number;
    lastPurchaseCost?: number;
    active?: boolean;
  };
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  totalPrice: number;
  note?: string;
  manufactureDate?: string;
  expiryDate?: string;
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
  purchaseOrder?: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    orderNumber: string;
    orderDate: string;
    orderStatus: string;
    subTotal: number;
    taxAmount: number;
    discountAmount?: number;
    totalAmount: number;
    description?: string;
    note?: string;
    documents?: any;
  };
  warehouse: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    name: string;
    address?: string;
    type?: string;
    description?: string;
    code?: string;
  };
  supplier: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    code: string;
    name: string;
    address?: string;
    taxCode?: string;
    phoneNumber?: string;
    email?: string;
    supplierType?: string;
    bankName?: string;
    bankAccount?: string;
    bankBranch?: string;
    paymentTermDays?: number;
    description?: string;
    active?: boolean;
    debtRecognitionMode?: string;
    debtDate?: string;
    maxDebt?: number;
  };
  documents: GoodsReceiptDocument[];
  products: GoodsReceiptProduct[];
  receiptCode: string;
  description?: string;
  note?: string;
  status: GoodsReceiptStatus;
  receiptDate: string;
  subTotal: number;
  taxAmount?: number;
  discountAmount?: number;
  fee?: number;
  totalAmount?: number;
}

export interface GoodsReceiptListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  receiptCode: string;
  receiptDate: string;
  status: GoodsReceiptStatus;
  subTotal: number;
  taxAmount?: number;
  discountAmount?: number;
  fee?: number;
  totalAmount: number;
  description?: string;
  note?: string;
  purchaseOrder?: {
    id: string;
    orderNumber: string;
    orderDate: string;
    orderStatus: string;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
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
  products: {
    id: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
    variant: {
      id: string;
      name: string;
      sku: string;
      model?: string;
      unit?: string;
    };
  }[];
}

export interface CreateGoodsReceiptProductData {
  variantId: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  note?: string;
  manufactureDate?: string;
  expiryDate?: string;
}

export interface CreateGoodsReceiptData {
  purchaseOrderId: string;
  warehouseId: string;
  supplierId: string;
  documents: string[];
  products: CreateGoodsReceiptProductData[];
  receiptDate: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  fee: number;
  totalAmount: number;
  description?: string;
  note?: string;
  status?: GoodsReceiptStatus;
}

export interface UpdateGoodsReceiptData extends CreateGoodsReceiptData {
  id: string;
}
