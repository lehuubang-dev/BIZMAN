import { apiClient } from './api';
import { Supplier } from '../types/supplier';

class PartnerService {
  /**
   * Get all suppliers
   */
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/partners/get-suppliers');
      // Handle both direct data and paginated data structures
      return response?.data?.content || response?.data || response || [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  /**
   * Search suppliers
   */
  async searchSuppliers(search: string): Promise<Supplier[]> {
    try {
      const response = await apiClient.get<any>(`/api/v1/partners/search-suppliers?search=${encodeURIComponent(search)}`);
      // API returns paginated data in data.content
      return response?.data?.content || response?.data || response || [];
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw error;
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const response = await apiClient.get<any>(`/api/v1/partners/get-suppliers-by-id?id=${id}`);
      return response?.data || null;
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }
  }

  /**
   * Create a new supplier
   */
  async createSupplier(data: {
    name: string;
    address: string;
    supplierType: string;
    taxCode: string;
    phoneNumber: string;
    email: string;
    bankName: string;
    bankAccount: string;
    bankBranch: string;
    paymentTermDays: number;
    debtRecognitionMode: string;
    debtDate: string | null;
    maxDebt: number;
    description: string;
    active: boolean;
  }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/partners/create-supplier', data);
      return response;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  /**
   * Update an existing supplier
   */
  async updateSupplier(data: {
    id: string;
    name: string;
    address: string;
    supplierType: string;
    taxCode: string;
    phoneNumber: string;
    email: string;
    bankName: string;
    bankAccount: string;
    bankBranch: string;
    paymentTermDays: number;
    debtRecognitionMode: string;
    debtDate: string | null;
    maxDebt: number;
    description: string;
    active: boolean;
  }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/partners/update-supplier', data);
      return response;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  }

  /**
   * Activate a supplier
   */
  async activateSupplier(id: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/partners/activate-supplier', { id });
      return response;
    } catch (error) {
      console.error('Error activating supplier:', error);
      throw error;
    }
  }

  /**
   * Deactivate a supplier
   */
  async unactivateSupplier(id: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/partners/unactivate-supplier', { id });
      return response;
    } catch (error) {
      console.error('Error deactivating supplier:', error);
      throw error;
    }
  }
}

export const partnerService = new PartnerService();
