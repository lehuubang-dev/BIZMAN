import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { ProductSupplier } from '../../../types/product';
import { apiClient } from '../../../services/api';

interface SupplierFilterProps {
  visible: boolean;
  onClose: () => void;
  selectedSupplierIds: string[];
  onSuppliersChange: (supplierIds: string[]) => void;
}

export const SupplierFilter: React.FC<SupplierFilterProps> = ({
  visible,
  onClose,
  selectedSupplierIds,
  onSuppliersChange,
}) => {
  const [suppliers, setSuppliers] = useState<ProductSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selectedSupplierIds);

  useEffect(() => {
    if (visible) {
      setTempSelected(selectedSupplierIds);
      fetchSuppliers();
    }
  }, [visible, selectedSupplierIds]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      // TODO: Cập nhật endpoint chính xác khi có API supplier
      // Tạm thời dùng mock data
      const mockSuppliers: ProductSupplier[] = [
        {
          id: '3e2ac852-7510-4942-b40c-f73a99aeef05',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          code: 'SUP001',
          name: 'Công ty TNHH ABC',
          address: '123 Nguyễn Huệ, Q1, TP.HCM',
          taxCode: '0123456789',
          phoneNumber: '0901234567',
          email: 'contact@abc.com',
          bankName: 'Vietcombank',
          bankAccount: '1234567890',
          bankBranch: 'CN TP.HCM',
          paymentTermDays: 30,
          description: 'Nhà cung cấp chính',
          active: true,
          supplierType: 'COMPANY',
          debtRecognitionMode: 'BY_RECEIPT_PARTIAL',
          debtDate: null,
          maxDebt: 100000000
        },
        {
          id: '4f3bc963-8621-5b53-c51d-g84a00bfff16',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          code: 'SUP002', 
          name: 'Công ty Điện tử DEF',
          address: '456 Lê Lợi, Q3, TP.HCM',
          taxCode: '0987654321',
          phoneNumber: '0912345678',
          email: 'contact@def.com',
          bankName: 'Techcombank',
          bankAccount: '0987654321',
          bankBranch: 'CN Q3',
          paymentTermDays: 15,
          description: 'Chuyên về điện tử',
          active: true,
          supplierType: 'COMPANY',
          debtRecognitionMode: 'IMMEDIATE',
          debtDate: null,
          maxDebt: 50000000
        }
      ];
      
      setSuppliers(mockSuppliers);
      
      /* 
      // Uncomment khi có API endpoint chính xác
      const response = await apiClient.get<any>('/api/v1/suppliers/get-suppliers');
      
      let supplierData = [];
      // Xử lý response format tương tự như products
      if (response?.data?.content && Array.isArray(response.data.content)) {
        supplierData = response.data.content;
      } else if (response?.data && Array.isArray(response.data)) {
        supplierData = response.data;
      } else if (Array.isArray(response)) {
        supplierData = response;
      }
      
      setSuppliers(supplierData);
      */
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
      // Fallback to empty array instead of showing error
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
    supplier.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSupplierToggle = (supplierId: string) => {
    setTempSelected(prev => {
      if (prev.includes(supplierId)) {
        return prev.filter(id => id !== supplierId);
      } else {
        return [...prev, supplierId];
      }
    });
  };

  const handleApply = () => {
    onSuppliersChange(tempSelected);
    onClose();
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  const renderSupplierItem = ({ item }: { item: ProductSupplier }) => {
    const isSelected = tempSelected.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.supplierItem, isSelected && styles.supplierItemSelected]}
        onPress={() => handleSupplierToggle(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.supplierInfo}>
          <Text style={[styles.supplierName, isSelected && styles.supplierNameSelected]}>
            {item.name}
          </Text>
          <Text style={[styles.supplierCode, isSelected && styles.supplierCodeSelected]}>
            Mã: {item.code}
          </Text>
          {item.supplierType && (
            <Text style={[styles.supplierType, isSelected && styles.supplierTypeSelected]}>
              {item.supplierType === 'COMPANY' ? 'Công ty' : 'Cá nhân'}
            </Text>
          )}
        </View>
        
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <MaterialCommunityIcons name="check" size={16} color={COLORS.white} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
            <Text style={styles.title}>Lọc theo nhà cung cấp</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray500} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm nhà cung cấp..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={COLORS.gray400}
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.gray400} />
              </TouchableOpacity>
            ) : null}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải nhà cung cấp...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSuppliers}
              keyExtractor={(item) => item.id}
              renderItem={renderSupplierItem}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="account-off" size={64} color={COLORS.gray400} />
                  <Text style={styles.emptyText}>
                    {searchText ? 'Không tìm thấy nhà cung cấp phù hợp' : 'Chưa có nhà cung cấp nào'}
                  </Text>
                </View>
              )}
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              disabled={tempSelected.length === 0}
            >
              <Text style={[styles.clearButtonText, tempSelected.length === 0 && styles.disabledText]}>
                Xóa tất cả ({tempSelected.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                Áp dụng {tempSelected.length > 0 ? `(${tempSelected.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray800,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  supplierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  supplierItemSelected: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 2,
  },
  supplierNameSelected: {
    color: COLORS.primary,
  },
  supplierCode: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  supplierCodeSelected: {
    color: COLORS.primary,
  },
  supplierType: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  supplierTypeSelected: {
    color: COLORS.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  disabledText: {
    color: COLORS.gray400,
  },
});