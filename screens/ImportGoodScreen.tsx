import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ImportGoodList, ImportGoodDetail, ImportGoodCreate } from './components/importGood';
import { purchaseOrderService } from '../services/purchaseOrderService';
import { PurchaseOrderListItem } from '../types/purchaseOrder';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#9333EA',
};

// Status filter configuration for purchase orders
const statusFilters = [
  { key: 'ALL', label: 'Tất cả', icon: 'clipboard-list', color: COLORS.primary },
  { key: 'DRAFT', label: 'Nháp', icon: 'pencil', color: COLORS.gray600 },
  { key: 'APPROVED', label: 'Đã duyệt ', icon: 'check-circle', color: COLORS.success },
  { key: 'CANCELLED', label: 'Đã hủy', icon: 'cancel', color: COLORS.error },
];

export default function ImportGoodScreen() {
  const [orders, setOrders] = useState<PurchaseOrderListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  // Auto search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchKeyword.trim()) {
        handleSearch();
      } else {
        loadOrders();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchKeyword, selectedStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('Loading purchase orders with status:', selectedStatus);
      let data: PurchaseOrderListItem[];
      
      if (selectedStatus === 'ALL') {
        data = await purchaseOrderService.getPurchaseOrders();
      } else {
        data = await purchaseOrderService.getPurchaseOrdersByStatus(selectedStatus);
      }
      
      console.log('Loaded orders count:', data.length);
      // API already returns data sorted by orderDate descending
      console.log('Newest order:', data[0]?.orderNumber);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn nhập hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadOrders();
      return;
    }

    setLoading(true);
    try {
      console.log('Searching orders with keyword:', searchKeyword);
      const data = await purchaseOrderService.searchPurchaseOrders(searchKeyword);
      console.log('Search results count:', data.length);
      
      // Filter by status if not ALL
      let filteredData = data;
      if (selectedStatus !== 'ALL') {
        filteredData = data.filter(order => order.orderStatus === selectedStatus);
        console.log('Filtered by status', selectedStatus, ':', filteredData.length);
      }
      
      setOrders(filteredData);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetail(true);
  };

  const handleApprove = async (orderId: string, orderNumber?: string) => {
  if (approving) return;

  try {
    setApproving(true);
    console.log('Approve order:', orderNumber);
    await purchaseOrderService.approvePurchaseOrder(orderId);
    loadOrders();
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể duyệt đơn nhập hàng');
  } finally {
    setApproving(false);
  }
};

  const handleDelete = async (orderId: string, orderNumber?: string) => {
    try {
      console.log('Delete order:', orderNumber);
      await purchaseOrderService.deletePurchaseOrder(orderId);
      loadOrders();
      Alert.alert('Thành công', 'Đã xóa đơn hàng thành công');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Lỗi', 'Không thể xóa đơn hàng');
    }
  };

  const handleCancel = async (orderId: string, orderNumber?: string) => {
    try {
      console.log('Cancel order:', orderNumber);
      await purchaseOrderService.cancelPurchaseOrder(orderId);
      loadOrders();
      Alert.alert('Thành công', 'Đã hủy đơn hàng thành công');
    } catch (error) {
      console.error('Cancel error:', error);
      Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
    }
  };

  const handleCreate = async () => {
    console.log('handleCreate called - refreshing order list...');
    setShowCreate(false);
    // Reset to show all orders to see the newly created one
    setSelectedStatus('ALL');
    await loadOrders();
    // Note: orders state will be updated by loadOrders, but the log here shows old value
    // The actual updated count is logged in loadOrders itself
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    // Reset search when changing status
    if (searchKeyword.trim()) {
      setSearchKeyword('');
    }
  };



  if (loading) {
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
            placeholder="Tìm kiếm đơn hàng..."
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
        
        {/* Status Filter */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {statusFilters.map((filter) => {
              const isSelected = selectedStatus === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    isSelected && { backgroundColor: filter.color + '15', borderColor: filter.color }
                  ]}
                  onPress={() => handleStatusChange(filter.key)}
                >
                  <MaterialCommunityIcons 
                    name={filter.icon as any} 
                    size={16} 
                    color={isSelected ? filter.color : COLORS.gray600} 
                  />
                  <Text style={[
                    styles.filterText,
                    isSelected && { color: filter.color, fontWeight: '600' }
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <ImportGoodList
        orders={orders}
        onView={handleView}
        onApprove={handleApprove}
        onDelete={handleDelete}
        onCancel={handleCancel}
        onCreate={() => setShowCreate(true)}
      />

      <ImportGoodDetail
        visible={showDetail}
        orderId={selectedOrderId}
        onClose={() => {
          setShowDetail(false);
          setSelectedOrderId(null);
        }}
        onApprove={(orderId, orderNumber) => {
          setShowDetail(false);
          handleApprove(orderId, orderNumber);
        }}
      />

      <ImportGoodCreate
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
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
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray800,
    minHeight: 40,
    paddingVertical: 8,
  },
  filterContainer: {
    marginBottom: 4,
  },
  filterScroll: {
    paddingHorizontal: 0,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.gray600,
    width: "auto",
  },
});
