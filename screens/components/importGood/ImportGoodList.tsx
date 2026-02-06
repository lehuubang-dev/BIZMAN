import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PurchaseOrderListItem } from '../../../types/purchaseOrder';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import ImportGoodUpdate from './ImportGoodUpdate';

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
};

interface ImportGoodListProps {
  orders: PurchaseOrderListItem[];
  onView: (orderId: string) => void;
  onApprove: (orderId: string, orderNumber: string) => void;
  onCreate: () => void;
  onUpdate?: (orderId: string) => void;
  onDelete?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
}

export default function ImportGoodList({ orders, onView, onApprove, onCreate, onUpdate, onDelete, onCancel }: ImportGoodListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN');
  };

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa đơn nhập hàng "${orderNumber}"?\n\nHành động này không thể hoàn tác.`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(orderId);
            }
          },
        },
      ]
    );
  };

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    Alert.alert(
      'Xác nhận hủy đơn hàng',
      `Bạn có chắc chắn muốn hủy đơn nhập hàng "${orderNumber}"?\n\nĐơn hàng sẽ chuyển sang trạng thái đã hủy.`,
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Hủy đơn hàng',
          style: 'destructive',
          onPress: () => {
            if (onCancel) {
              onCancel(orderId);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: COLORS.gray600,
      APPROVED: COLORS.success,
      CANCELLED: COLORS.error,
    };
    return colors[status] || COLORS.gray600;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Nháp',
      APPROVED: 'Đã duyệt',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };
  const renderItem = ({ item }: { item: PurchaseOrderListItem }) => {
    const isExpanded = expandedId === item.id;
    const statusColor = getStatusColor(item.orderStatus);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => handleToggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.orderInfo}>
                <MaterialCommunityIcons name="package-variant" size={20} color={COLORS.primary} />
                <Text style={styles.orderNumber}>{item.orderNumber}</Text>
              </View>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={COLORS.gray400}
              />
            </View>

            <View style={styles.headerDetails}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusLabel(item.orderStatus)}
                </Text>
              </View>
              <View style={styles.dateContainer}>
                <MaterialCommunityIcons name="calendar" size={12} color={COLORS.gray400} />
                <Text style={styles.orderDate}>
                  {new Date(item.orderDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.gray400} />
                <Text style={styles.createdDate}>
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>

            {item.supplier && (
              <View style={styles.supplierRow}>
                <MaterialCommunityIcons name="handshake-outline" size={14} color={COLORS.gray600} />
                <Text style={styles.supplierText} numberOfLines={1}>{item.supplier.name}</Text>
              </View>
            )}

            {item.warehouse && (
              <View style={styles.warehouseRow}>
                <MaterialCommunityIcons name="warehouse" size={14} color={COLORS.gray600} />
                <Text style={styles.warehouseText} numberOfLines={1}>{item.warehouse.name}</Text>
              </View>
            )}

            {(item as any).contract && (
              <View style={styles.contractRow}>
                <MaterialCommunityIcons name="file-document" size={14} color={COLORS.primary} />
                <Text style={styles.contractText} numberOfLines={1}>HĐ: {(item as any).contract.contractNumber}</Text>
              </View>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="package-variant" size={12} color={COLORS.gray400} />
                <Text style={styles.statText}>{(item as any).products?.length || 0} SP</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="currency-usd" size={12} color={COLORS.gray400} />
                <Text style={styles.statText}>{formatCurrency(item.subTotal)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="percent" size={12} color={COLORS.gray400} />
                <Text style={styles.statText}>{formatCurrency(item.taxAmount)}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tổng thanh toán:</Text>
              <Text style={styles.priceValue}>{formatCurrency(item.totalAmount)}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* Menu thao tác */}
        {isExpanded && (
          <View style={styles.actions}>
            {item.orderStatus === 'DRAFT' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.success + '10' }]}
                  onPress={() => onApprove(item.id, item.orderNumber)}
                >
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color={COLORS.success} />
                  <Text style={[styles.actionText, { color: COLORS.success }]}>Duyệt</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.primary + '10' }]}
                  onPress={() => { setSelectedOrderId(item.id); setShowUpdateModal(true); }}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} />
                  <Text style={[styles.actionText, { color: COLORS.primary }]}>Cập nhật</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.error + '10' }]}
                  onPress={() => handleDeleteOrder(item.id, item.orderNumber)}
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.error} />
                  <Text style={[styles.actionText, { color: COLORS.error }]}>Xóa</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
              </>
            )}
            {item.orderStatus === 'APPROVED' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.warning + '10' }]}
                  onPress={() => handleCancelOrder(item.id, item.orderNumber)}
                >
                  <MaterialCommunityIcons name="cancel" size={18} color={COLORS.warning} />
                  <Text style={[styles.actionText, { color: COLORS.warning }]}>Hủy đơn hàng</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
              </>
            )}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.white }]}
              onPress={() => onView(item.id)}
            >
              <MaterialCommunityIcons name="eye-outline" size={18} color={COLORS.gray600} />
              <Text style={[styles.actionText, { color: COLORS.gray600 }]}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="package-variant-closed" size={48} color={COLORS.gray400} />
        <Text style={styles.emptyText}>Chưa có đơn nhập hàng</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.fab} onPress={onCreate}>
        <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>
      <ImportGoodUpdate
        visible={showUpdateModal}
        orderId={selectedOrderId}
        onClose={() => { setShowUpdateModal(false); setSelectedOrderId(null); }}
        onUpdated={() => {
          // Optionally, you can refresh the list by calling a prop or emitting event
          // If parent provided onUpdate callback, call it so parent can refresh
          if (onUpdate) onUpdate(selectedOrderId || '');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  orderInfo: {
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
    gap: 8,
    flexWrap: 'wrap',
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
  orderDate: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    gap: 3,
  },
  createdDate: {
    fontSize: 11,
    color: COLORS.gray400,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  supplierText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray600,
  },
  warehouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warehouseText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray600,
  },
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contractText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.gray200,
  },
  statText: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.gray600,
    width: '60%',
  },
  priceValue: {
    fontSize: 16,
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
  actionDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
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
    shadowRadius: 4,
  },
});
