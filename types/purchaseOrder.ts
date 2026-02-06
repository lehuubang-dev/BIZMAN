/**
 * Purchase Order Types
 */

export type OrderStatus = 'DRAFT' | 'APPROVED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface PurchaseOrderSupplier {
  id: string;
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
}

export interface PurchaseOrderWarehouse {
  id: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  name: string;
  address: string;
  type: string;
}

export interface PurchaseOrderContract {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  contractNumber: string;
  paymentTermDays: number;
  debtRecognitionMode: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate: string;
  signDate: string;
  totalValue: number;
}

export interface PurchaseOrderProduct {
  id: string;
  createdAt: string;
  updatedAt: string;
  productCategory: {
    id: string;
    name: string;
    description: string;
  };
  productGroup: {
    id: string;
    name: string;
    jobType: string;
    description: string;
    gtgttax: number;
    tncnntax: number;
  };
  brand: {
    id: string;
    name: string;
    description: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
  images: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
  quantity: number;
  note: string | null;
  expiredDate: string | null;
  taxPercent: number;
  discountPercent: number;
  unitPrice: number;
  totalPrice: number;
  finalPrice: number;
  purchaseValue: number;
  code: string;
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
}

export interface PurchaseOrderDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export interface PurchaseOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  supplier: PurchaseOrderSupplier;
  warehouse: PurchaseOrderWarehouse;
  contract: PurchaseOrderContract;
  products: PurchaseOrderProduct[];
  documents: PurchaseOrderDocument[];
  orderNumber: string;
  description: string | null;
  note: string;
  orderStatus: OrderStatus;
  orderDate: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PurchaseOrderListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
  description: string | null;
  note: string;
  orderStatus: OrderStatus;
  orderDate: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  supplier?: {
    id: string;
    name: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
}

export interface CreatePurchaseOrderProduct {
  variantId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  subTotal: number;
  totalPrice: number;
  note?: string;
}

export interface CreatePurchaseOrderData {
  supplier: string;
  warehouse: string;
  contract?: string;
  products: CreatePurchaseOrderProduct[];
  documents?: string[];
  orderDate: string;
  description?: string;
  note?: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}
