import { apiClient } from './api';
import { Warehouse, WarehouseProduct, ProductDetail } from '../types/warehouse';

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
   * Get products in warehouse
   */
  async getWarehouseProducts(warehouseId: string): Promise<WarehouseProduct[]> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/warehouses/get-products-warehouse?warehouseId=${warehouseId}`
      );
      
      // Handle paginated response
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
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
  async searchWarehouseProducts(warehouseId: string, filter: string): Promise<WarehouseProduct[]> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/warehouses/get-products-warehouse-filter?warehouseId=${warehouseId}&filter=${filter}`
      );
      
      // Handle paginated response
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error searching warehouse products:', error);
      throw error;
    }
  }

  /**
   * Get product detail by ID
   */
  async getProductWarehouseById(productId: string, warehouseId: string): Promise<ProductDetail | null> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/warehouses/get-product-warehouse-by-id?productId=${productId}&warehouseId=${warehouseId}`
      );
      
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
