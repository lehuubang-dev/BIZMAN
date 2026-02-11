/**
 * Contract Types
 */

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type ContractType = 'PURCHASE' | 'SALE' | 'SERVICE';
export type DebtRecognitionMode = 'IMMEDIATE' | 'BY_COMPLETION' | 'BY_RECEIPT_PARTIAL';
export type TermStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface ContractSupplier {
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
  debtRecognitionMode: DebtRecognitionMode;
  debtDate: string | null;
  maxDebt: number;
}

export interface ContractDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export interface ContractTerm {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  note: string;
  status: TermStatus;
  paymentDate: string | null;
  dueDate: string | null;
  amount: number;
}

export interface ContractVariant {
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
}

export interface ContractItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  variant: ContractVariant;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  totalPrice: number;
  note: string;
}

export interface Contract {
  id: string;
  createdAt: string;
  updatedAt: string;
  supplier: ContractSupplier;
  documents: ContractDocument[];
  terms: ContractTerm[];
  items: ContractItem[];
  title: string;
  contractNumber: string;
  description: string | null;
  note: string | null;
  paymentTermDays: number;
  debtRecognitionMode: DebtRecognitionMode;
  contractType: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  signDate: string;
  totalValue: number;
}

export interface ContractListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  contractNumber: string;
  contractType: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  signDate: string;
  totalValue: number;
  supplier?: {
    id: string;
    name: string;
  };
}
