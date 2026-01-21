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
  groupId: string;
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
}

export interface Product {
  id: string;
  createdAt: string;
  updatedAt: string;
  productCategory: ProductCategory;
  productGroup: ProductGroup;
  brand: ProductBrand;
  tags: ProductTag[];
  images: ProductImage[];
  sku: string;
  productCode: string;
  name: string;
  description: string;
  type: string;
  unit: string;
  model: string;
  partNumber: string;
  serialNumber: string;
  costPrice: number;
  sellPrice: number;
  minStock: number;
  active: boolean;
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
