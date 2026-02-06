/**
 * Product Types
 */

export interface ProductImage {
  id: string;
  createdAt: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductTag {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
}

export interface ProductBrand {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
}

export interface ProductGroup {
  id: string;
  createdAt: string;
  updatedAt: string;
  groupId?: string;
  name: string;
  description: string;
  jobType: string;
  tncnntax: number;
  gtgttax: number;
}

export interface ProductCategory {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  profitMargin?: number;
}

export interface ProductVariant {
  id: string;
  createdAt: string;
  updatedAt: string;
  sku: string;
  name: string;
  model?: string;
  partNumber?: string;
  attributes?: Record<string, any>;
  unit: string;
  standardCost: number;
  lastPurchaseCost?: number;
  active: boolean;
  product?: Product;
  documents?: ProductDocument[];
  supplier?: ProductSupplier;
}

export interface ProductDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export interface ProductSupplier {
  id: string;
  createdAt: string;
  updatedAt: string;
  code: string;
  name: string;
  address?: string;
  taxCode?: string;
  phoneNumber?: string;
  email?: string;
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  paymentTermDays?: number;
  description?: string;
  active: boolean;
  supplierType: string;
  debtRecognitionMode?: string;
  debtDate?: string | null;
  maxDebt?: number;
}

export interface Product {
  id: string;
  createdAt: string;
  updatedAt: string;
  productCategory?: ProductCategory | null;
  productGroup?: ProductGroup | null;
  brand?: ProductBrand | null;
  tags: ProductTag[];
  images: ProductImage[];
  variants?: ProductVariant[];
  code: string;
  name: string;
  description: string;
  type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
  active: boolean;
  // Legacy fields for backward compatibility
  sku?: string;
  productCode?: string;
  unit?: string;
  model?: string;
  partNumber?: string;
  serialNumber?: string;
  costPrice?: number;
  sellPrice?: number;
  minStock?: number;
}

export interface ProductDisplayItem {
  id: string;
  image: string | null;
  name: string;
  unit: string;
  type: string;
  sellPrice: number;
  active: boolean;
}

export interface GetProductsResponse {
  success: boolean;
  code: string;
  message: string;
  data: Product[];
}

export interface CreateProductRequest {
  productCategoryId?: string;
  productGroupId?: string;
  brandId?: string;
  tags: string[];
  images: string[];
  name: string;
  description: string;
  type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
  variants?: CreateProductVariantRequest[];
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string;
}

export interface CreateProductVariantRequest {
  sku: string;
  name: string;
  model?: string;
  partNumber?: string;
  attributes?: Record<string, any>;
  unit: string;
  standardCost: number;
  documentIds?: string[];
}

export interface CreateProductVariantStandaloneRequest extends CreateProductVariantRequest {
  productId: string;
}

export interface UpdateProductVariantRequest extends CreateProductVariantRequest {
  id: string;
}

export interface GetProductVariantsResponse {
  success: boolean;
  code: string;
  message: string;
  data: ProductVariant[];
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}
