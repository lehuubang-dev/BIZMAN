/**
 * Contract Types
 */

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type ContractType = 'PURCHASE' | 'SALE' | 'SERVICE';
export type DebtRecognitionMode = 'IMMEDIATE' | 'BY_COMPLETION' | 'BY_PAYMENT';
export type TermStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

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
  dueDate: string;
  amount: number;
}

export interface ContractProduct {
  id: string;
  createdAt: string;
  updatedAt: string;
  sku: string;
  model: string;
  partNumber: string;
  serialNumber: string;
  name: string;
  unit: string;
  minStock: number;
  description: string;
  active: boolean;
  type: string;
  costPrice: number;
  sellPrice: number;
}

export interface ContractItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  product: ContractProduct;
  quantity: number;
  note: string;
  unitPrice: number;
  totalPrice: number;
  tax: number;
  discount: number;
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
