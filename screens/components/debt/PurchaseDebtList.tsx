import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { debtService } from '../../../services/debtService';
import { PurchaseDebtListItem, DebtStatus } from '../../../types/debt';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#9333EA',
};

interface PurchaseDebtListProps {
  onViewDetail: (debtId: string) => void;
}

export default function PurchaseDebtList({ onViewDetail }: PurchaseDebtListProps) {
  const [debts, setDebts] = useState<PurchaseDebtListItem[]>([]);
  const [filteredDebts, setFilteredDebts] = useState<PurchaseDebtListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<DebtStatus | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadDebts();
  }, []);

  useEffect(() => {
    filterDebts();
  }, [debts, statusFilter]);

  // Auto search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchKeyword.trim()) {
        handleSearch();
      } else {
        loadDebts();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchKeyword]);

  const loadDebts = async () => {
    setLoading(true);
    try {
      console.log('Loading purchase debts...');
      const data = await debtService.getPurchaseDebts();
      console.log('Loaded debts count:', data.length);
      setDebts(data);
      setFilteredDebts(data);
    } catch (error) {
      console.error('Failed to load purchase debts:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách công nợ');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadDebts();
      return;
    }

    setLoading(true);
    try {
      console.log('Searching debts with keyword:', searchKeyword);
      const data = await debtService.searchPurchaseDebts(searchKeyword);
      console.log('Search results count:', data.length);
      setDebts(data);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm công nợ');
    } finally {
      setLoading(false);
    }
  };

  const filterDebts = () => {
    if (statusFilter === 'ALL') {
      setFilteredDebts(debts);
    } else {
      const filtered = debts.filter(debt => debt.status === statusFilter);
      setFilteredDebts(filtered);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: DebtStatus) => {
    const colors: Record<DebtStatus, string> = {
      PENDING: COLORS.warning,
      PAID: COLORS.success,
      OVERDUE: COLORS.error,
      CANCELLED: COLORS.gray600,
      PARTIAL: COLORS.purple,
    };
    return colors[status] || COLORS.gray600;
  };

  const getStatusLabel = (status: DebtStatus) => {
    const labels: Record<DebtStatus, string> = {
      PENDING: 'Chờ thanh toán',
      PAID: 'Đã thanh toán',
      OVERDUE: 'Quá hạn',
      CANCELLED: 'Đã hủy',
      PARTIAL: 'Thanh toán một phần',
    };
    return labels[status] || status;
  };

  const renderItem = ({ item }: { item: PurchaseDebtListItem }) => {
    const isExpanded = expandedId === item.id;
    const statusColor = getStatusColor(item.status);
    const paymentProgress = item.originalAmount > 0 
      ? (item.paidAmount / item.originalAmount) * 100 
      : 0;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => handleToggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.headerContent}>
            {/* Header Top */}
            <View style={styles.headerTop}>
              <View style={styles.debtInfo}>
                <MaterialCommunityIcons name="receipt" size={20} color={COLORS.primary} />
                <Text style={styles.orderNumber}>
                  {item.purchaseOrder?.orderNumber || 'N/A'}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={COLORS.gray400}
              />
            </View>

            {/* Status and Date */}
            <View style={styles.headerDetails}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
              <Text style={styles.dueDate}>
                Hạn: {formatDate(item.dueDate)}
              </Text>
            </View>

            {/* Supplier */}
            {item.supplier && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="handshake-outline" size={14} color={COLORS.gray600} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.supplier.name}
                </Text>
              </View>
            )}

            {/* Payment Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${paymentProgress}%`, backgroundColor: statusColor }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {paymentProgress.toFixed(0)}%
              </Text>
            </View>

            {/* Amounts */}
            <View style={styles.amountsRow}>
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Tổng nợ:</Text>
                <Text style={styles.amountValue}>{formatCurrency(item.originalAmount)} đ</Text>
              </View>
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Còn lại:</Text>
                <Text style={[styles.amountValue, { color: COLORS.error }]}>
                  {formatCurrency(item.remainingAmount)} đ
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.white }]}
              onPress={() => onViewDetail(item.id)}
            >
              <MaterialCommunityIcons name="eye-outline" size={18} color={COLORS.gray600} />
              <Text style={[styles.actionText, { color: COLORS.gray600 }]}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading && debts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.filterContainer}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo nhà cung cấp..."
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            returnKeyType="search"
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchKeyword('');
            }}>
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          )}
          {loading && searchKeyword.length > 0 && (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
          )}
        </View>

        {/* Status Filter */}
        {/* <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Trạng thái:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={statusFilter}
              onValueChange={(value) => setStatusFilter(value as DebtStatus | 'ALL')}
              style={styles.picker}
            >
              <Picker.Item label="Tất cả" value="ALL" />
              <Picker.Item label="Chờ thanh toán" value="PENDING" />
              <Picker.Item label="Đã thanh toán" value="PAID" />
              <Picker.Item label="Thanh toán một phần" value="PARTIAL" />
              <Picker.Item label="Quá hạn" value="OVERDUE" />
              <Picker.Item label="Đã hủy" value="CANCELLED" />
            </Picker>
          </View>
        </View> */}
      </View>

      {/* Debts List */}
      {filteredDebts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="receipt" size={48} color={COLORS.gray400} />
          <Text style={styles.emptyText}>
            {searchKeyword ? 'Không tìm thấy kết quả' : 'Chưa có công nợ nhập hàng'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDebts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadDebts}
        />
      )}
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterContainer: {
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
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray800,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 40,
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    padding: 14,
  },
  headerContent: {
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debtInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  headerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dueDate: {
    fontSize: 12,
    color: COLORS.gray600,
    width: '50%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray600,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray600,
    minWidth: 40,
    textAlign: 'right',
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
});
