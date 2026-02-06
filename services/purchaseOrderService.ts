import { apiClient } from './api';
import { PurchaseOrder, PurchaseOrderListItem, CreatePurchaseOrderData } from '../types/purchaseOrder';

class PurchaseOrderService {
  /**
   * Get all purchase orders
   */
  async getPurchaseOrders(): Promise<PurchaseOrderListItem[]> {
    try {
      // Request with pagination params to get all orders sorted by newest first
      // size=100 to get more items, sort by orderDate descending
      const response = await apiClient.get<any>(
        '/api/v1/purchase-orders/get-orders?page=0&size=100&sort=orderDate,desc'
      );
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
      console.log('Creating purchase order with data:', JSON.stringify(data, null, 2));
      const response = await apiClient.post<any>('/api/v1/purchase-orders/create-order', data);
      console.log('Purchase order created successfully:', response);
      return response;
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Update an existing purchase order
   */
  async updatePurchaseOrder(data: any): Promise<any> {
    try {
      console.log('Updating purchase order with data:', JSON.stringify(data, null, 2));
      const response = await apiClient.post<any>('/api/v1/purchase-orders/update-order', data);
      console.log('Purchase order updated successfully:', response);
      return response;
    } catch (error: any) {
      console.error('Error updating purchase order:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
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

  /**
   * Delete purchase order (only for DRAFT status)
   */
  async deletePurchaseOrder(id: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/purchase-orders/delete-order', { id });
      return response;
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    }
  }

  /**
   * Cancel purchase order (only for APPROVED status)
   */
  async cancelPurchaseOrder(id: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/purchase-orders/cancel-order', { id });
      return response;
    } catch (error) {
      console.error('Error cancelling purchase order:', error);
      throw error;
    }
  }

  /**
   * Get all suppliers for dropdown
   */
  async getSuppliers(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/partners/get-suppliers');
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  /**
   * Get all warehouses for dropdown
   */
  async getWarehouses(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/warehouses/get-warehouses');
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  }

  /**
   * Get all contracts for dropdown
   */
  async getContracts(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/contracts/get-contracts');
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  /**
   * Get all products for dropdown
   */
  async getProducts(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/products/get-products');
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Search purchase orders
   */
  async searchPurchaseOrders(search: string, page: number = 0, size: number = 10): Promise<PurchaseOrderListItem[]> {
    try {
      // Map Vietnamese status terms to English for API search
      const vietnameseToEnglish: Record<string, string> = {
        'nháp': 'DRAFT',
        'nhap': 'DRAFT', // without accent
        'đã duyệt': 'APPROVED',
        'da duyet': 'APPROVED', // without accent
        'duyệt': 'APPROVED',
        'duyet': 'APPROVED', // without accent
        'đã hủy': 'CANCELLED',
        'da huy': 'CANCELLED', // without accent
        'hủy': 'CANCELLED',
        'huy': 'CANCELLED', // without accent
        'đã huỷ': 'CANCELLED', // alternative spelling
        'huỷ': 'CANCELLED',
      };

      let searchTerm = search;
      const lowerSearch = search.toLowerCase().trim();
      
      // Check if search term matches any Vietnamese status
      if (vietnameseToEnglish[lowerSearch]) {
        searchTerm = vietnameseToEnglish[lowerSearch];
      }
      
      const response = await apiClient.get<any>(
        `/api/v1/purchase-orders/search-orders?search=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}&sort=createdAt,desc`
      );
      console.log('Search purchase orders response:', response);
      
      // Handle paginated response: { data: { content: [...] } }
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      // Handle direct array in data: { data: [...] }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn('Unexpected search response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error searching purchase orders:', error);
      throw error;
    }
  }

  /**
   * Upload document - supports both file upload and document upload
   */
  async uploadDocument(file: any): Promise<string> {
    try {
      console.log('Uploading file:', { name: file.name, type: file.mimeType, uri: file.uri });
      
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
        name: file.name,
      } as any);
      
      // Try /api/v1/user/upload-document first (for documents)
      try {
        const response = await apiClient.post<any>('/api/v1/user/upload-document', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Document upload response (/api/v1/user/upload-document):', response);
        
        // Handle different response formats
        // Check at response level first (API might return object directly)
        if (response?.id) {
          console.log('Using document ID:', response.id);
          return response.id;
        }
        if (response?.filePath) {
          console.log('Using file path:', response.filePath);
          return response.filePath;
        }
        
        // Then check response.data
        // Backend returns string path directly
        if (typeof response?.data === 'string') {
          console.log('Using string response:', response.data);
          return response.data;
        }
        // Or object with id/path properties
        if (response?.data?.id) {
          console.log('Using data.id:', response.data.id);
          return response.data.id;
        }
        if (response?.data?.filePath) {
          console.log('Using data.filePath:', response.data.filePath);
          return response.data.filePath;
        }
        if (response?.data?.path) {
          console.log('Using data.path:', response.data.path);
          return response.data.path;
        }
        // Fallback: return any data
        if (response?.data) {
          console.log('Using fallback string conversion:', response.data);
          return String(response.data);
        }
      } catch (uploadError: any) {
        console.warn('Upload via /api/v1/user/upload-document failed, trying /api/v1/user/uploads?file:', uploadError);
        
        // Fallback to /api/v1/user/uploads?file
        const imgResponse = await apiClient.post<any>('/api/v1/user/uploads?file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Image upload response (/api/v1/user/uploads?file):', imgResponse);
        
        // Check at response level first
        if (imgResponse?.id) {
          console.log('Using image ID:', imgResponse.id);
          return imgResponse.id;
        }
        if (imgResponse?.filePath) {
          console.log('Using image file path:', imgResponse.filePath);
          return imgResponse.filePath;
        }
        
        // Then check response.data
        // Backend returns string path directly
        if (typeof imgResponse?.data === 'string') {
          console.log('Using string image response:', imgResponse.data);
          return imgResponse.data;
        }
        if (imgResponse?.data?.id) {
          console.log('Using image data.id:', imgResponse.data.id);
          return imgResponse.data.id;
        }
        if (imgResponse?.data?.filePath) {
          console.log('Using image data.filePath:', imgResponse.data.filePath);
          return imgResponse.data.filePath;
        }
        if (imgResponse?.data?.path) {
          console.log('Using image data.path:', imgResponse.data.path);
          return imgResponse.data.path;
        }
        if (imgResponse?.data) {
          console.log('Using fallback image string:', imgResponse.data);
          return String(imgResponse.data);
        }
      }
      
      throw new Error('Document upload failed - no valid response');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }
}

export const purchaseOrderService = new PurchaseOrderService();
