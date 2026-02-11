import { apiClient } from './api';
import { Product, ProductDisplayItem, GetProductsResponse } from '../types';

class ProductService {
  /**
   * Get all products
   */
  async getProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/products/get-products');
      console.log('Product API Response:', response);
      
      // Handle different response formats
      // Pagination format: { data: { content: [...] } }
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      // Direct array in data: { data: [...] }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Direct array response: [...]
      if (Array.isArray(response)) {
        return response;
      }
      
      console.warn('Unexpected product response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Search products by keyword
   */
  async searchProducts(keyword: string): Promise<Product[]> {
    try {
      if (!keyword || !keyword.trim()) {
        return this.getProducts();
      }
      
      const response = await apiClient.get<any>(
        `/api/v1/products/search-products?search=${encodeURIComponent(keyword)}`
      );
      console.log('Search Products API Response:', response);
      
      // Handle different response formats
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get products formatted for display
   * Shows only: primary image, name, unit, type, sellPrice, active
   */
  async getProductsForDisplay(): Promise<ProductDisplayItem[]> {
    const products = await this.getProducts();
    
    return products.map(product => ({
      id: product.id,
      image: product.images.find(img => img.isPrimary)?.imageUrl || null,
      name: product.name,
      unit: product.unit || 'cái',
      type: product.type,
      sellPrice: product.sellPrice || 0,
      active: product.active,
    }));
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(`/api/v1/products/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  /**
   * Get product detail by ID using provided endpoint format
   */
  async getProductDetail(id: string): Promise<Product | null> {
    try {
      console.log('📋 getProductDetail called with ID:', id);
      
      const response = await apiClient.get<any>(
        `/api/v1/products/get-product-by-id?productId=${id}`
      );
      
      console.log('📦 Product detail response:', response);
      
      // Expected format from API: { success, code, message, data: Product }
      // apiClient.get returns response.data, so structure is: { success, code, message, data: Product }
      if (response?.data && typeof response.data === 'object') {
        console.log('✅ Successfully parsed product data');
        return response.data as Product;
      }
      
      console.warn('⚠️ Unexpected response structure:', response);
      return null;
    } catch (error: any) {
      console.error('❌ Error fetching product detail:', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
      });
      throw error;
    }
  }

  /**
   * Activate a product
   */
  async activateProduct(id: string): Promise<any> {
    try {
      return await apiClient.post<any>('/api/v1/products/active-product', { id });
    } catch (error) {
      console.error('Error activating product:', error);
      throw error;
    }
  }

  /**
   * Deactivate a product
   */
  async deactivateProduct(id: string): Promise<any> {
    try {
      return await apiClient.post<any>('/api/v1/products/unactive-product', { id });
    } catch (error) {
      console.error('Error deactivating product:', error);
      throw error;
    }
  }

  /**
   * Format product for display
   */
  formatProductForDisplay(product: Product): ProductDisplayItem {
    return {
      id: product.id,
      image: product.images.find(img => img.isPrimary)?.imageUrl || null,
      name: product.name,
      unit: product.unit || 'cái',
      type: product.type,
      sellPrice: product.sellPrice || 0,
      active: product.active,
    };
  }

  /**
   * Get product categories
   */
  async getProductCategories(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/products/get-product-categories');
      return response?.data || response || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(data: { name: string; description: string }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/create-category', data);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(data: { id: string; name: string; description: string }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/update-category', data);
      return response;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/delete-category', { id });
      return response;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Get product groups
   */
  async getProductGroups(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/products/get-product-groups');
      return response?.data || response || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  /**
   * Create a new product group
   */
  async createGroup(data: { 
    groupId: string;
    name: string; 
    gtgttax: number;
    tncnntax: number;
    description: string;
    jobType: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/create-group', data);
      return response;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  /**
   * Update an existing product group
   */
  async updateGroup(data: { 
    id: string;
    groupId: string;
    name: string; 
    gtgttax: number;
    tncnntax: number;
    description: string;
    jobType: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/update-group', data);
      return response;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  /**
   * Delete a product group
   */
  async deleteGroup(id: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/delete-group', { id });
      return response;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  /**
   * Get brands
   */
  async getBrands(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/products/get-brands');
      return response?.data || response || [];
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  /**
   * Create a new brand
   */
  async createBrand(data: { name: string; description: string }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/create-brand', data);
      return response;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  }

  /**
   * Update an existing brand
   */
  async updateBrand(data: { id: string; name: string; description: string }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/update-brand', data);
      return response;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  }

  /**
   * Delete a brand
   */
  async deleteBrand(id: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/delete-brand', { id });
      return response;
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   */
  async createProduct(data: any): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/create-product', data);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(data: any): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/products/update-product', data);
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Get products by tags
   */
  async getProductsByTags(tagNames: string[]): Promise<Product[]> {
    try {
      const tagQuery = tagNames.join(',');
      const response = await apiClient.get<any>(
        `/api/v1/products/get-product-by-tags?tagNames=${encodeURIComponent(tagQuery)}`
      );
      
      console.log('Get products by tags API Response:', response);
      
      // Handle new API response format: { success, code, message, data: Product[] }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Handle paginated response: { data: { content: [...] } }
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      // Handle direct array response: [...]
      if (Array.isArray(response)) {
        return response;
      }
      
      console.warn('Unexpected response format for getProductsByTags:', response);
      return [];
    } catch (error: any) {
      console.error('Error fetching products by tags:', error);
      throw error;
    }
  }

  /**
   * Get all product variants
   */
  async getProductVariants(): Promise<any[]> {
    try {
      console.log('📦 Fetching all product variants...');
      const response = await apiClient.get<any>('/api/v1/products/get-product-variants');
      console.log('📦 Product variants API response:', response);
      
      // Handle paginated API response format: { success, code, message, data: { content: [...], totalElements: ... } }
      if (response?.success && response?.data?.content && Array.isArray(response.data.content)) {
        console.log('✅ Found variants in paginated response:', response.data.content.length, 'items');
        console.log('📋 Total elements:', response.data.totalElements);
        return response.data.content;
      }
      
      // Handle API response format: { success, code, message, data: [...] }
      if (response?.success && response?.data && Array.isArray(response.data)) {
        console.log('✅ Found variants in response.data:', response.data.length);
        return response.data;
      }
      
      // Fallback: direct array in data
      if (response?.data && Array.isArray(response.data)) {
        console.log('✅ Found variants in response.data (fallback):', response.data.length);
        return response.data;
      }
      
      // Fallback: paginated format without success flag
      if (response?.data?.content && Array.isArray(response.data.content)) {
        console.log('✅ Found variants in paginated response (no success flag):', response.data.content.length);
        return response.data.content;
      }
      
      // Fallback: direct array response
      if (Array.isArray(response)) {
        console.log('✅ Found variants in direct response:', response.length);
        return response;
      }
      
      console.warn('⚠️ Unexpected variants response format:', response);
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching product variants:', error);
      throw error;
    }
  }

  /**
   * Get product variant by ID
   */
  async getProductVariantById(variantId: string): Promise<any | null> {
    try {
      console.log('🔍 Fetching product variant by ID:', variantId);
      const response = await apiClient.get<any>(
        `/api/v1/products/get-product-variant-by-id?productVariantId=${variantId}`
      );
      console.log('📦 Product variant by ID API response:', response);
      
      // Handle API response format: { success, code, message, data: {...} }
      if (response?.success && response?.data) {
        console.log('✅ Found variant in response.data');
        return response.data;
      }
      
      // Fallback: direct data
      if (response?.data) {
        console.log('✅ Found variant in response.data (fallback)');
        return response.data;
      }
      
      // Fallback: direct response
      if (response && typeof response === 'object') {
        console.log('✅ Found variant in direct response');
        return response;
      }
      
      console.warn('⚠️ No variant found in response:', response);
      return null;
    } catch (error: any) {
      console.error('❌ Error fetching product variant by ID:', error);
      throw error;
    }
  }

  /**
   * Search product variants by keyword using API endpoint
   */
  async searchProductVariants(keyword: string): Promise<any[]> {
    try {
      if (!keyword || !keyword.trim()) {
        return this.getProductVariants();
      }
      
      console.log('🔍 Searching product variants via API with keyword:', keyword);
      
      const response = await apiClient.get<any>(
        `/api/v1/products/search-product-variants?search=${encodeURIComponent(keyword)}`
      );
      console.log('📦 Search product variants API response:', response);
      
      // Handle paginated API response format: { success, code, message, data: { content: [...] } }
      if (response?.success && response?.data?.content && Array.isArray(response.data.content)) {
        console.log('✅ Found variants in paginated search response:', response.data.content.length);
        return response.data.content;
      }
      
      // Handle API response format: { success, code, message, data: [...] }
      if (response?.success && response?.data && Array.isArray(response.data)) {
        console.log('✅ Found variants in search response.data:', response.data.length);
        return response.data;
      }
      
      // Fallback: direct array in data
      if (response?.data && Array.isArray(response.data)) {
        console.log('✅ Found variants in search response.data (fallback):', response.data.length);
        return response.data;
      }
      
      // Fallback: paginated format without success flag 
      if (response?.data?.content && Array.isArray(response.data.content)) {
        console.log('✅ Found variants in paginated search response (no success):', response.data.content.length);
        return response.data.content;
      }
      
      // Fallback: direct array response
      if (Array.isArray(response)) {
        console.log('✅ Found variants in search response (direct array):', response.length);
        return response;
      }
      
      console.warn('⚠️ Unexpected search variants response format:', response);
      return [];
    } catch (error: any) {
      console.error('❌ Error searching product variants:', error);
      throw error;
    }
  }

  /**
   * Get product variants filtered by supplier ID
   */
  async getProductVariantsBySupplierId(supplierId: string): Promise<any[]> {
    try {
      console.log('🔍 Getting product variants by supplier ID:', supplierId);
      
      const response = await apiClient.get<any>(
        `/api/v1/products/get-product-variant-by-supplier-id?supplierId=${supplierId}`
      );
      console.log('📦 Product variants by supplier API response:', response);
      
      // Handle paginated API response format: { success, code, message, data: { content: [...] } }
      if (response?.success && response?.data?.content && Array.isArray(response.data.content)) {
        console.log('✅ Found supplier-products in paginated response:', response.data.content.length);
        
        // Transform supplier-product relationships to variants with supplier info
        const transformedVariants = response.data.content.map((supplierProduct: any) => {
          const variant = supplierProduct.variant;
          if (!variant) {
            console.warn('⚠️ Supplier-product missing variant:', supplierProduct.id);
            return null;
          }
          
          return {
            // Core variant info
            id: variant.id,
            sku: variant.sku,
            name: variant.name,
            model: variant.model,
            partNumber: variant.partNumber,
            attributes: variant.attributes,
            unit: variant.unit,
            standardCost: variant.standardCost,
            lastPurchaseCost: variant.lastPurchaseCost,
            active: variant.active,
            product: variant.product,
            documents: variant.documents,
            supplier: variant.supplier,
            
            // Supplier-specific pricing and info
            supplierSku: supplierProduct.supplierSku,
            defaultUnitPrice: supplierProduct.defaultUnitPrice,
            leadTimeDays: supplierProduct.leadTimeDays,
            supplierProductActive: supplierProduct.active,
          };
        }).filter(Boolean); // Remove nulls
        
        console.log('✅ Transformed variants:', transformedVariants.length);
        return transformedVariants;
      }
      
      // Handle API response format: { success, code, message, data: [...] }
      if (response?.success && response?.data && Array.isArray(response.data)) {
        console.log('✅ Found supplier-products in response.data:', response.data.length);
        const transformedVariants = response.data.map((supplierProduct: any) => {
          const variant = supplierProduct.variant;
          if (!variant) return null;
          
          return {
            id: variant.id,
            sku: variant.sku,
            name: variant.name,
            model: variant.model,
            partNumber: variant.partNumber,
            attributes: variant.attributes,
            unit: variant.unit,
            standardCost: variant.standardCost,
            lastPurchaseCost: variant.lastPurchaseCost,
            active: variant.active,
            product: variant.product,
            documents: variant.documents,
            supplier: variant.supplier,
            supplierSku: supplierProduct.supplierSku,
            defaultUnitPrice: supplierProduct.defaultUnitPrice,
            leadTimeDays: supplierProduct.leadTimeDays,
            supplierProductActive: supplierProduct.active,
          };
        }).filter(Boolean);
        return transformedVariants;
      }
      
      // Fallback: direct array in data
      if (response?.data && Array.isArray(response.data)) {
        console.log('✅ Found supplier-products in response.data (fallback):', response.data.length);
        return response.data;
      }
      
      // Fallback: paginated format without success flag
      if (response?.data?.content && Array.isArray(response.data.content)) {
        console.log('✅ Found supplier-products in paginated response (no success):', response.data.content.length);
        return response.data.content;
      }
      
      console.warn('⚠️ Unexpected variants by supplier response format:', response);
      return [];
    } catch (error: any) {
      console.error('❌ Error getting product variants by supplier:', error);
      throw error;
    }
  }

  /**
   * Create a new product variant
   */
  async createProductVariant(data: any): Promise<any> {
    try {
      return await apiClient.post('/api/v1/products/create-product-variant', data);
    } catch (error) {
      console.error('Error creating product variant:', error);
      throw error;
    }
  }

  /**
   * Update an existing product variant
   */
  async updateProductVariant(data: any): Promise<any> {
    try {
      return await apiClient.post('/api/v1/products/update-product-variant', data);
    } catch (error) {
      console.error('Error updating product variant:', error);
      throw error;
    }
  }

  /**
   * Upload image for product - supports both upload endpoints
   */
  async uploadImage(file: any): Promise<string> {
    try {
      console.log('Uploading image:', { name: file.name, type: file.mimeType, uri: file.uri });
      
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'image/jpeg',
        name: file.name,
      } as any);
      
      // Try /api/v1/user/upload-document first
      try {
        const response = await apiClient.post<any>('/api/v1/user/upload-document', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Image upload response (/upload-document):', response);
        
        // Handle different response formats
        if (response?.id) return response.id;
        if (response?.filePath) return response.filePath;
        if (typeof response?.data === 'string') return response.data;
        if (response?.data?.id) return response.data.id;
        if (response?.data?.filePath) return response.data.filePath;
        if (response?.data?.path) return response.data.path;
        if (response?.data) return String(response.data);
      } catch (uploadError: any) {
        console.warn('Upload via /upload-document failed, trying /uploads:', uploadError);
        
        // Fallback to /api/v1/user/uploads
        const fallbackResponse = await apiClient.post<any>('/api/v1/user/uploads?file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Image upload response (/uploads):', fallbackResponse);
        
        if (typeof fallbackResponse?.data === 'string') return fallbackResponse.data;
        if (fallbackResponse?.data?.id) return fallbackResponse.data.id;
        if (fallbackResponse?.data?.filePath) return fallbackResponse.data.filePath;
        if (fallbackResponse?.data) return String(fallbackResponse.data);
      }
      
      throw new Error('Không thể xử lý phản hồi từ server');
    } catch (error: any) {
      console.error('Image upload error:', error);
      if (error?.response) {
        console.error('Error response:', error.response);
      }
      throw new Error(error?.message || 'Không thể tải ảnh lên');
    }
  }

  /**
   * Upload document for user
   */
  async uploadDocument(file: any): Promise<{id: string, fileName: string, filePath: string, uploadedAt: string}> {
    try {
      console.log('📎 Uploading document:', { name: file.name, type: file.type, size: file.size });
      
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri || file.path,
        type: file.type || 'application/pdf',
        name: file.name,
      } as any);
      
      const response = await apiClient.post<any>('/api/v1/user/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Document upload response:', response);
      
      // API response format: { id, createdAt, updatedAt, fileName, filePath, uploadedAt }
      if (response?.id && response?.fileName && response?.filePath) {
        return {
          id: response.id,
          fileName: response.fileName,
          filePath: response.filePath,
          uploadedAt: response.uploadedAt
        };
      }
      
      // Handle wrapped response
      if (response?.data?.id && response?.data?.fileName && response?.data?.filePath) {
        return {
          id: response.data.id,
          fileName: response.data.fileName,
          filePath: response.data.filePath,
          uploadedAt: response.data.uploadedAt
        };
      }
      
      throw new Error('Phản hồi không hợp lệ từ server');
    } catch (error: any) {
      console.error('❌ Error uploading document:', {
        message: error?.message,
        response: error?.response?.data,
      });
      throw new Error(error?.message || 'Không thể tải lên tài liệu');
    }
  }
}

export const productService = new ProductService();
