import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { expenseService } from '../services/expenseService';
import { Expense } from '../types/expense';
import ExpenseList from './components/expense/ExpenseList';
import ExpenseDetail from './components/expense/ExpenseDetail';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
};

export default function CashFlowScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  // Auto search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchKeyword.trim()) {
        handleSearch();
      } else {
        loadExpenses();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchKeyword]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadExpenses();
      return;
    }

    setLoading(true);
    try {
      console.log('Searching expenses with keyword:', searchKeyword);
      const data = await expenseService.searchExpenses(searchKeyword);
      console.log('Search results count:', data.length);
      setExpenses(data);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowUpdateModal(true);
  };

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDetailModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      Alert.alert('Thành công', 'Đã xóa giao dịch');
      loadExpenses();
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể xóa giao dịch');
    }
  };

  const handleSuccess = () => {
    loadExpenses();
  };

  if (loading && expenses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo mô tả, loại giao dịch..."
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            returnKeyType="search"
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => setSearchKeyword('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          )}
          {loading && searchKeyword.length > 0 && (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
          )}
        </View>
      </View>

      <ExpenseList
        expenses={expenses}
        onUpdate={handleUpdate}
        onView={handleView}
        onDelete={handleDelete}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>

      <ExpenseDetail
        visible={showDetailModal}
        expense={selectedExpense}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedExpense(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray800,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
