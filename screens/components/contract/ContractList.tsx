import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ContractListItem } from '../../../types/contract';

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
  purple: '#8B5CF6',
  blue: '#3B82F6',
};

interface ContractListProps {
  contracts: ContractListItem[];
  onView: (contractId: string) => void;
  onUpdate?: (contractId: string) => void;
  onDelete?: (contractId: string) => void;
  onCancel?: (contractId: string) => void;
  onActivate?: (contractId: string) => void;
}

export default function ContractList({ contracts, onView, onUpdate, onDelete, onCancel, onActivate }: ContractListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: COLORS.gray600,
      ACTIVE: COLORS.blue,
      COMPLETED: COLORS.success,
      CANCELLED: COLORS.error,
      EXPIRED: COLORS.warning,
    };
    return colors[status] || COLORS.gray600;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Nháp',
      ACTIVE: 'Đang thực hiện',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      EXPIRED: 'Hết hạn',
    };
    return labels[status] || status;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PURCHASE: COLORS.primary,
      SALE: COLORS.success,
      SERVICE: COLORS.purple,
    };
    return colors[type] || COLORS.gray600;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PURCHASE: 'Mua hàng',
      SALE: 'Bán hàng',
      SERVICE: 'Dịch vụ',
    };
    return labels[type] || type;
  };

  const renderItem = ({ item }: { item: ContractListItem }) => {
    const isExpanded = expandedId === item.id;
    const statusColor = getStatusColor(item.status);
    const typeColor = getTypeColor(item.contractType);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => handleToggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.contractInfo}>
                <MaterialCommunityIcons name="file-document-edit" size={20} color={typeColor} />
                <Text style={styles.contractNumber}>{item.contractNumber}</Text>
              </View>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={COLORS.gray400}
              />
            </View>

            <Text style={styles.contractTitle} numberOfLines={2}>{item.title}</Text>

            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: typeColor + '15' }]}>
                <Text style={[styles.badgeText, { color: typeColor }]}>
                  {getTypeLabel(item.contractType)}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor + '15' }]}>
                <Text style={[styles.badgeText, { color: statusColor }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            {item.supplier && (
              <View style={styles.supplierRow}>
                <MaterialCommunityIcons name="handshake-outline" size={14} color={COLORS.gray600} />
                <Text style={styles.supplierText} numberOfLines={1}>{item.supplier.name}</Text>
              </View>
            )}

            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <MaterialCommunityIcons name="calendar-check" size={14} color={COLORS.gray600} />
                <Text style={styles.dateText}>{formatDate(item.startDate)}</Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={14} color={COLORS.gray400} />
              <View style={styles.dateItem}>
                <MaterialCommunityIcons name="calendar-remove" size={14} color={COLORS.gray600} />
                <Text style={styles.dateText}>{formatDate(item.endDate)}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giá trị hợp đồng:</Text>
              <Text style={styles.priceValue}>{formatCurrency(item.totalValue)}</Text>
            </View>
          </View>
        </TouchableOpacity>
            {/* menu thao tác */}
        {isExpanded && (
          <View style={styles.actions}>
            {item.status === 'DRAFT' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.primary + '10' }]}
                  onPress={() => onUpdate && onUpdate(item.id)}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} />
                  <Text style={[styles.actionText, { color: COLORS.primary }]}>Cập nhật</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.white }]}
                  onPress={() => onDelete && onDelete(item.id)}
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.error} />
                  <Text style={[styles.actionText, { color: COLORS.error }]}>Xóa</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.success + '10' }]}
                  onPress={() => onActivate && onActivate(item.id)}
                >
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color={COLORS.success} />
                  <Text style={[styles.actionText, { color: COLORS.success }]}>Kích hoạt</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
              </>
            )}

            {item.status === 'ACTIVE' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.white }]}
                  onPress={() => onCancel && onCancel(item.id)}
                >
                  <MaterialCommunityIcons name="cancel" size={18} color={COLORS.warning} />
                  <Text style={[styles.actionText, { color: COLORS.warning }]}>Hủy</Text>
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

  if (contracts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="file-document-edit-outline" size={48} color={COLORS.gray400} />
        <Text style={styles.emptyText}>Chưa có hợp đồng</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={contracts}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
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
  contractInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contractNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  contractTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    lineHeight: 20,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray600,
    width: 80,
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
    width: '100%',
    textAlign: 'center',
  },
});
