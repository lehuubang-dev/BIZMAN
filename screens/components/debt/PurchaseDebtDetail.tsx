import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { debtService } from '../../../services/debtService';
import { PurchaseDebt, DebtStatus } from '../../../types/debt';

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

interface PurchaseDebtDetailProps {
  visible: boolean;
  debtId: string | null;
  onClose: () => void;
}

export default function PurchaseDebtDetail({
  visible,
  debtId,
  onClose,
}: PurchaseDebtDetailProps) {
  const [debt, setDebt] = useState<PurchaseDebt | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && debtId) {
      loadDebtDetail();
    }
  }, [visible, debtId]);

  const loadDebtDetail = async () => {
    if (!debtId) return;

    setLoading(true);
    try {
      console.log('Loading debt detail for ID:', debtId);
      const data = await debtService.getPurchaseDebtById(debtId);
      console.log('Debt detail loaded:', data);
      setDebt(data);
    } catch (error) {
      console.error('Failed to load debt detail:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết công nợ');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (loading || !debt) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
        </View>
      </Modal>
    );
  }

  const statusColor = getStatusColor(debt.status);
  const paymentProgress = debt.originalAmount > 0 
    ? (debt.paidAmount / debt.originalAmount) * 100 
    : 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.gray800} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết công nợ</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Section */}
          <View style={styles.section}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusLabel(debt.status)}
                </Text>
              </View>
            </View>

            {/* Payment Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${paymentProgress}%`, backgroundColor: statusColor }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{paymentProgress.toFixed(1)}%</Text>
            </View>
          </View>

          {/* Purchase Order Info */}
          {debt.purchaseOrder && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
              <View style={styles.infoGrid}>
                <InfoRow 
                  icon="file-document" 
                  label="Mã đơn hàng" 
                  value={debt.purchaseOrder.orderNumber} 
                />
                <InfoRow 
                  icon="calendar" 
                  label="Ngày đặt" 
                  value={formatDate(debt.purchaseOrder.orderDate)} 
                />
                <InfoRow 
                  icon="information-outline" 
                  label="Trạng thái ĐH" 
                  value={debt.purchaseOrder.orderStatus} 
                />
                <InfoRow 
                  icon="cash-multiple" 
                  label="Tổng đơn hàng" 
                  value={`${formatCurrency(debt.purchaseOrder.totalAmount)} đ`} 
                  valueColor={COLORS.primary}
                />
                {debt.purchaseOrder.note && (
                  <InfoRow 
                    icon="note-text" 
                    label="Ghi chú ĐH" 
                    value={debt.purchaseOrder.note} 
                  />
                )}
              </View>
            </View>
          )}

          {/* Supplier Info */}
          {debt.supplier && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin nhà cung cấp</Text>
              <View style={styles.infoGrid}>
                <InfoRow 
                  icon="handshake-outline" 
                  label="Tên NCC" 
                  value={debt.supplier.name} 
                />
                <InfoRow 
                  icon="barcode" 
                  label="Mã NCC" 
                  value={debt.supplier.code} 
                />
                <InfoRow 
                  icon="map-marker" 
                  label="Địa chỉ" 
                  value={debt.supplier.address} 
                />
                <InfoRow 
                  icon="card-account-details" 
                  label="Mã số thuế" 
                  value={debt.supplier.taxCode} 
                />
                <InfoRow 
                  icon="phone" 
                  label="Điện thoại" 
                  value={debt.supplier.phoneNumber} 
                />
                <InfoRow 
                  icon="email" 
                  label="Email" 
                  value={debt.supplier.email} 
                />
                <InfoRow 
                  icon="bank" 
                  label="Ngân hàng" 
                  value={debt.supplier.bankName} 
                />
                <InfoRow 
                  icon="credit-card" 
                  label="Số TK" 
                  value={debt.supplier.bankAccount} 
                />
                <InfoRow 
                  icon="office-building" 
                  label="Chi nhánh" 
                  value={debt.supplier.bankBranch} 
                />
                <InfoRow 
                  icon="clock-outline" 
                  label="Kỳ hạn TT" 
                  value={`${debt.supplier.paymentTermDays} ngày`} 
                />
                <InfoRow 
                  icon="cash-lock" 
                  label="Hạn mức nợ" 
                  value={`${formatCurrency(debt.supplier.maxDebt)} đ`} 
                  valueColor={COLORS.error}
                />
              </View>
            </View>
          )}

          {/* Debt Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin công nợ</Text>
            <View style={styles.infoGrid}>
              <InfoRow 
                icon="calendar-clock" 
                label="Hạn thanh toán" 
                value={formatDate(debt.dueDate)} 
                valueColor={COLORS.error}
              />
              <InfoRow 
                icon="cash" 
                label="Tổng nợ gốc" 
                value={`${formatCurrency(debt.originalAmount)} đ`} 
                valueColor={COLORS.gray800}
              />
              <InfoRow 
                icon="cash-check" 
                label="Đã thanh toán" 
                value={`${formatCurrency(debt.paidAmount)} đ`} 
                valueColor={COLORS.success}
              />
              <InfoRow 
                icon="cash-minus" 
                label="Còn lại" 
                value={`${formatCurrency(debt.remainingAmount)} đ`} 
                valueColor={COLORS.error}
              />
              {debt.description && (
                <InfoRow 
                  icon="text" 
                  label="Mô tả" 
                  value={debt.description} 
                />
              )}
              {debt.note && (
                <InfoRow 
                  icon="note-text" 
                  label="Ghi chú" 
                  value={debt.note} 
                />
              )}
            </View>
          </View>

          {/* Timestamps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời gian</Text>
            <View style={styles.infoGrid}>
              <InfoRow 
                icon="clock-plus-outline" 
                label="Ngày tạo" 
                value={formatDateTime(debt.createdAt)} 
              />
              <InfoRow 
                icon="clock-edit-outline" 
                label="Cập nhật" 
                value={formatDateTime(debt.updatedAt)} 
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeFooterButton} onPress={onClose}>
            <Text style={styles.closeFooterButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// InfoRow Component
interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}

function InfoRow({ icon, label, value, valueColor }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <MaterialCommunityIcons name={icon as any} size={16} color={COLORS.gray600} />
        <Text style={styles.labelText}>{label}:</Text>
      </View>
      <Text style={[styles.valueText, valueColor && { color: valueColor }]}>
        {value}
      </Text>
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
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 12,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.gray100,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray600,
    minWidth: 50,
    textAlign: 'right',
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    gap: 6,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginLeft: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  closeFooterButton: {
    backgroundColor: COLORS.gray100,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeFooterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
});
