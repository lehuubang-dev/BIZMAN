import { apiClient } from './api';
import { Warehouse, WarehouseProduct, ProductDetail, WarehouseStockItem } from '../types/warehouse';

class WarehouseService {
  /**
   * Get all warehouses
   */
  async getWarehouses(): Promise<Warehouse[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/warehouses/get-warehouses');
      console.log('Warehouse API Response:', response);
      
      // Handle paginated response: { data: { content: [...] } }
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      // Handle direct array in data: { data: [...] }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Handle direct array response: [...]
      if (Array.isArray(response)) {
        return response;
      }
      
      console.warn('Unexpected warehouse response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  }

  /**
   * Search warehouses
   */
  async searchWarehouses(search: string, page = 0, size = 10): Promise<Warehouse[]> {
    try {
      const url = `/api/v1/warehouses/search-warehouses?search=${encodeURIComponent(search)}&page=${page}&size=${size}`;
      console.log('Searching warehouses with URL:', url);
      
      const response = await apiClient.get<any>(url);
      console.log('Warehouse Search API Response:', response);
      
      // Handle paginated response: { data: { content: [...] } }
      if (response?.data?.content && Array.isArray(response.data.content)) {
        console.log(`Found ${response.data.content.length} warehouses`);
        return response.data.content;
      }
      
      // Handle direct array in data: { data: [...] }
      if (response?.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} warehouses (direct array)`);
        return response.data;
      }
      
      // Handle direct array response: [...]
      if (Array.isArray(response)) {
        console.log(`Found ${response.length} warehouses (direct response)`);
        return response;
      }
      
      console.warn('Unexpected warehouse search response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error searching warehouses:', error);
      // Return more specific error messages
      if (error?.response?.status === 404) {
        throw new Error('Không tìm thấy API tìm kiếm kho hàng');
      } else if (error?.response?.status >= 500) {
        throw new Error('Lỗi server, vui lòng thử lại sau');
      } else if (error?.message) {
        throw new Error(`Lỗi tìm kiếm: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get products in warehouse
   */
  async getWarehouseProducts(warehouseId: string, page = 0, size = 20): Promise<WarehouseStockItem[]> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/warehouses/get-products-warehouse?warehouseId=${warehouseId}&page=${page}&size=${size}&sort=createdAt,desc`
      );
      
      console.log('Warehouse products API response:', response);
      
      // Handle new API response format: { success, code, message, data: { content: [...] } }
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching warehouse products:', error);
      throw error;
    }
  }

  /**
   * Search/filter products in warehouse
   */
  async searchWarehouseProducts(warehouseId: string, filter: string, page = 0, size = 20): Promise<WarehouseStockItem[]> {
    try {
      // For now, we'll use the same API and filter client-side
      // TODO: Update when search API is available
      const allProducts = await this.getWarehouseProducts(warehouseId, page, size);
      
      if (!filter.trim()) {
        return allProducts;
      }
      
      const searchTerm = filter.toLowerCase();
      return allProducts.filter(item => {
        const productName = item.productBatch.productVariant.name.toLowerCase();
        const sku = item.productBatch.productVariant.sku.toLowerCase();
        const batchCode = item.productBatch.batchCode.toLowerCase();
        
        return productName.includes(searchTerm) || 
               sku.includes(searchTerm) || 
               batchCode.includes(searchTerm);
      });
    } catch (error) {
      console.error('Error searching warehouse products:', error);
      throw error;
    }
  }

  /**
   * Get product detail by batch ID and warehouse ID
   */
  async getProductWarehouseById(batchId: string, warehouseId: string): Promise<WarehouseStockItem | null> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/warehouses/get-product-warehouse-by-id?batchId=${batchId}&warehouseId=${warehouseId}`
      );
      
      console.log('Product warehouse detail API response:', response);
      
      // Handle new API response format: { success, code, message, data: {...} }
      if (response?.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching product detail:', error);
      throw error;
    }
  }

  /**
   * Create a new warehouse
   */
  async createWarehouse(data: {
    name: string;
    address: string;
    type: string;
    description: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/warehouses/create-warehouse', data);
      return response;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  }

  /**
   * Update an existing warehouse
   */
  async updateWarehouse(data: {
    id: string;
    name: string;
    address: string;
    type: string;
    description?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/warehouses/update-warehouse', data);
      return response;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      throw error;
    }
  }

  /**
   * Delete a warehouse
   */
  async deleteWarehouse(id: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/warehouses/delete-warehouse', { id });
      return response;
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  }
}

export const warehouseService = new WarehouseService();
