import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Expense } from '../../../types/expense';

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
  error: '#EF4444',
  warning: '#F59E0B',
  purple: '#D946EF',
};

interface ExpenseDetailProps {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
}

export default function ExpenseDetail({ visible, expense, onClose }: ExpenseDetailProps) {
  if (!expense) return null;

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

  const typeConfig = getTypeConfig(expense.type);
  const statusConfig = getStatusConfig(expense.status);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons name="cash-multiple" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.headerTitle}>Chi tiết thu chi</Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={22} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Main Card */}
            <View style={styles.mainCard}>
              <View style={styles.avatarSection}>
                <View style={[
                  styles.avatar,
                  { backgroundColor: typeConfig.color + '15', borderColor: typeConfig.color }
                ]}>
                  <MaterialCommunityIcons 
                    name={typeConfig.icon as any}
                    size={32} 
                    color={typeConfig.color}
                  />
                </View>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: statusConfig.color }
                ]} />
              </View>

              <Text style={styles.description}>{expense.description}</Text>

              <View style={styles.badgeRow}>
                <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '15' }]}>
                  <MaterialCommunityIcons 
                    name={typeConfig.icon as any}
                    size={12} 
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

              <View style={styles.amountCard}>
                <View style={styles.amountHeader}>
                  <MaterialCommunityIcons name="cash" size={16} color={COLORS.gray600} />
                  <Text style={styles.amountLabel}>Số tiền giao dịch</Text>
                </View>
                <Text style={styles.amountValue}>{formatCurrency(expense.amount)}</Text>
              </View>

              <View style={styles.dateRow}>
                <MaterialCommunityIcons name="calendar-month" size={14} color={COLORS.gray400} />
                <Text style={styles.dateLabel}>Ngày ghi nhận:</Text>
                <Text style={styles.dateValue}>
                  {new Date(expense.expenseDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>

            {/* Purchase Order Card */}
            {expense.purchaseOrder ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="file-document-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Thông tin đơn hàng</Text>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <MaterialCommunityIcons name="barcode" size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Số đơn hàng</Text>
                      <Text style={styles.detailValue}>{expense.purchaseOrder.orderNumber}</Text>
                    </View>
                  </View>

                  {expense.purchaseOrder.description ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        <MaterialCommunityIcons name="text" size={16} color={COLORS.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Mô tả</Text>
                        <Text style={styles.detailValue}>{expense.purchaseOrder.description}</Text>
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Ngày đơn hàng</Text>
                      <Text style={styles.detailValue}>
                        {new Date(expense.purchaseOrder.orderDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Tổng phụ</Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(expense.purchaseOrder.subTotal)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Thuế</Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(expense.purchaseOrder.taxAmount)}
                      </Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryTotalLabel}>Tổng cộng</Text>
                      <Text style={styles.summaryTotalValue}>
                        {formatCurrency(expense.purchaseOrder.totalAmount)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Additional Info Card */}
            {(expense.note || expense.paymentStatus) ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Thông tin bổ sung</Text>
                </View>

                <View style={styles.cardContent}>
                  {expense.note ? (
                    <View style={styles.noteCard}>
                      <View style={styles.noteHeader}>
                        <MaterialCommunityIcons name="note-text" size={14} color={COLORS.gray600} />
                        <Text style={styles.noteTitle}>Ghi chú</Text>
                      </View>
                      <Text style={styles.noteText}>{expense.note}</Text>
                    </View>
                  ) : null}

                  {expense.paymentStatus ? (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Trạng thái thanh toán</Text>
                      <Text style={styles.infoValue}>{expense.paymentStatus}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Footer */}
            <View style={styles.footerCard}>
              <View style={styles.footerItem}>
                <MaterialCommunityIcons name="clock-plus-outline" size={14} color={COLORS.gray400} />
                <Text style={styles.footerLabel}>Ngày tạo:</Text>
                <Text style={styles.footerValue}>
                  {new Date(expense.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <MaterialCommunityIcons name="clock-edit-outline" size={14} color={COLORS.gray400} />
                <Text style={styles.footerLabel}>Cập nhật:</Text>
                <Text style={styles.footerValue}>
                  {new Date(expense.updatedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '94%',
    backgroundColor: COLORS.gray50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  closeButton: {
    padding: 2,
  },
  content: {
    flex: 1,
  },
  mainCard: {
    backgroundColor: COLORS.white,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  description: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dividerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gray400,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.error,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    width: '100%',
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  dateValue: {
    fontSize: 12,
    color: COLORS.gray800,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '600',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: 8,
  },
  summaryCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '700',
  },
  summaryTotalValue: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 13,
    color: COLORS.gray800,
    lineHeight: 20,
  },
  infoItem: {
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '600',
  },
  footerCard: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  footerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    marginRight: 4,
    width: 60,
  },
  footerValue: {
    fontSize: 11,
    color: COLORS.gray800,
    fontWeight: '600',
  },
  footerDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 12,
  },
});