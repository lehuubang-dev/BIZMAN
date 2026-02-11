// Debt-related types based on API responses

export type DebtStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIAL';

export type SupplierType = 'COMPANY' | 'INDIVIDUAL';

export type SupplierDebtRecognitionMode = 'BY_ORDER' | 'BY_RECEIPT' | 'BY_RECEIPT_PARTIAL';

// Supplier information
export interface DebtSupplier {
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
  description?: string;
  active: boolean;
  supplierType: SupplierType;
  debtRecognitionMode: SupplierDebtRecognitionMode;
  debtDate?: string | null;
  maxDebt: number;
}

// Goods Receipt information in debt
export interface DebtGoodsReceipt {
  id: string;
  createdAt: string;
  updatedAt: string;
  receiptCode: string;
  description: string;
  note: string;
  status: string;
  receiptDate: string;
  subTotal: number;
  taxAmount: number | null;
  discountAmount: number;
  fee: number;
  totalAmount: number | null;
}

// Full Purchase Debt detail
export interface PurchaseDebt {
  id: string;
  createdAt: string;
  updatedAt: string;
  goodsReceipt: DebtGoodsReceipt;
  supplier: DebtSupplier;
  description: string;
  note?: string | null;
  status: DebtStatus;
  dueDate: string | null;
  originalAmount: number;
  remainingAmount: number;
  paidAmount: number;
}

// Purchase Debt list item (same as full detail for now)
export interface PurchaseDebtListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  goodsReceipt: DebtGoodsReceipt;
  supplier: DebtSupplier;
  description: string;
  note?: string | null;
  status: DebtStatus;
  dueDate: string | null;
  originalAmount: number;
  remainingAmount: number;
  paidAmount: number;
}

// Sales Debt types (placeholder for future implementation)
export interface SalesDebt {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Will be defined when sales debt API is available
}

export interface SalesDebtListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Will be defined when sales debt API is available
}
