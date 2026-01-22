import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { contractService } from '../../../services/contractService';
import { Contract } from '../../../types/contract';

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

interface ContractDetailProps {
  visible: boolean;
  contractId: string | null;
  onClose: () => void;
}

export default function ContractDetail({ visible, contractId, onClose }: ContractDetailProps) {
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (visible && contractId) {
      loadContractDetail();
    }
  }, [visible, contractId]);

  const loadContractDetail = async () => {
    if (!contractId) return;

    setLoading(true);
    try {
      const data = await contractService.getContractById(contractId);
      setContract(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết hợp đồng');
      onClose();
    } finally {
      setLoading(false);
    }
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
      PENDING: COLORS.warning,
      OVERDUE: COLORS.error,
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
      PENDING: 'Chờ thanh toán',
      OVERDUE: 'Quá hạn',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PURCHASE: 'Mua hàng',
      SALE: 'Bán hàng',
      SERVICE: 'Dịch vụ',
    };
    return labels[type] || type;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.gray800} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết hợp đồng</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : contract ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Contract Info */}
            <View style={styles.section}>
              <View style={styles.infoHeader}>
                <Text style={styles.contractNumber}>{contract.contractNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(contract.status) }]}>
                    {getStatusLabel(contract.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.contractTitle}>{contract.title}</Text>
              
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="shape" size={16} color={COLORS.gray600} />
                <Text style={styles.infoText}>{getTypeLabel(contract.contractType)}</Text>
              </View>

              <View style={styles.dateContainer}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>Ngày ký</Text>
                  <Text style={styles.dateValue}>{formatDate(contract.signDate)}</Text>
                </View>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>Bắt đầu</Text>
                  <Text style={styles.dateValue}>{formatDate(contract.startDate)}</Text>
                </View>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>Kết thúc</Text>
                  <Text style={styles.dateValue}>{formatDate(contract.endDate)}</Text>
                </View>
              </View>

              <View style={styles.totalValueContainer}>
                <Text style={styles.totalValueLabel}>Tổng giá trị hợp đồng</Text>
                <Text style={styles.totalValue}>{formatCurrency(contract.totalValue)}</Text>
              </View>
            </View>

            {/* Supplier Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="handshake-outline" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Nhà cung cấp</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.supplierName}>{contract.supplier.name}</Text>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.gray600} />
                  <Text style={styles.infoTextSmall}>{contract.supplier.address}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={14} color={COLORS.gray600} />
                  <Text style={styles.infoTextSmall}>{contract.supplier.phoneNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="email" size={14} color={COLORS.gray600} />
                  <Text style={styles.infoTextSmall}>{contract.supplier.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="file-document" size={14} color={COLORS.gray600} />
                  <Text style={styles.infoTextSmall}>Mã số thuế: {contract.supplier.taxCode}</Text>
                </View>
              </View>
            </View>

            {/* Payment Terms */}
            {contract.terms && contract.terms.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="cash-multiple" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Điều khoản thanh toán ({contract.terms.length})</Text>
                </View>
                {contract.terms.map((term, index) => {
                  const termStatusColor = getStatusColor(term.status);
                  return (
                    <View key={term.id} style={styles.termCard}>
                      <View style={styles.termHeader}>
                        <View style={styles.termTitleRow}>
                          <Text style={styles.termIndex}>#{index + 1}</Text>
                          <Text style={styles.termTitle}>{term.title}</Text>
                        </View>
                        <View style={[styles.termStatusBadge, { backgroundColor: termStatusColor + '15' }]}>
                          <Text style={[styles.termStatusText, { color: termStatusColor }]}>
                            {getStatusLabel(term.status)}
                          </Text>
                        </View>
                      </View>
                      
                      {term.note && (
                        <Text style={styles.termNote}>{term.note}</Text>
                      )}
                      
                      <View style={styles.termDates}>
                        <View style={styles.termDateItem}>
                          <MaterialCommunityIcons name="calendar-clock" size={14} color={COLORS.gray600} />
                          <Text style={styles.termDateLabel}>Hạn: {formatDate(term.dueDate)}</Text>
                        </View>
                        {term.paymentDate && (
                          <View style={styles.termDateItem}>
                            <MaterialCommunityIcons name="calendar-check" size={14} color={COLORS.success} />
                            <Text style={styles.termDateLabel}>Đã TT: {formatDate(term.paymentDate)}</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.termAmountRow}>
                        <Text style={styles.termAmountLabel}>Số tiền:</Text>
                        <Text style={styles.termAmount}>{formatCurrency(term.amount)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Contract Items/Products */}
            {contract.items && contract.items.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="package-variant" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Sản phẩm ({contract.items.length})</Text>
                </View>
                {contract.items.map((item, index) => {
                  const finalPrice = item.totalPrice + item.tax - item.discount;
                  return (
                    <View key={item.id} style={styles.productCard}>
                      <View style={styles.productHeader}>
                        <Text style={styles.productIndex}>#{index + 1}</Text>
                        <Text style={styles.productName}>{item.product.name}</Text>
                      </View>
                      
                      <View style={styles.productDetails}>
                        <View style={styles.productDetailRow}>
                          <Text style={styles.productLabel}>SKU:</Text>
                          <Text style={styles.productValue}>{item.product.sku}</Text>
                        </View>
                        <View style={styles.productDetailRow}>
                          <Text style={styles.productLabel}>Số lượng:</Text>
                          <Text style={styles.productValue}>{item.quantity} {item.product.unit}</Text>
                        </View>
                        <View style={styles.productDetailRow}>
                          <Text style={styles.productLabel}>Đơn giá:</Text>
                          <Text style={styles.productValue}>{formatCurrency(item.unitPrice)} đ</Text>
                        </View>
                        <View style={styles.productDetailRow}>
                          <Text style={styles.productLabel}>Tạm tính:</Text>
                          <Text style={styles.productValue}>{formatCurrency(item.totalPrice)} đ</Text>
                        </View>
                        {item.discount > 0 && (
                          <View style={styles.productDetailRow}>
                            <Text style={styles.productLabel}>Giảm giá:</Text>
                            <Text style={[styles.productValue, { color: COLORS.error }]}>
                              -{formatCurrency(item.discount)}
                            </Text>
                          </View>
                        )}
                        {item.tax > 0 && (
                          <View style={styles.productDetailRow}>
                            <Text style={styles.productLabel}>Thuế:</Text>
                            <Text style={styles.productValue}>{formatCurrency(item.tax)}</Text>
                          </View>
                        )}
                      </View>

                      {item.note && (
                        <View style={styles.productNoteContainer}>
                          <MaterialCommunityIcons name="note-text" size={14} color={COLORS.gray600} />
                          <Text style={styles.productNote}>{item.note}</Text>
                        </View>
                      )}

                      <View style={styles.productFooter}>
                        <Text style={styles.productTotalLabel}>Thành tiền:</Text>
                        <Text style={styles.productTotal}>{formatCurrency(finalPrice)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Documents */}
            {contract.documents && contract.documents.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="file-document-multiple" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Tài liệu ({contract.documents.length})</Text>
                </View>
                {contract.documents.map((doc) => (
                  <View key={doc.id} style={styles.documentCard}>
                    <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.gray600} />
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{doc.fileName}</Text>
                      <Text style={styles.documentDate}>
                        Tải lên: {formatDate(doc.uploadedAt)}
                      </Text>
                    </View>
                    <TouchableOpacity>
                      <MaterialCommunityIcons name="download" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Không tìm thấy hợp đồng</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.gray600,
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
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contractNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 12,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  infoTextSmall: {
    fontSize: 13,
    color: COLORS.gray600,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  dateBox: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 4,
    width: '100%',
    textAlign: 'center',
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  totalValueContainer: {
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  totalValueLabel: {
    fontSize: 13,
    color: COLORS.gray600,
    marginBottom: 4,
    width: '100%',
    textAlign: 'center',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  card: {
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  supplierName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  termCard: {
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  termTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  termIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  termTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    flex: 1,
  },
  termStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  termStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  termNote: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  termDates: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  termDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  termDateLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  termAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  termAmountLabel: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  termAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  productCard: {
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  productIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    flex: 1,
  },
  productDetails: {
    gap: 6,
  },
  productDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productLabel: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  productValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  productNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  productNote: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: 'italic',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  productTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  productTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 11,
    color: COLORS.gray600,
  },
});
