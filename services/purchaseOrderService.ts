import { apiClient } from './api';
import { PurchaseOrder, PurchaseOrderListItem, CreatePurchaseOrderData } from '../types/purchaseOrder';

class PurchaseOrderService {
  /**
   * Get all purchase orders
   */
  async getPurchaseOrders(): Promise<PurchaseOrderListItem[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/purchase-orders/get-orders');
      console.log('Purchase Orders API Response:', response);
      
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
      
      console.warn('Unexpected purchase orders response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  }

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrderById(purchaseOrderId: string): Promise<PurchaseOrder | null> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/purchase-orders/get-order-by-id?purchaseOrderId=${purchaseOrderId}`
      );
      
      if (response?.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching purchase order detail:', error);
      throw error;
    }
  }

  /**
   * Get purchase orders by status
   */
  async getPurchaseOrdersByStatus(status: string): Promise<PurchaseOrderListItem[]> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/purchase-orders/get-order-by-status?status=${status}`
      );
      
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching purchase orders by status:', error);
      throw error;
    }
  }

  /**
   * Create a new purchase order
   */
  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/purchase-orders/create-order', data);
      return response;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  /**
   * Approve purchase order
   */
  async approvePurchaseOrder(id: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/purchase-orders/approve-order-status', { id });
      return response;
    } catch (error) {
      console.error('Error approving purchase order:', error);
      throw error;
    }
  }
}

export const purchaseOrderService = new PurchaseOrderService();
