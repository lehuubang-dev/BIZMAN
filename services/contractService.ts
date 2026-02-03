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

  /**
   * Create contract
   */
  async createContract(data: any): Promise<any> {
    try {
      console.log('Creating contract:', data);
      const response = await apiClient.post<any>('/api/v1/contracts/create-contract', data);
      console.log('Create contract response:', response);
      return response;
    } catch (error: any) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  /**
   * Update contract (expects full contract payload)
   */
  async updateContract(data: any): Promise<any> {
    try {
      console.log('Updating contract:', data);
      const response = await apiClient.post<any>('/api/v1/contracts/update-contract', data);
      console.log('Update contract response:', response);
      return response;
    } catch (error: any) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  /**
   * Delete contract (soft delete for DRAFT)
   */
  async deleteContract(id: string): Promise<any> {
    try {
      console.log('Deleting contract id:', id);
      const response = await apiClient.post<any>('/api/v1/contracts/delete-contract', { id });
      console.log('Delete contract response:', response);
      return response;
    } catch (error: any) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }

  /**
   * Cancel contract (change ACTIVE -> CANCELED)
   * API expects id as query param in examples; using POST with query param for compatibility
   */
  async cancelContract(id: string): Promise<any> {
    try {
      console.log('Canceling contract id:', id);
      const response = await apiClient.post<any>(`/api/v1/contracts/cancel-contract?id=${id}`);
      console.log('Cancel contract response:', response);
      return response;
    } catch (error: any) {
      console.error('Error canceling contract:', error);
      throw error;
    }
  }

  /**
   * Activate contract (DRAFT -> ACTIVE)
   */
  async activateContract(id: string): Promise<any> {
    try {
      console.log('Activating contract id:', id);
      const response = await apiClient.post<any>(`/api/v1/contracts/activate-contract?id=${id}`);
      console.log('Activate contract response:', response);
      return response;
    } catch (error: any) {
      console.error('Error activating contract:', error);
      throw error;
    }
  }

  /**
   * Search contracts
   */
  async searchContracts(search: string, page = 0, size = 20): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/api/v1/contracts/search-contracts?search=${encodeURIComponent(search)}&page=${page}&size=${size}`);
      console.log('Search contracts response:', response);
      if (response?.data?.content && Array.isArray(response.data.content)) return response.data.content;
      if (response?.data && Array.isArray(response.data)) return response.data;
      if (Array.isArray(response)) return response;
      return [];
    } catch (error: any) {
      console.error('Error searching contracts:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();
