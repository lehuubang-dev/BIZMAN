import { apiClient } from './api';
import { Contract, ContractListItem } from '../types/contract';

class ContractService {
  /**
   * Get all contracts
   */
  async getContracts(): Promise<ContractListItem[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/contracts/get-contracts');
      console.log('Contracts API Response:', response);
      
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
      
      console.warn('Unexpected contracts response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  /**
   * Get contract by ID
   */
  async getContractById(id: string): Promise<Contract | null> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/contracts/get-contract-by-id?id=${id}`
      );
      
      if (response?.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching contract detail:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();
