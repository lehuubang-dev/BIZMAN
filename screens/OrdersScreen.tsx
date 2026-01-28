import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF9800',
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
  blue: '#2196F3',
  purple: '#9C27B0',
};

interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
  note: string;
}

type OrderStatus = 'NEW' | 'PENDING' | 'READY' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  note?: string;
}

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  
  // Form states
  const [customer, setCustomer] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [note, setNote] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [itemNote, setItemNote] = useState('');

  // Mock data
  const products: Product[] = [
    { id: '1', name: 'Laptop Dell XPS 13', quantity: 45, unit: 'Chiếc', price: 25000000 },
    { id: '2', name: 'iPhone 15 Pro Max', quantity: 28, unit: 'Chiếc', price: 35000000 },
    { id: '3', name: 'Samsung Galaxy S24', quantity: 35, unit: 'Chiếc', price: 22000000 },
    { id: '4', name: 'iPad Air M2', quantity: 20, unit: 'Chiếc', price: 18000000 },
    { id: '5', name: 'AirPods Pro 2', quantity: 85, unit: 'Chiếc', price: 6500000 },
  ];

  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'DH-2026-001',
      customer: 'Nguyễn Văn A',
      date: '27/01/2026',
      status: 'NEW',
      items: [{ product: products[0], quantity: 2, note: '' }],
      total: 50000000,
    },
    {
      id: '2',
      orderNumber: 'DH-2026-002',
      customer: 'Trần Thị B',
      date: '27/01/2026',
      status: 'PENDING',
      items: [{ product: products[1], quantity: 1, note: '' }],
      total: 35000000,
    },
    {
      id: '3',
      orderNumber: 'DH-2026-003',
      customer: 'Lê Văn C',
      date: '26/01/2026',
      status: 'READY',
      items: [{ product: products[2], quantity: 3, note: '' }],
      total: 66000000,
    },
    {
      id: '4',
      orderNumber: 'DH-2026-004',
      customer: 'Phạm Thị D',
      date: '26/01/2026',
      status: 'DELIVERED',
      items: [{ product: products[3], quantity: 1, note: '' }],
      total: 18000000,
    },
    {
      id: '5',
      orderNumber: 'DH-2026-005',
      customer: 'Hoàng Văn E',
      date: '25/01/2026',
      status: 'CANCELLED',
      items: [{ product: products[4], quantity: 5, note: '' }],
      total: 32500000,
      note: 'Khách hủy do thay đổi ý định',
    },
  ];

  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      NEW: { label: 'Đơn mới', color: COLORS.blue, icon: 'document-text' },
      PENDING: { label: 'Chờ xử lý', color: COLORS.warning, icon: 'time' },
      READY: { label: 'Chờ lấy hàng', color: COLORS.purple, icon: 'cube' },
      DELIVERED: { label: 'Đã giao', color: COLORS.success, icon: 'checkmark-circle' },
      CANCELLED: { label: 'Đã hủy', color: COLORS.error, icon: 'close-circle' },
    };
    return configs[status];
  };

  const filteredOrders = selectedStatus === 'ALL' 
    ? mockOrders 
    : mockOrders.filter(o => o.status === selectedStatus);

  const handleAddItem = () => {
    if (!selectedProduct) {
      Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm');
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập số lượng hợp lệ');
      return;
    }

    if (parseInt(quantity) > selectedProduct.quantity) {
      Alert.alert('Thông báo', `Không đủ hàng trong kho. Tồn kho: ${selectedProduct.quantity} ${selectedProduct.unit}`);
      return;
    }

    const newItem: OrderItem = {
      product: selectedProduct,
      quantity: parseInt(quantity),
      note: itemNote,
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct(null);
    setQuantity('');
    setItemNote('');
    setShowProductModal(false);
  };

  const handleRemoveItem = (index: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const newItems = [...orderItems];
            newItems.splice(index, 1);
            setOrderItems(newItems);
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  };

  const handleSubmit = () => {
    if (!customer.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên khách hàng');
      return;
    }

    if (!orderNumber.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số đơn hàng');
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    Alert.alert(
      'Xác nhận tạo đơn hàng',
      `Tổng giá trị: ${formatCurrency(calculateTotal())}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            Alert.alert('Thành công', 'Đã tạo đơn hàng thành công!');
            setCustomer('');
            setOrderNumber('');
            setNote('');
            setOrderItems([]);
            setActiveTab('list');
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          onPress={() => setActiveTab('list')}
        >
          <Ionicons 
            name="list" 
            size={20} 
            color={activeTab === 'list' ? COLORS.primary : COLORS.gray600} 
          />
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>
            Danh sách
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.tabActive]}
          onPress={() => setActiveTab('create')}
        >
          <Ionicons 
            name="add-circle" 
            size={20} 
            color={activeTab === 'create' ? COLORS.primary : COLORS.gray600} 
          />
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
            Tạo đơn mới
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List View */}
      {activeTab === 'list' && (
        <View style={styles.listContainer}>
          {/* Status Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statusFilter}
            contentContainerStyle={styles.statusFilterContent}
          >
            <TouchableOpacity
              style={[styles.statusChip, selectedStatus === 'ALL' && styles.statusChipActive]}
              onPress={() => setSelectedStatus('ALL')}
            >
              <Text style={[styles.statusChipText, selectedStatus === 'ALL' && styles.statusChipTextActive]}>
                Tất cả ({mockOrders.length})
              </Text>
            </TouchableOpacity>

            {(['NEW', 'PENDING', 'READY', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((status) => {
              const config = getStatusConfig(status);
              const count = mockOrders.filter(o => o.status === status).length;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusChip,
                    selectedStatus === status && styles.statusChipActive,
                    { borderColor: config.color + '30' }
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Ionicons 
                    name={config.icon as any}
                    size={14} 
                    color={selectedStatus === status ? config.color : COLORS.gray600} 
                  />
                  <Text style={[
                    styles.statusChipText, 
                    selectedStatus === status && { color: config.color }
                  ]}>
                    {config.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Orders List */}
          <ScrollView style={styles.ordersList}>
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                      <View style={[styles.orderIcon, { backgroundColor: statusConfig.color + '15' }]}>
                        <Ionicons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
                      </View>
                      <View>
                        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                        <Text style={styles.orderCustomer}>{order.customer}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                      <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderBody}>
                    <View style={styles.orderInfo}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.gray400} />
                      <Text style={styles.orderInfoText}>{order.date}</Text>
                    </View>
                    <View style={styles.orderInfo}>
                      <Ionicons name="layers-outline" size={14} color={COLORS.gray400} />
                      <Text style={styles.orderInfoText}>
                        {order.items.length} sản phẩm
                      </Text>
                    </View>
                  </View>

                  {order.note && (
                    <View style={styles.orderNote}>
                      <Ionicons name="information-circle" size={14} color={COLORS.gray400} />
                      <Text style={styles.orderNoteText}>{order.note}</Text>
                    </View>
                  )}

                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                    <TouchableOpacity style={styles.orderDetailButton}>
                      <Text style={styles.orderDetailText}>Chi tiết</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {filteredOrders.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={64} color={COLORS.gray400} />
                <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
                <Text style={styles.emptySubtext}>
                  {selectedStatus === 'ALL' 
                    ? 'Chưa có đơn hàng trong hệ thống'
                    : `Chưa có đơn hàng ${getStatusConfig(selectedStatus as OrderStatus).label.toLowerCase()}`
                  }
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Create Order View */}
      {activeTab === 'create' && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Form Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Khách hàng <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên khách hàng"
                  placeholderTextColor={COLORS.gray400}
                  value={customer}
                  onChangeText={setCustomer}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>
                  Số đơn hàng <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="barcode" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="DH-2026-XXX"
                    placeholderTextColor={COLORS.gray400}
                    value={orderNumber}
                    onChangeText={setOrderNumber}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.flex1, { marginLeft: 12 }]}>
                <Text style={styles.label}>Ngày đơn</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                  <Text style={styles.dateText}>{orderDate}</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ghi chú</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Nhập ghi chú cho đơn hàng..."
                  placeholderTextColor={COLORS.gray400}
                  multiline
                  numberOfLines={3}
                  value={note}
                  onChangeText={setNote}
                />
              </View>
            </View>
          </View>

          {/* Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Sản phẩm</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowProductModal(true)}
              >
                <Ionicons name="add" size={18} color={COLORS.white} />
                <Text style={styles.addButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>

            {orderItems.length === 0 ? (
              <View style={styles.emptyProducts}>
                <Ionicons name="cube-outline" size={48} color={COLORS.gray400} />
                <Text style={styles.emptyProductsText}>Chưa có sản phẩm</Text>
                <Text style={styles.emptyProductsSubtext}>Nhấn "Thêm" để chọn sản phẩm</Text>
              </View>
            ) : (
              <View style={styles.productsList}>
                {orderItems.map((item, index) => (
                  <View key={index} style={styles.productCard}>
                    <View style={styles.productHeader}>
                      <View style={styles.productIconBox}>
                        <Ionicons name="cube" size={16} color={COLORS.primary} />
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.product.name}</Text>
                        <View style={styles.productMeta}>
                          <Text style={styles.productMetaText}>
                            {item.quantity} {item.product.unit}
                          </Text>
                          <View style={styles.productDot} />
                          <Text style={styles.productMetaText}>
                            {formatCurrency(item.product.price)}
                          </Text>
                        </View>
                        {item.note ? (
                          <View style={styles.productNote}>
                            <Ionicons name="document-text" size={12} color={COLORS.gray400} />
                            <Text style={styles.productNoteText}>{item.note}</Text>
                          </View>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(index)}
                      >
                        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.productFooter}>
                      <Text style={styles.productTotal}>
                        {formatCurrency(item.product.price * item.quantity)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Summary */}
          {orderItems.length > 0 && (
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tổng số lượng</Text>
                <Text style={styles.summaryValue}>
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)} SP
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Tổng giá trị</Text>
                <Text style={styles.summaryTotalValue}>{formatCurrency(calculateTotal())}</Text>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
            <Text style={styles.submitButtonText}>Tạo đơn hàng</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Product Selection Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn sản phẩm</Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.gray400} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Sản phẩm</Text>
              <FlatList
                data={products}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.productItem,
                      selectedProduct?.id === item.id && styles.productItemSelected
                    ]}
                    onPress={() => setSelectedProduct(item)}
                  >
                    <View style={styles.radioOuter}>
                      {selectedProduct?.id === item.id && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.productSelectInfo}>
                      <Text style={styles.productSelectName}>{item.name}</Text>
                      <View style={styles.productSelectMeta}>
                        <View style={styles.stockBadge}>
                          <Ionicons name="cube" size={12} color={COLORS.success} />
                          <Text style={styles.stockText}>Tồn: {item.quantity} {item.unit}</Text>
                        </View>
                        <Text style={styles.productSelectPrice}>{formatCurrency(item.price)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Số lượng <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="layers" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập số lượng"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="number-pad"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                {selectedProduct && quantity && parseInt(quantity) > selectedProduct.quantity && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                    <Text style={styles.errorText}>
                      Vượt quá tồn kho ({selectedProduct.quantity} {selectedProduct.unit})
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ghi chú</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ghi chú cho sản phẩm này"
                    placeholderTextColor={COLORS.gray400}
                    value={itemNote}
                    onChangeText={setItemNote}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowProductModal(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddItem}
              >
                <Text style={styles.modalAddText}>Thêm vào đơn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  listContainer: {
    flex: 1,
  },
  statusFilter: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  statusFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  statusChipActive: {
    backgroundColor: COLORS.gray50,
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  statusChipTextActive: {
    color: COLORS.primary,
  },
  ordersList: {
    flex: 1,
    paddingBottom: 16,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  orderCustomer: {
    fontSize: 13,
    color: COLORS.gray600,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderBody: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  orderInfoText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  orderNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: COLORS.gray50,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  orderNoteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 16,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  orderDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.gray50,
  },
  orderDetailText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray600,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.gray400,
    marginTop: 6,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray800,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.gray800,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  textAreaWrapper: {
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  textArea: {
    fontSize: 14,
    color: COLORS.gray800,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderStyle: 'dashed',
  },
  emptyProductsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
    marginTop: 12,
  },
  emptyProductsSubtext: {
    fontSize: 12,
    color: COLORS.gray400,
    marginTop: 4,
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  productIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
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
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productMetaText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  productDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gray400,
  },
  productNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  productNoteText: {
    fontSize: 11,
    color: COLORS.gray600,
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 4,
  },
  productFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  productTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summarySection: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 16,
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
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    marginHorizontal: 12,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  productItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  productSelectInfo: {
    flex: 1,
  },
  productSelectName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 6,
  },
  productSelectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
  },
  productSelectPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.error + '10',
    borderRadius: 6,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.gray400,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  modalAddButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalAddText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});