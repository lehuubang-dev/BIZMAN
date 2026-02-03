import { apiClient } from './api';
import { Expense } from '../types/expense';

class ExpenseService {
  /**
   * Get all expenses
   */
  async getExpenses(): Promise<Expense[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/expenses/get-expenses');
      console.log('Expense API Response:', response);
      
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
      
      console.warn('Unexpected expense response format:', response);
      return [];
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id: string): Promise<Expense | null> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/expenses/get-expense-by-id?id=${id}`
      );
      
      console.log('Expense detail response:', response);
      
      if (response?.data && typeof response.data === 'object') {
        return response.data as Expense;
      }
      
      console.warn('Unexpected response structure:', response);
      return null;
    } catch (error: any) {
      console.error('Error fetching expense detail:', error);
      throw error;
    }
  }

  /**
   * Create a new expense
   */
  async createExpense(data: Partial<Expense>): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/expenses/create-expense', data);
      return response;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  /**
   * Update an existing expense
   */
  async updateExpense(data: Partial<Expense>): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/expenses/update-expense', data);
      return response;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: string): Promise<any> {
    try {
      const response = await apiClient.post<any>('/api/v1/expenses/delete-expense', { id });
      return response;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  /**
   * Search expenses
   */
  async searchExpenses(search: string, page: number = 0, size: number = 10): Promise<Expense[]> {
    try {
      const response = await apiClient.get<any>(
        `/api/v1/expenses/search-expenses?search=${encodeURIComponent(search)}&page=${page}&size=${size}&sort=createdAt,desc`
      );
      console.log('Search expenses response:', response);
      
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
      console.error('Error searching expenses:', error);
      throw error;
    }
  }
}

export const expenseService = new ExpenseService();
