/**
 * Expense Types
 */

export type ExpenseType = 'PURCHASE_ORDER' | 'SALES_ORDER' | 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'RENT' | 'SALARY' | 'OTHER';
export type ExpenseStatus = 'POSTED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | null;
export type OrderStatus = 'DRAFT' | 'APPROVED' | 'CANCELLED';

export interface PurchaseOrder {
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
}

export interface Expense {
  id: string;
  createdAt: string;
  updatedAt: string;
  purchaseOrder: PurchaseOrder | null;
  description: string;
  note: string;
  type: ExpenseType;
  status: ExpenseStatus;
  paymentStatus: PaymentStatus;
  expenseDate: string;
  amount: number;
}
