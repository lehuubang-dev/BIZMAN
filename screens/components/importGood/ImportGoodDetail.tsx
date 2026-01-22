import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PurchaseOrder } from '../../../types/purchaseOrder';
import { purchaseOrderService } from '../../../services/purchaseOrderService';

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
  indigo: '#6366F1',
};

interface ImportGoodDetailProps {
  visible: boolean;
  orderId: string | null;
  onClose: () => void;
  onApprove?: (orderId: string, orderNumber: string) => void;
}

export default function ImportGoodDetail({ visible, orderId, onClose, onApprove }: ImportGoodDetailProps) {
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && orderId) {
      loadOrderDetail();
    }
  }, [visible, orderId]);

  const loadOrderDetail = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const data = await purchaseOrderService.getPurchaseOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN') ;
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

  const renderProductItem = ({ item, index }: { item: any; index: number }) => {
    const primaryImage = item.images?.find((img: any) => img.isPrimary);
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productIndex}>#{index + 1}</Text>
        </View>
        
        <View style={styles.productBody}>
          {primaryImage && (
            <Image
              source={{ uri: `http://192.168.5.109:8080${primaryImage.imageUrl}` }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productSku}>SKU: {item.sku}</Text>
            
            <View style={styles.productRow}>
              <View style={styles.productBadge}>
                <Text style={styles.badgeText}>SL: {item.quantity} {item.unit}</Text>
              </View>
              <View style={styles.productBadge}>
                <Text style={styles.badgeText}>Giảm: {item.discountPercent}%</Text>
              </View>
              <View style={styles.productBadge}>
                <Text style={styles.badgeText}>Thuế: {item.taxPercent}%</Text>
              </View>
            </View>

            <View style={styles.priceGrid}>
              <View style={styles.priceGridItem}>
                <Text style={styles.priceGridLabel}>Đơn giá</Text>
                <Text style={styles.priceGridValue}>{formatCurrency(item.unitPrice)}</Text>
              </View>
              <View style={styles.priceGridItem}>
                <Text style={styles.priceGridLabel}>Thành tiền</Text>
                <Text style={[styles.priceGridValue, { color: COLORS.success }]}>
                  {formatCurrency(item.finalPrice)}
                </Text>
              </View>
            </View>

            {item.note && (
              <Text style={styles.productNote}>Ghi chú: {item.note}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!order && !loading) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chi tiết đơn nhập hàng</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : order ? (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Order Info */}
              <View style={styles.infoCard}>
                <View style={styles.orderHeader}>
                  <MaterialCommunityIcons name="package-variant" size={32} color={COLORS.primary} />
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.orderStatus) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.orderStatus) }]}>
                    {getStatusLabel(order.orderStatus)}
                  </Text>
                </View>

                <View style={styles.dateRow}>
                  <MaterialCommunityIcons name="calendar" size={16} color={COLORS.gray600} />
                  <Text style={styles.dateText}>
                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>

              {/* Supplier Info */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="handshake-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Nhà cung cấp</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.supplierName}>{order.supplier.name}</Text>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.gray600} />
                    <Text style={styles.infoText}>{order.supplier.address}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="phone" size={14} color={COLORS.gray600} />
                    <Text style={styles.infoText}>{order.supplier.phoneNumber}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="email" size={14} color={COLORS.gray600} />
                    <Text style={styles.infoText}>{order.supplier.email}</Text>
                  </View>
                </View>
              </View>

              {/* Warehouse Info */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="warehouse" size={18} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Kho nhập</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.warehouseName}>{order.warehouse.name}</Text>
                  <Text style={styles.warehouseAddress}>{order.warehouse.address}</Text>
                </View>
              </View>

              {/* Products */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="cart" size={18} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Sản phẩm ({order.products.length})</Text>
                </View>
                <FlatList
                  data={order.products}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  renderItem={renderProductItem}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.productSeparator} />}
                />
              </View>

              {/* Summary */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="calculator" size={18} color={COLORS.primary} />
                  <Text style={styles.cardTitle}>Tổng kết</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tổng phụ:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(order.subTotal)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Thuế:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(order.taxAmount)}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
                  </View>
                </View>
              </View>

              {/* Notes */}
              {(order.description || order.note) && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="text" size={18} color={COLORS.primary} />
                    <Text style={styles.cardTitle}>Ghi chú</Text>
                  </View>
                  <View style={styles.cardContent}>
                    {order.description && (
                      <Text style={styles.noteText}>{order.description}</Text>
                    )}
                    {order.note && (
                      <Text style={styles.noteText}>{order.note}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Actions */}
              {order.orderStatus === 'DRAFT' && onApprove && (
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => onApprove(order.id, order.orderNumber)}
                >
                  <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.white} />
                  <Text style={styles.approveButtonText}>Duyệt đơn hàng</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>
          ) : null}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.gray600,
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
  supplierName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray600,
  },
  warehouseName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  warehouseAddress: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  productCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  productHeader: {
    marginBottom: 8,
  },
  productIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  productBody: {
    flexDirection: 'row',
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  productSku: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  productBadge: {
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  priceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  priceGridItem: {
    flex: 1,
  },
  priceGridLabel: {
    fontSize: 10,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  priceGridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  productNote: {
    fontSize: 11,
    color: COLORS.warning,
    fontStyle: 'italic',
  },
  productSeparator: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: COLORS.gray200,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.success,
  },
  noteText: {
    fontSize: 14,
    color: COLORS.gray800,
    lineHeight: 20,
    marginBottom: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.success,
    marginHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
