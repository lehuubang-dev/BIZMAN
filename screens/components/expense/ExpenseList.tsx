import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Expense } from '../../../types/expense';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  purple: '#D946EF',
};

interface ExpenseListProps {
  expenses: Expense[];
  onUpdate: (expense: Expense) => void;
  onView: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, onUpdate, onView, onDelete }: ExpenseListProps) {
  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN') + ' đ';
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'PURCHASE_ORDER': 
        return { label: 'Đơn mua hàng', icon: 'cart', color: COLORS.primary };
      case 'SALES_ORDER': 
        return { label: 'Đơn bán hàng', icon: 'cash-register', color: COLORS.success };
      case 'ELECTRICITY': 
        return { label: 'Tiền điện', icon: 'lightning-bolt', color: COLORS.warning };
      case 'WATER': 
        return { label: 'Tiền nước', icon: 'water', color: COLORS.primary };
      case 'INTERNET': 
        return { label: 'Internet', icon: 'wifi', color: COLORS.purple };
      case 'RENT': 
        return { label: 'Tiền thuê', icon: 'home', color: COLORS.error };
      case 'SALARY': 
        return { label: 'Lương', icon: 'account-cash', color: COLORS.success };
      case 'OTHER': 
        return { label: 'Khác', icon: 'dots-horizontal', color: COLORS.gray600 };
      default: 
        return { label: type, icon: 'cash', color: COLORS.gray600 };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'POSTED': 
        return { label: 'Đã ghi', color: COLORS.success };
      case 'CANCELLED': 
        return { label: 'Đã hủy', color: COLORS.error };
      default: 
        return { label: status, color: COLORS.gray400 };
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const typeConfig = getTypeConfig(item.type);
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => onView(item)}
      >
        <View style={styles.main}>
          <View style={styles.leftContent}>
            <View style={[styles.iconContainer, { backgroundColor: typeConfig.color + '15' }]}>
              <MaterialCommunityIcons 
                name={typeConfig.icon as any}
                size={22} 
                color={typeConfig.color}
              />
            </View>
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
              </View>
              
              <View style={styles.metaRow}>
                <View style={styles.typeBadge}>
                  <MaterialCommunityIcons 
                    name={typeConfig.icon as any}
                    size={11} 
                    color={typeConfig.color}
                  />
                  <Text style={[styles.typeText, { color: typeConfig.color }]}>
                    {typeConfig.label}
                  </Text>
                </View>
                <View style={styles.dividerDot} />
                <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>

              <View style={styles.amountRow}>
                <MaterialCommunityIcons name="cash" size={16} color={COLORS.gray800} />
                <Text style={styles.amountValue}>{formatCurrency(item.amount)}</Text>
              </View>

              <View style={styles.bottomRow}>
                {item.purchaseOrder ? (
                  <View style={styles.orderBadge}>
                    <MaterialCommunityIcons name="file-document" size={11} color={COLORS.gray800} />
                    <Text style={styles.orderText}>{item.purchaseOrder.orderNumber}</Text>
                  </View>
                ) : null}
                <View style={styles.dateBadge}>
                  <MaterialCommunityIcons name="calendar" size={11} color={COLORS.gray600} />
                  <Text style={styles.dateText}>
                    {new Date(item.expenseDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.gray400}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={expenses}
      keyExtractor={(item) => item.id}
      renderItem={renderExpenseItem}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cash-remove" size={48} color={COLORS.gray400} />
          <Text style={styles.emptyText}>Chưa có giao dịch thu chi nào</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    overflow: 'hidden',
  },
  main: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  description: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
    lineHeight: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dividerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gray400,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderText: {
    fontSize: 11,
    color: COLORS.gray800,
    fontWeight: '600',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
});