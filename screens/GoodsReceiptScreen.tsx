import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GoodsReceiptList from './components/goodsReceipt/GoodsReceiptList';
import GoodsReceiptDetail from './components/goodsReceipt/GoodsReceiptDetail';
import GoodsReceiptCreate from './components/goodsReceipt/GoodsReceiptCreate';
import DialogNotification from './components/common/DialogNotification';
import { goodsReceiptService } from '../services/goodsReceiptService';
import { GoodsReceiptListItem } from '../types/goodsReceipt';

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

// Status filter configuration
const statusFilters = [
  { key: 'ALL', label: 'Tất cả', icon: 'clipboard-list', color: COLORS.primary },
  { key: 'DRAFT', label: 'Nháp', icon: 'pencil', color: COLORS.gray600 },
  { key: 'RECEIVED', label: 'Đã nhập', icon: 'check-circle', color: COLORS.success },
  { key: 'PARTIAL', label: 'Nhập một phần', icon: 'clock-outline', color: COLORS.warning },
  { key: 'PARTIAL_COMPLETED', label: 'Hoàn thành một phần', icon: 'progress-check', color: COLORS.purple },
  { key: 'CANCELLED', label: 'Đã hủy', icon: 'cancel', color: COLORS.error },
];

export default function GoodsReceiptScreen() {
  const [receipts, setReceipts] = useState<GoodsReceiptListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  
  // Dialog notification states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newReceiptCode, setNewReceiptCode] = useState<string>('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'approve' | 'delete';
    receiptId: string;
    receiptCode: string;
  } | null>(null);
  const [resultDialogConfig, setResultDialogConfig] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ type: 'success', title: '', message: '' });

  useEffect(() => {
    loadReceipts();
  }, []);

  // Auto search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchKeyword.trim()) {
        handleSearch();
      } else {
        loadReceipts();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchKeyword, selectedStatus]);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      console.log('Loading goods receipts with status:', selectedStatus);
      let data: GoodsReceiptListItem[];
      
      if (selectedStatus === 'ALL') {
        data = await goodsReceiptService.getGoodsReceipts();
      } else {
        data = await goodsReceiptService.getGoodsReceiptsByStatus(selectedStatus);
      }
      
      console.log('Loaded receipts count:', data.length);
      if (data.length > 0) {
        console.log('Newest receipt:', data[0]?.receiptCode, 'Status:', data[0]?.status);
        console.log('First 3 receipts:', data.slice(0, 3).map(r => ({ code: r.receiptCode, status: r.status, date: r.receiptDate })));
      }
      // Sort by createdAt to ensure newest receipts are first
      const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReceipts(sortedData);
    } catch (error) {
      console.error('Failed to load receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadReceipts();
      return;
    }

    setLoading(true);
    try {
      console.log('Searching receipts with keyword:', searchKeyword);
      const data = await goodsReceiptService.searchGoodsReceipts(searchKeyword);
      console.log('Search results count:', data.length);
      
      // Filter by status if not ALL
      let filteredData = data;
      if (selectedStatus !== 'ALL') {
        filteredData = data.filter(receipt => receipt.status === selectedStatus);
        console.log('Filtered by status', selectedStatus, ':', filteredData.length);
      }
      
      // Sort search results by createdAt to ensure newest receipts are first
      const sortedData = filteredData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReceipts(sortedData);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (receiptId: string) => {
    setSelectedReceiptId(receiptId);
    setShowDetail(true);
  };

  const handleEdit = (receiptId: string) => {
    setEditingReceiptId(receiptId);
    setShowCreate(true);
  };

  const handleApprove = (receiptId: string, receiptCode: string) => {
    setPendingAction({ type: 'approve', receiptId, receiptCode });
    setShowApproveDialog(true);
  };

  const confirmApprove = async () => {
    if (!pendingAction) return;
    
    setShowApproveDialog(false);
    try {
      console.log('Approve receipt:', pendingAction.receiptCode, 'ID:', pendingAction.receiptId);
      await goodsReceiptService.changeGoodsReceiptStatus(pendingAction.receiptId);
      setResultDialogConfig({
        type: 'success',
        title: 'Duyệt thành công',
        message: `Phiếu ${pendingAction.receiptCode} đã được duyệt thành công`
      });
      setShowResultDialog(true);
      await loadReceipts();
    } catch (error: any) {
      console.error('Error approving receipt:', error);
      
      let errorTitle = 'Lỗi duyệt phiếu';
      let errorMessage = 'Không thể duyệt phiếu nhập hàng. Vui lòng thử lại.';
      
      // Xử lý lỗi cụ thể từ API
      if (error?.code === 'VALIDATION_ERROR') {
        errorTitle = 'Lỗi kiểm tra dữ liệu';
        errorMessage = error.message || 'Dữ liệu không hợp lệ';
      } else if (error?.message) {
        // Nếu có message từ API thì sử dụng
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        // Xử lý response từ axios
        errorMessage = error.response.data.message;
      }
      
      setResultDialogConfig({
        type: 'error',
        title: errorTitle,
        message: errorMessage
      });
      setShowResultDialog(true);
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = (receiptId: string, receiptCode: string) => {
    setPendingAction({ type: 'delete', receiptId, receiptCode });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!pendingAction) return;
    
    setShowDeleteDialog(false);
    try {
      console.log('Delete receipt:', pendingAction.receiptCode, 'ID:', pendingAction.receiptId);
      await goodsReceiptService.deleteGoodsReceipt(pendingAction.receiptId);
      setResultDialogConfig({
        type: 'success',
        title: 'Xóa thành công',
        message: `Phiếu ${pendingAction.receiptCode} đã được xóa thành công`
      });
      setShowResultDialog(true);
      await loadReceipts();
    } catch (error: any) {
      console.error('Error deleting receipt:', error);
      
      let errorTitle = 'Lỗi xóa phiếu';
      let errorMessage = 'Không thể xóa phiếu nhập hàng. Vui lòng thử lại.';
      
      // Xử lý lỗi cụ thể từ API
      if (error?.code === 'VALIDATION_ERROR') {
        errorTitle = 'Lỗi kiểm tra dữ liệu';
        errorMessage = error.message || 'Dữ liệu không hợp lệ';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setResultDialogConfig({
        type: 'error',
        title: errorTitle,
        message: errorMessage
      });
      setShowResultDialog(true);
    } finally {
      setPendingAction(null);
    }
  };

  const handleCreate = async (receiptCode?: string) => {
    console.log('handleCreate called - refreshing receipt list...');
    setShowCreate(false);
    setEditingReceiptId(null);
    
    // If receiptCode is provided, show success dialog
    if (receiptCode) {
      setNewReceiptCode(receiptCode);
      setShowSuccessDialog(true);
      // Reset to show all receipts to see the newly created one
      setSelectedStatus('ALL');
    }
    
    await loadReceipts();
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    // Reset search when changing status
    if (searchKeyword.trim()) {
      setSearchKeyword('');
    }
  };

  const getStatusInfo = (status: string) => {
    return statusFilters.find(filter => filter.key === status) || statusFilters[0];
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
            placeholder="Tìm kiếm phiếu nhập hàng..."
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

      <GoodsReceiptList
        receipts={receipts}
        onView={handleView}
        onEdit={handleEdit}
        onApprove={handleApprove}
        onDelete={handleDelete}
        onCreate={() => {
          setEditingReceiptId(null);
          setShowCreate(true);
        }}
      />

      <GoodsReceiptDetail
        visible={showDetail}
        receiptId={selectedReceiptId}
        onClose={() => {
          setShowDetail(false);
          setSelectedReceiptId(null);
        }}
        onEdit={(receiptId: string) => {
          setShowDetail(false);
          handleEdit(receiptId);
        }}
        onApprove={(receiptId: string, receiptCode: string) => {
          setShowDetail(false);
          handleApprove(receiptId, receiptCode);
        }}
      />

      <GoodsReceiptCreate
        visible={showCreate}
        receiptId={editingReceiptId}
        onClose={() => {
          setShowCreate(false);
          setEditingReceiptId(null);
        }}
        onSuccess={handleCreate}
      />

      <DialogNotification
        visible={showSuccessDialog}
        type="success"
        title="Tạo phiếu nhập hàng thành công"
        message={`Phiếu nhập hàng ${newReceiptCode} đã được tạo thành công và hiển thị ở đầu danh sách.`}
        actions={[
          {
            text: 'Đóng',
            onPress: () => setShowSuccessDialog(false),
            style: 'default',
          },
        ]}
        onDismiss={() => setShowSuccessDialog(false)}
      />

      <DialogNotification
        visible={showApproveDialog}
        type="confirm"
        title="Xác nhận duyệt phiếu"
        message={`Bạn có chắc chắn muốn duyệt phiếu ${pendingAction?.receiptCode}?`}
        actions={[
          {
            text: 'Hủy',
            onPress: () => {
              setShowApproveDialog(false);
              setPendingAction(null);
            },
            style: 'cancel',
          },
          {
            text: 'Duyệt',
            onPress: confirmApprove,
            style: 'default',
          },
        ]}
        onDismiss={() => {
          setShowApproveDialog(false);
          setPendingAction(null);
        }}
      />

      <DialogNotification
        visible={showDeleteDialog}
        type="confirm"
        title="Xác nhận xóa phiếu"
        message={`Bạn có chắc chắn muốn xóa phiếu ${pendingAction?.receiptCode}? Hành động này không thể hoàn tác.`}
        actions={[
          {
            text: 'Hủy',
            onPress: () => {
              setShowDeleteDialog(false);
              setPendingAction(null);
            },
            style: 'cancel',
          },
          {
            text: 'Xóa',
            onPress: confirmDelete,
            style: 'destructive',
          },
        ]}
        onDismiss={() => {
          setShowDeleteDialog(false);
          setPendingAction(null);
        }}
      />

      <DialogNotification
        visible={showResultDialog}
        type={resultDialogConfig.type}
        title={resultDialogConfig.title}
        message={resultDialogConfig.message}
        actions={[
          {
            text: 'Đóng',
            onPress: () => setShowResultDialog(false),
            style: 'default',
          },
        ]}
        onDismiss={() => setShowResultDialog(false)}
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
    borderRadius: 10,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
});
