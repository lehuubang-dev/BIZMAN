import { apiClient } from './api';
import { 
  PurchaseDebt, 
  PurchaseDebtListItem,
  SalesDebt,
  SalesDebtListItem
} from '../types/debt';

class DebtService {
  /**
   * Get all purchase debts
   */
  async getPurchaseDebts(): Promise<PurchaseDebtListItem[]> {
    try {
      const response = await apiClient.get<any>(
        '/api/v1/purchase-debts/get-purchase-debts?size=100'
      );
      console.log('Purchase Debts API Response:', response);
      
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
      
      console.warn('Unexpected purchase debts response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error fetching purchase debts:', error);
      throw error;
    }
  }

  /**
   * Get purchase debt by ID
   */
  async getPurchaseDebtById(id: string): Promise<PurchaseDebt | null> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/purchase-debts/get-purchase-debt-by-id?id=${id}`
      );
      console.log('Purchase Debt Detail API Response:', response);
      
      if (response?.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching purchase debt detail:', error);
      throw error;
    }
  }

  /**
   * Search purchase debts
   */
  async searchPurchaseDebts(keyword: string): Promise<PurchaseDebtListItem[]> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/purchase-debts/search-purchase-debts?search=${encodeURIComponent(keyword)}`
      );
      console.log('Search Purchase Debts API Response:', response);
      
      // Handle paginated response
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return response.data.content;
      }
      
      // Handle direct array
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error searching purchase debts:', error);
      throw error;
    }
  }

  /**
   * Get all sales debts (placeholder for future implementation)
   */
  async getSalesDebts(): Promise<SalesDebtListItem[]> {
    console.log('Sales debts API not yet implemented');
    return [];
  }

  /**
   * Get sales debt by ID (placeholder for future implementation)
   */
  async getSalesDebtById(id: string): Promise<SalesDebt | null> {
    console.log('Sales debt detail API not yet implemented');
    return null;
  }

  /**
   * Search sales debts (placeholder for future implementation)
   */
  async searchSalesDebts(keyword: string): Promise<SalesDebtListItem[]> {
    console.log('Search sales debts API not yet implemented');
    return [];
  }
}

export const debtService = new DebtService();
