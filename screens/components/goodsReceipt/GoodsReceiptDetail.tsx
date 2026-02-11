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
  gray700: '#374151',
  gray800: '#1F2937',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#9333EA',
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
      PARTIAL_COMPLETED: COLORS.purple,
      CANCELLED: COLORS.error,
    };
    return colors[status] || COLORS.gray600;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Nháp',
      RECEIVED: 'Đã nhập kho',
      PARTIAL: 'Nhập một phần',
      PARTIAL_COMPLETED: 'Hoàn thành một phần',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  if (loading || !receipt) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
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
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="file-document-edit" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Chi tiết phiếu nhập</Text>
              <Text style={styles.headerSubtitle}>{receipt.receiptCode}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={22} color={COLORS.gray600} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusLeft}>
              <MaterialCommunityIcons name="information-outline" size={20} color={statusColor} />
              <Text style={styles.statusLabel}>Trạng thái</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(receipt.status)}
              </Text>
            </View>
          </View>

          {/* Quick Info Grid */}
          <View style={styles.quickGrid}>
            <View style={styles.quickCard}>
              <View style={[styles.quickIcon, { backgroundColor: '#EFF6FF' }]}>
                <MaterialCommunityIcons name="calendar" size={20} color="#3B82F6" />
              </View>
              <View style={styles.quickInfo}>
                <Text style={styles.quickLabel}>Ngày nhập</Text>
                <Text style={styles.quickValue}>
                  {new Date(receipt.receiptDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>

            <View style={styles.quickCard}>
              <View style={[styles.quickIcon, { backgroundColor: '#F0FDF4' }]}>
                <MaterialCommunityIcons name="package-variant" size={20} color="#10B981" />
              </View>
              <View style={styles.quickInfo}>
                <Text style={styles.quickLabel}>Sản phẩm</Text>
                <Text style={styles.quickValue}>{receipt.products.length}</Text>
              </View>
            </View>
          </View>

          {/* Receipt Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="clipboard-text" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Thông tin phiếu</Text>
            </View>

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons name="barcode" size={16} color="#3B82F6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Mã phiếu</Text>
                  <Text style={styles.infoValue}>{receipt.receiptCode}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons name="calendar-plus" size={16} color="#10B981" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngày tạo</Text>
                  <Text style={styles.infoValue}>
                    {new Date(receipt.createdAt).toLocaleDateString('vi-VN')} {new Date(receipt.createdAt).toLocaleTimeString('vi-VN')}
                  </Text>
                </View>
              </View>

              {receipt.description && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <MaterialCommunityIcons name="text" size={16} color="#6B7280" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Mô tả</Text>
                    <Text style={styles.infoValue}>{receipt.description}</Text>
                  </View>
                </View>
              )}

              {receipt.note && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <MaterialCommunityIcons name="note-text" size={16} color="#F59E0B" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Ghi chú</Text>
                    <Text style={styles.infoValue}>{receipt.note}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Purchase Order */}
          {receipt.purchaseOrder && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="cart" size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Đơn hàng mua</Text>
              </View>

              <View style={styles.poCard}>
                <View style={styles.poHeader}>
                  <Text style={styles.poNumber}>{receipt.purchaseOrder.orderNumber}</Text>
                  <Text style={[styles.poStatus, { color: COLORS.success }]}>
                    {receipt.purchaseOrder.orderStatus}
                  </Text>
                </View>

                <View style={styles.poGrid}>
                  <View style={styles.poItem}>
                    <MaterialCommunityIcons name="calendar-clock" size={14} color="#6B7280" />
                    <Text style={styles.poLabel}>Ngày đặt</Text>
                    <Text style={styles.poValue}>
                      {new Date(receipt.purchaseOrder.orderDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>

                  <View style={styles.poItem}>
                    <MaterialCommunityIcons name="cash" size={14} color="#059669" />
                    <Text style={styles.poLabel}>Tổng tiền</Text>
                    <Text style={styles.poValue}>{formatCurrency(receipt.purchaseOrder.totalAmount)}</Text>
                  </View>
                </View>

                {receipt.purchaseOrder.note && (
                  <View style={styles.poNote}>
                    <MaterialCommunityIcons name="note" size={14} color="#6B7280" />
                    <Text style={styles.poNoteText}>{receipt.purchaseOrder.note}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Supplier */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="store" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Nhà cung cấp</Text>
            </View>

            <View style={styles.supplierCard}>
              <View style={styles.supplierHeader}>
                <Text style={styles.supplierName}>{receipt.supplier.name}</Text>
                <View style={styles.supplierTypeBadge}>
                  <Text style={styles.supplierType}>
                    {receipt.supplier.supplierType === 'COMPANY' ? 'Công ty' : 'Cá nhân'}
                  </Text>
                </View>
              </View>

              <Text style={styles.supplierCode}>{receipt.supplier.code}</Text>

              <View style={styles.supplierDetails}>
                {receipt.supplier.address && (
                  <View style={styles.supplierRow}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                    <Text style={styles.supplierText}>{receipt.supplier.address}</Text>
                  </View>
                )}

                {receipt.supplier.phoneNumber && (
                  <View style={styles.supplierRow}>
                    <MaterialCommunityIcons name="phone" size={16} color="#6B7280" />
                    <Text style={styles.supplierText}>{receipt.supplier.phoneNumber}</Text>
                  </View>
                )}

                {receipt.supplier.email && (
                  <View style={styles.supplierRow}>
                    <MaterialCommunityIcons name="email" size={16} color="#6B7280" />
                    <Text style={styles.supplierText}>{receipt.supplier.email}</Text>
                  </View>
                )}

                {/* {receipt.supplier.taxCode && (
                  <View style={styles.supplierRow}>
                    <MaterialCommunityIcons name="identifier" size={16} color="#6B7280" />
                    <Text style={styles.supplierText}>MST: {receipt.supplier.taxCode}</Text>
                  </View>
                )} */}
              </View>
            </View>
          </View>

          {/* Warehouse */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="warehouse" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Kho hàng</Text>
            </View>

            <View style={styles.warehouseCard}>
              <View style={styles.warehouseHeader}>
                <Text style={styles.warehouseName}>{receipt.warehouse.name}</Text>
                <View style={styles.warehouseTypeBadge}>
                  <Text style={styles.warehouseType}>
                    {receipt.warehouse.type === 'MAIN' ? 'Kho chính' : 'Kho tạm'}
                  </Text>
                </View>
              </View>

              {receipt.warehouse.address && (
                <View style={styles.warehouseRow}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                  <Text style={styles.warehouseText}>{receipt.warehouse.address}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="package-variant" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Sản phẩm</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{receipt.products.length}</Text>
              </View>
            </View>

            {receipt.products.map((item, index) => (
              <View key={index} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <View style={styles.productLeft}>
                    <Text style={styles.productName}>{item.variant.name}</Text>
                    {item.variant.sku && (
                      <Text style={styles.productSku}>SKU: {item.variant.sku}</Text>
                    )}
                  </View>
                  <View style={styles.productQuantity}>
                    <Text style={styles.quantityValue}>{item.quantity}</Text>
                    <Text style={styles.quantityUnit}>{item.variant.unit || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.productBody}>
                  <View style={styles.productRow}>
                    <View style={styles.productCol}>
                      <MaterialCommunityIcons name="cash" size={14} color="#059669" />
                      <Text style={styles.productLabel}>Đơn giá</Text>
                      <Text style={styles.productValue}>{formatCurrency(item.unitPrice)}</Text>
                    </View>

                    <View style={styles.productCol}>
                      <MaterialCommunityIcons name="calculator" size={14} color="#3B82F6" />
                      <Text style={styles.productLabel}>Tổng phụ</Text>
                      <Text style={styles.productValue}>{formatCurrency(item.subTotal)}</Text>
                    </View>
                  </View>

                  {(item.taxRate || item.taxAmount) && (
                    <View style={styles.productRow}>
                      {item.taxRate && (
                        <View style={styles.productCol}>
                          <MaterialCommunityIcons name="percent" size={14} color="#F59E0B" />
                          <Text style={styles.productLabel}>Thuế suất</Text>
                          <Text style={styles.productValue}>{item.taxRate}%</Text>
                        </View>
                      )}

                      {item.taxAmount && (
                        <View style={styles.productCol}>
                          <MaterialCommunityIcons name="cash-multiple" size={14} color="#F59E0B" />
                          <Text style={styles.productLabel}>Tiền thuế</Text>
                          <Text style={styles.productValue}>{formatCurrency(item.taxAmount)}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {(item.variant.model || item.variant.partNumber) && (
                    <View style={styles.technicalInfo}>
                      {item.variant.model && (
                        <View style={styles.techRow}>
                          <MaterialCommunityIcons name="cube-outline" size={12} color="#6B7280" />
                          <Text style={styles.techText}>Model: {item.variant.model}</Text>
                        </View>
                      )}
                      {item.variant.partNumber && (
                        <View style={styles.techRow}>
                          <MaterialCommunityIcons name="identifier" size={12} color="#6B7280" />
                          <Text style={styles.techText}>Part: {item.variant.partNumber}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {item.variant.attributes && Object.keys(item.variant.attributes).length > 0 && (
                    <View style={styles.attributesBox}>
                      <View style={styles.attributesHeader}>
                        <MaterialCommunityIcons name="cog-outline" size={14} color="#8B5CF6" />
                        <Text style={styles.attributesTitle}>Thuộc tính</Text>
                      </View>
                      <View style={styles.attributesGrid}>
                        {Object.entries(item.variant.attributes).map(([key, value]) => (
                          <View key={key} style={styles.attrChip}>
                            <MaterialCommunityIcons name="check-circle" size={12} color="#8B5CF6" />
                            <Text style={styles.attrKey}>{key}:</Text>
                            <Text style={styles.attrValue}>{String(value)}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.productFooter}>
                  <Text style={styles.productTotal}>
                    Thành tiền: <Text style={styles.productTotalValue}>{formatCurrency(item.totalPrice)}</Text>
                  </Text>
                </View>

                {(item.note || item.manufactureDate || item.expiryDate) && (
                  <View style={styles.productNotes}>
                    {item.note && (
                      <View style={styles.noteRow}>
                        <MaterialCommunityIcons name="note-text" size={12} color="#6B7280" />
                        <Text style={styles.noteText}>{item.note}</Text>
                      </View>
                    )}
                    {item.manufactureDate && (
                      <View style={styles.noteRow}>
                        <MaterialCommunityIcons name="factory" size={12} color="#6B7280" />
                        <Text style={styles.noteText}>
                          NSX: {new Date(item.manufactureDate).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    )}
                    {item.expiryDate && (
                      <View style={styles.noteRow}>
                        <MaterialCommunityIcons name="calendar-clock" size={12} color="#6B7280" />
                        <Text style={styles.noteText}>
                          HSD: {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Documents */}
          {receipt.documents && receipt.documents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="file-document-multiple" size={20} color="#8B5CF6" />
                <Text style={styles.sectionTitle}>Tài liệu</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{receipt.documents.length}</Text>
                </View>
              </View>

              <View style={styles.docList}>
                {receipt.documents.map((doc) => (
                  <View key={doc.id} style={styles.docItem}>
                    <View style={styles.docIcon}>
                      <MaterialCommunityIcons name="file-document" size={18} color="#3B82F6" />
                    </View>
                    <Text style={styles.docName}>{doc.fileName}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Financial Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="calculator" size={20} color="#059669" />
              <Text style={styles.sectionTitle}>Tổng kết tài chính</Text>
            </View>

            <View style={styles.financialCard}>
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>Tổng phụ</Text>
                <Text style={styles.financialValue}>{formatCurrency(receipt.subTotal)}</Text>
              </View>

              {receipt.taxAmount && (
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Tổng thuế</Text>
                  <Text style={styles.financialValue}>{formatCurrency(receipt.taxAmount)}</Text>
                </View>
              )}

              {receipt.discountAmount !== undefined && receipt.discountAmount > 0 && (
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Chiết khấu</Text>
                  <Text style={[styles.financialValue, { color: COLORS.error }]}>
                    -{formatCurrency(receipt.discountAmount)} 
                  </Text>
                </View>
              )}

              {receipt.fee !== undefined && receipt.fee > 0 && (
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Phí khác</Text>
                  <Text style={styles.financialValue}>{formatCurrency(receipt.fee)} </Text>
                </View>
              )}

              <View style={styles.financialTotal}>
                <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
                <Text style={styles.totalValue}>
                  {receipt.totalAmount ? formatCurrency(receipt.totalAmount) : formatCurrency(receipt.subTotal)} 
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Actions */}
        {receipt.status === 'DRAFT' && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => onEdit(receipt.id)}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#F59E0B" />
              <Text style={styles.editBtnText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => onApprove(receipt.id, receipt.receiptCode)}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
              <Text style={styles.approveBtnText}>Duyệt phiếu</Text>
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
    backgroundColor: '#F9FAFB',
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
    width: '100%',
    textAlign: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.gray600,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    flex: 1,
  },

  // Status Card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Quick Grid
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  quickCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickInfo: {
    flex: 1,
  },
  quickLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '600',
    marginBottom: 3,
  },
  quickValue: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '700',
  },

  // Section
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Info List
  infoList: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '600',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '700',
  },

  // Purchase Order
  poCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  poHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  poNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  poStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  poGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  poItem: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  poLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  poValue: {
    fontSize: 13,
    color: COLORS.gray800,
    fontWeight: '700',
  },
  poNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 12,
    padding: 10,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
  },
  poNoteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray700,
    lineHeight: 18,
  },

  // Supplier
  supplierCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  supplierName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  supplierTypeBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  supplierType: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '700',
  },
  supplierCode: {
    fontSize: 13,
    color: COLORS.gray600,
    fontWeight: '600',
    marginBottom: 12,
  },
  supplierDetails: {
    gap: 8,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supplierText: {
    fontSize: 12,
    color: COLORS.gray700,
  },

  // Warehouse
  warehouseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  warehouseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  warehouseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  warehouseTypeBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  warehouseType: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  warehouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warehouseText: {
    fontSize: 12,
    color: COLORS.gray700,
  },
  warehouseDesc: {
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 18,
  },

  // Products
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  productLeft: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 3,
  },
  productSku: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  productQuantity: {
    alignItems: 'flex-end',
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  quantityUnit: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  productBody: {
    gap: 10,
  },
  productRow: {
    flexDirection: 'row',
    gap: 10,
  },
  productCol: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  productLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  productValue: {
    fontSize: 13,
    color: COLORS.gray800,
    fontWeight: '700',
  },
  technicalInfo: {
    gap: 6,
    paddingVertical: 8,
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  techText: {
    fontSize: 12,
    color: COLORS.gray700,
  },
  attributesBox: {
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    padding: 10,
  },
  attributesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  attributesTitle: {
    fontSize: 12,
    color: COLORS.gray700,
    fontWeight: '700',
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  attrChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  attrKey: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
  },
  attrValue: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  productFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 12,
    marginTop: 12,
  },
  productTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  productTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  productNotes: {
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.gray600,
    fontStyle: 'italic',
  },

  // Documents
  docList: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    overflow: 'hidden',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },

  // Financial
  financialCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  financialLabel: {
    fontSize: 14,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  financialValue: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '700',
  },
  financialTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.gray200,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gray800,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.success,
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});