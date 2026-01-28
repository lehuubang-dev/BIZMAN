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
import { goodsReceiptService } from '../../../services/goodsReceiptService';
import { GoodsReceipt } from '../../../types/goodsReceipt';

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

interface GoodsReceiptDetailProps {
  visible: boolean;
  receiptId: string | null;
  onClose: () => void;
  onEdit: (receiptId: string) => void;
  onApprove: (receiptId: string, receiptCode: string) => void;
}

export default function GoodsReceiptDetail({
  visible,
  receiptId,
  onClose,
  onEdit,
  onApprove,
}: GoodsReceiptDetailProps) {
  const [receipt, setReceipt] = useState<GoodsReceipt | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && receiptId) {
      loadReceipt();
    }
  }, [visible, receiptId]);

  const loadReceipt = async () => {
    if (!receiptId) return;

    setLoading(true);
    try {
      const data = await goodsReceiptService.getGoodsReceiptById(receiptId);
      setReceipt(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết phiếu nhập hàng');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: COLORS.gray600,
      RECEIVED: COLORS.success,
      PARTIAL: COLORS.warning,
      CANCELLED: COLORS.error,
    };
    return colors[status] || COLORS.gray600;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Nháp',
      RECEIVED: 'Đã nhập kho',
      PARTIAL: 'Nhập một phần',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  if (loading || !receipt) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </Modal>
    );
  }

  const statusColor = getStatusColor(receipt.status);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.gray800} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết phiếu nhập</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Receipt Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin phiếu</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Mã phiếu:</Text>
              <Text style={styles.value}>{receipt.receiptCode}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Ngày nhập:</Text>
              <Text style={styles.value}>
                {new Date(receipt.receiptDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Trạng thái:</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusLabel(receipt.status)}
                </Text>
              </View>
            </View>

            {receipt.purchaseOrder && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Đơn hàng:</Text>
                <Text style={styles.value}>{receipt.purchaseOrder.orderNumber}</Text>
              </View>
            )}

            {receipt.note && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Ghi chú:</Text>
                <Text style={styles.value}>{receipt.note}</Text>
              </View>
            )}
          </View>

          {/* Supplier & Warehouse */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin đối tác</Text>
            
            {receipt.supplier && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Nhà cung cấp:</Text>
                  <Text style={styles.value}>{receipt.supplier.name}</Text>
                </View>
                {receipt.supplier.address && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Địa chỉ:</Text>
                    <Text style={styles.value}>{receipt.supplier.address}</Text>
                  </View>
                )}
              </>
            )}

            {receipt.warehouse && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Kho:</Text>
                  <Text style={styles.value}>{receipt.warehouse.name}</Text>
                </View>
                {receipt.warehouse.address && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Địa chỉ kho:</Text>
                    <Text style={styles.value}>{receipt.warehouse.address}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Products */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sản phẩm ({receipt.products.length})</Text>
            
            {receipt.products.map((item, index) => (
              <View key={index} style={styles.productCard}>
                <Text style={styles.productName}>{item.product.name}</Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productDetail}>SL: {item.quantity}</Text>
                  <Text style={styles.productDetail}>Vị trí: {item.location}</Text>
                  <Text style={styles.productDetail}>Tầng: {item.stack}</Text>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productDetail}>Đơn giá: {formatCurrency(item.unitPrice)} đ</Text>
                  <Text style={styles.productDetail}>Phí: {formatCurrency(item.fee)} đ</Text>
                </View>
                <View style={styles.productFooter}>
                  <Text style={styles.productTotal}>
                    Thành tiền: {formatCurrency(item.totalPrice)} đ
                  </Text>
                </View>
                {item.note && (
                  <Text style={styles.productNote}>Ghi chú: {item.note}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Documents */}
          {receipt.documents && receipt.documents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tài liệu ({receipt.documents.length})</Text>
              
              {receipt.documents.map((doc, index) => (
                <View key={doc.id} style={styles.documentCard}>
                  <MaterialCommunityIcons name="file-document" size={20} color={COLORS.gray600} />
                  <Text style={styles.documentText}>{doc.fileName}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Total */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng kết</Text>
            
            <View style={[styles.infoRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng tiền:</Text>
              <Text style={styles.totalValue}>{formatCurrency(receipt.subTotal)} đ</Text>
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        {receipt.status === 'DRAFT' && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => onEdit(receipt.id)}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={COLORS.warning} />
              <Text style={styles.editButtonText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={() => onApprove(receipt.id, receipt.receiptCode)}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.white} />
              <Text style={styles.approveButtonText}>Duyệt</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.gray600,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    flex: 2,
    textAlign: 'right',
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
  productCard: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  productDetail: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  productFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: 8,
    marginTop: 8,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  productNote: {
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: 'italic',
    marginTop: 4,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray800,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: COLORS.warning + '15',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
