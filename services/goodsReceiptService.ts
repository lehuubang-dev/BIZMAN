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
        return response.data.content.map((item: any) => this.mapToListItem(item));
      }
      
      // Handle direct array in data: { data: [...] }
      if (response?.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => this.mapToListItem(item));
      }
      
      // Handle direct array response: [...]
      if (Array.isArray(response)) {
        return response.map((item: any) => this.mapToListItem(item));
      }
      
      console.warn('Unexpected goods receipts response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error fetching goods receipts:', error);
      throw error;
    }
  }

  /**
   * Get goods receipts by status
   */
  async getGoodsReceiptsByStatus(status: string, page: number = 0, size: number = 100): Promise<GoodsReceiptListItem[]> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/goods-receipts/get-goods-receipts-by-status?status=${status}&page=${page}&size=${size}&sort=createdAt,desc`
      );
      console.log('Goods Receipts by status API Response:', response);
      
      // Handle paginated response: { data: { content: [...] } }
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content.map((item: any) => this.mapToListItem(item));
      }
      
      // Handle direct array in data: { data: [...] }
      if (response?.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => this.mapToListItem(item));
      }
      
      // Handle direct array response: [...]
      if (Array.isArray(response)) {
        return response.map((item: any) => this.mapToListItem(item));
      }
      
      console.warn('Unexpected goods receipts by status response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error fetching goods receipts by status:', error);
      throw error;
    }
  }

  /**
   * Map API response to GoodsReceiptListItem
   */
  private mapToListItem(apiItem: any): GoodsReceiptListItem {
    return {
      id: apiItem.id,
      createdAt: apiItem.createdAt,
      updatedAt: apiItem.updatedAt,
      receiptCode: apiItem.receiptCode,
      receiptDate: apiItem.receiptDate,
      status: apiItem.status,
      subTotal: apiItem.subTotal,
      taxAmount: apiItem.taxAmount,
      discountAmount: apiItem.discountAmount,
      fee: apiItem.fee,
      totalAmount: apiItem.totalAmount,
      description: apiItem.description,
      note: apiItem.note,
      purchaseOrder: apiItem.purchaseOrder ? {
        id: apiItem.purchaseOrder.id,
        orderNumber: apiItem.purchaseOrder.orderNumber,
        orderDate: apiItem.purchaseOrder.orderDate,
        orderStatus: apiItem.purchaseOrder.orderStatus,
        subTotal: apiItem.purchaseOrder.subTotal,
        taxAmount: apiItem.purchaseOrder.taxAmount,
        totalAmount: apiItem.purchaseOrder.totalAmount,
      } : undefined,
      warehouse: {
        id: apiItem.warehouse.id,
        name: apiItem.warehouse.name,
        address: apiItem.warehouse.address,
        type: apiItem.warehouse.type,
        description: apiItem.warehouse.description,
      },
      supplier: {
        id: apiItem.supplier.id,
        code: apiItem.supplier.code,
        name: apiItem.supplier.name,
        address: apiItem.supplier.address,
        taxCode: apiItem.supplier.taxCode,
        phoneNumber: apiItem.supplier.phoneNumber,
        email: apiItem.supplier.email,
        supplierType: apiItem.supplier.supplierType,
      },
      products: (apiItem.products || []).map((product: any) => ({
        id: product.id,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        subTotal: product.subTotal,
        variant: {
          id: product.variant.id,
          name: product.variant.name,
          sku: product.variant.sku,
          model: product.variant.model,
          unit: product.variant.unit,
        },
      })),
    };
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
      const response = await apiClient.post<any>('/api/v1/goods-receipts/approve-goods-receipt', { id });
      console.log('Goods receipt status changed successfully:', response);
      return response;
    } catch (error: any) {
      console.error('Error changing goods receipt status:', error);
      
      // Xử lý lỗi từ API response
      if (error?.response?.data) {
        const apiError = error.response.data;
        if (apiError.code && apiError.message) {
          // Ném lỗi với format chuẩn từ API
          throw {
            code: apiError.code,
            message: apiError.message,
            status: apiError.status || error.response.status
          };
        }
      }
      
      throw error;
    }
  }

  /**
   * Delete goods receipt (only for DRAFT status)
   */
  async deleteGoodsReceipt(id: string): Promise<any> {
    try {
      console.log('Deleting goods receipt with ID:', id);
      const response = await apiClient.post<any>('/api/v1/goods-receipts/delete-goods-receipt', { id });
      console.log('Goods receipt deleted successfully:', response);
      return response;
    } catch (error: any) {
      console.error('Error deleting goods receipt:', error);
      
      // Xử lý lỗi từ API response  
      if (error?.response?.data) {
        const apiError = error.response.data;
        if (apiError.code && apiError.message) {
          // Ném lỗi với format chuẩn từ API
          throw {
            code: apiError.code,
            message: apiError.message,
            status: apiError.status || error.response.status
          };
        }
      }
      
      throw error;
    }
  }

  /**
   * Search goods receipts
   */
  async searchGoodsReceipts(search: string, page: number = 0, size: number = 10): Promise<GoodsReceiptListItem[]> {
    try {
      // Map Vietnamese status terms to English for API search
      const vietnameseToEnglish: Record<string, string> = {
        'nháp': 'DRAFT',
        'nhap': 'DRAFT', // without accent
        'đã nhập kho': 'RECEIVED',
        'da nhap kho': 'RECEIVED', // without accent
        'nhập kho': 'RECEIVED',
        'nhap kho': 'RECEIVED', // without accent
        'nhập một phần': 'PARTIAL',
        'nhap mot phan': 'PARTIAL', // without accent
        'hoàn thành một phần': 'PARTIAL_COMPLETED',
        'hoan thanh mot phan': 'PARTIAL_COMPLETED', // without accent
        'đã hủy': 'CANCELLED',
        'da huy': 'CANCELLED', // without accent
        'hủy': 'CANCELLED',
        'huy': 'CANCELLED' // without accent
      };

      let searchTerm = search;
      const lowerSearch = search.toLowerCase().trim();
      
      // Check if search term matches any Vietnamese status
      if (vietnameseToEnglish[lowerSearch]) {
        searchTerm = vietnameseToEnglish[lowerSearch];
      }
      
      const response = await apiClient.get<any>(
        `/api/v1/goods-receipts/search-goods-receipts?search=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}&sort=receiptDate,desc`
      );
      console.log('Search goods receipts response:', response);
      
      // Handle paginated response: { data: { content: [...] } }
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content.map((item: any) => this.mapToListItem(item));
      }
      
      // Handle direct array in data: { data: [...] }
      if (response?.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => this.mapToListItem(item));
      }
      
      console.warn('Unexpected search response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error searching goods receipts:', error);
      throw error;
    }
  }
}

export const goodsReceiptService = new GoodsReceiptService();
