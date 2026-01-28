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

// Purchase Order information in debt
export interface DebtPurchaseOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
  description?: string | null;
  note?: string | null;
  orderStatus: string;
  orderDate: string;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
}

// Full Purchase Debt detail
export interface PurchaseDebt {
  id: string;
  createdAt: string;
  updatedAt: string;
  purchaseOrder: DebtPurchaseOrder;
  supplier: DebtSupplier;
  description: string;
  note?: string | null;
  status: DebtStatus;
  dueDate: string;
  originalAmount: number;
  remainingAmount: number;
  paidAmount: number;
}

// Purchase Debt list item (same as full detail for now)
export interface PurchaseDebtListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  purchaseOrder: DebtPurchaseOrder;
  supplier: DebtSupplier;
  description: string;
  note?: string | null;
  status: DebtStatus;
  dueDate: string;
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
