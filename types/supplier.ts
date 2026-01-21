/**
 * Supplier Types
 */

export type SupplierType = 'COMPANY' | 'INDIVIDUAL';
export type DebtRecognitionMode = 'IMMEDIATE' | 'BY_RECEIPT_PARTIAL' | 'BY_COMPLETION';

export interface Supplier {
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
  supplierType: SupplierType;
  debtRecognitionMode: DebtRecognitionMode;
  debtDate: string | null;
  maxDebt: number;
}
