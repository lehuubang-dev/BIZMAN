import { apiClient } from './api';
import { 
  GoodsReceipt, 
  GoodsReceiptListItem, 
  CreateGoodsReceiptData,
  UpdateGoodsReceiptData
} from '../types/goodsReceipt';

class GoodsReceiptService {
  /**
   * Get all goods receipts
   */
  async getGoodsReceipts(): Promise<GoodsReceiptListItem[]> {
    try {
      const response = await apiClient.get<any>(
        '/api/v1/goods-receipts/get-goods-receipts?page=0&size=100&sort=receiptDate,desc'
      );
      console.log('Goods Receipts API Response:', response);
      
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
      
      console.warn('Unexpected goods receipts response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error fetching goods receipts:', error);
      throw error;
    }
  }

  /**
   * Get goods receipt by ID
   */
  async getGoodsReceiptById(id: string): Promise<GoodsReceipt | null> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/goods-receipts/get-goods-receipt-by-id?id=${id}`
      );
      
      if (response?.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching goods receipt detail:', error);
      throw error;
    }
  }

  /**
   * Create a new goods receipt
   */
  async createGoodsReceipt(data: CreateGoodsReceiptData): Promise<any> {
    try {
      console.log('Creating goods receipt with data:', JSON.stringify(data, null, 2));
      const response = await apiClient.post<any>('/api/v1/goods-receipts/create-goods-receipt', data);
      console.log('Goods receipt created successfully:', response);
      return response;
    } catch (error: any) {
      console.error('Error creating goods receipt:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Update an existing goods receipt
   */
  async updateGoodsReceipt(data: UpdateGoodsReceiptData): Promise<any> {
    try {
      console.log('Updating goods receipt with data:', JSON.stringify(data, null, 2));
      const response = await apiClient.post<any>('/api/v1/goods-receipts/update-goods-receipt', data);
      console.log('Goods receipt updated successfully:', response);
      return response;
    } catch (error: any) {
      console.error('Error updating goods receipt:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Change goods receipt status (approve/cancel)
   */
  async changeGoodsReceiptStatus(id: string): Promise<any> {
    try {
      console.log('Changing goods receipt status for ID:', id);
      const response = await apiClient.post<any>('/api/v1/goods-receipts/change-goods-receipt-status', { id });
      console.log('Goods receipt status changed successfully:', response);
      return response;
    } catch (error) {
      console.error('Error changing goods receipt status:', error);
      throw error;
    }
  }
}

export const goodsReceiptService = new GoodsReceiptService();
