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
import { Supplier } from '../../../types/supplier';

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
};

interface SupplierDetailProps {
  visible: boolean;
  supplier: Supplier | null;
  onClose: () => void;
}

export default function SupplierDetail({ visible, supplier, onClose }: SupplierDetailProps) {
  if (!supplier) return null;

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN') + ' đ';
  };

  const getDebtModeLabel = (mode: string) => {
    switch (mode) {
      case 'IMMEDIATE':
        return 'Ghi nợ ngay';
      case 'BY_RECEIPT_PARTIAL':
        return 'Ghi nợ theo từng đợt nhận';
      case 'BY_COMPLETION':
        return 'Chỉ ghi nợ khi hoàn thành';
      default:
        return mode;
    }
  };

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
            <Text style={styles.headerTitle}>Chi tiết nhà cung cấp</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Main Info Card */}
            <View style={styles.mainCard}>
              <View style={styles.avatarSection}>
                <View style={[
                  styles.avatar,
                  supplier.active ? styles.avatarActive : styles.avatarInactive
                ]}>
                  <MaterialCommunityIcons 
                    name={supplier.supplierType === 'COMPANY' ? 'office-building' : 'account'} 
                    size={32} 
                    color={supplier.active ? COLORS.primary : COLORS.gray400}
                  />
                </View>
                <View style={[
                  styles.statusIndicator,
                  supplier.active ? styles.statusActive : styles.statusInactive
                ]} />
              </View>

              <Text style={styles.supplierName}>{supplier.name}</Text>

              <View style={styles.badgeRow}>
                <View style={styles.codeBadge}>
                  <MaterialCommunityIcons name="identifier" size={13} color={COLORS.primary} />
                  <Text style={styles.badgeText}>{supplier.code}</Text>
                </View>
                <View style={styles.dividerDot} />
                <Text style={styles.typeText}>
                  {supplier.supplierType === 'COMPANY' ? 'Công ty' : 'Cá nhân'}
                </Text>
                <View style={styles.dividerDot} />
                <Text style={[
                  styles.statusLabel,
                  supplier.active ? styles.statusActiveText : styles.statusInactiveText
                ]}>
                  {supplier.active ? 'Đang hoạt động' : 'Tạm ngừng'}
                </Text>
              </View>

              {supplier.taxCode ? (
                <View style={styles.taxCodeRow}>
                  <MaterialCommunityIcons name="file-certificate" size={14} color={COLORS.gray600} />
                  <Text style={styles.taxCodeLabel}>Mã số thuế:</Text>
                  <Text style={styles.taxCodeValue}>{supplier.taxCode}</Text>
                </View>
              ) : null}
            </View>

            {/* Contact Section */}
            {(supplier.phoneNumber || supplier.email || supplier.address) ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="card-account-phone" size={18} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Thông tin liên hệ</Text>
                </View>

                <View style={styles.cardContent}>
                  {supplier.phoneNumber ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        <MaterialCommunityIcons name="phone" size={16} color={COLORS.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Số điện thoại</Text>
                        <Text style={styles.detailValue}>{supplier.phoneNumber}</Text>
                      </View>
                    </View>
                  ) : null}

                  {supplier.email ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        <MaterialCommunityIcons name="email" size={16} color={COLORS.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Email</Text>
                        <Text style={styles.detailValue}>{supplier.email}</Text>
                      </View>
                    </View>
                  ) : null}

                  {supplier.address ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Địa chỉ</Text>
                        <Text style={styles.detailValue}>{supplier.address}</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Bank Section */}
            {(supplier.bankName || supplier.bankAccount || supplier.bankBranch) ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="bank" size={18} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Thông tin ngân hàng</Text>
                </View>

                <View style={styles.cardContent}>
                  {supplier.bankName ? (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Tên ngân hàng</Text>
                      <Text style={styles.infoValue}>{supplier.bankName}</Text>
                    </View>
                  ) : null}

                  {supplier.bankAccount ? (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Số tài khoản</Text>
                      <Text style={styles.infoValue}>{supplier.bankAccount}</Text>
                    </View>
                  ) : null}

                  {supplier.bankBranch ? (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Chi nhánh</Text>
                      <Text style={styles.infoValue}>{supplier.bankBranch}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Payment Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="cash-multiple" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Điều khoản thanh toán</Text>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.paymentGrid}>
                  <View style={styles.paymentItem}>
                    <View style={styles.paymentIconBox}>
                      <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.paymentLabel}>Kỳ hạn</Text>
                    <Text style={styles.paymentValue}>{supplier.paymentTermDays} ngày</Text>
                  </View>

                  <View style={styles.paymentDivider} />

                  <View style={styles.paymentItem}>
                    <View style={styles.paymentIconBox}>
                      <MaterialCommunityIcons name="clipboard-text-clock" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.paymentLabel}>Ghi nhận nợ</Text>
                    <Text style={styles.paymentValue} numberOfLines={2}>
                      {getDebtModeLabel(supplier.debtRecognitionMode)}
                    </Text>
                  </View>
                </View>

                <View style={styles.debtCard}>
                  <View style={styles.debtHeader}>
                    <MaterialCommunityIcons name="alert-circle" size={16} color={COLORS.primary} />
                    <Text style={styles.debtTitle}>Hạn mức công nợ</Text>
                  </View>
                  <Text style={styles.debtAmount}>{formatCurrency(supplier.maxDebt)}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {supplier.description ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="text-box" size={18} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Mô tả</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.descriptionText}>{supplier.description}</Text>
                </View>
              </View>
            ) : null}

            {/* Footer Info */}
            <View style={styles.footerCard}>
              <View style={styles.footerItem}>
                <MaterialCommunityIcons name="clock-plus-outline" size={14} color={COLORS.gray400} />
                <Text style={styles.footerLabel}>Ngày tạo</Text>
                <Text style={styles.footerValue}>
                  {new Date(supplier.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <MaterialCommunityIcons name="clock-edit-outline" size={14} color={COLORS.gray400} />
                <Text style={styles.footerLabel}>Cập nhật</Text>
                <Text style={styles.footerValue}>
                  {new Date(supplier.updatedAt).toLocaleDateString('vi-VN', {
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
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  avatarActive: {
    backgroundColor: COLORS.gray50,
    borderColor: COLORS.primary,
  },
  avatarInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray200,
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
  statusActive: {
    backgroundColor: COLORS.success,
  },
  statusInactive: {
    backgroundColor: COLORS.error,
  },
  supplierName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray800,
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  dividerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gray400,
  },
  typeText: {
    fontSize: 13,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusActiveText: {
    color: COLORS.success,
  },
  statusInactiveText: {
    color: COLORS.error,
  },
  taxCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    width: '100%',
    justifyContent: 'center',
  },
  taxCodeLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  taxCodeValue: {
    fontSize: 13,
    color: COLORS.gray800,
    fontWeight: '700',
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
  paymentGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  paymentItem: {
    flex: 1,
    alignItems: 'center',
  },
  paymentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 4,
    textAlign: 'center',
  },
  paymentValue: {
    fontSize: 13,
    color: COLORS.gray800,
    fontWeight: '700',
    textAlign: 'center',
  },
  paymentDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 12,
  },
  debtCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  debtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  debtTitle: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  debtAmount: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 22,
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
    width: 70,
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