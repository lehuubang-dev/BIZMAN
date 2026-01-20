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

export default function OrdersScreen() {
  const [customer, setCustomer] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [note, setNote] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [itemNote, setItemNote] = useState('');

  // Focus states
  const [customerFocused, setCustomerFocused] = useState(false);
  const [orderFocused, setOrderFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);

  // Mock data - danh sách sản phẩm trong kho
  const products: Product[] = [
    { id: '1', name: 'Laptop Dell XPS 13', quantity: 45, unit: 'Chiếc', price: 25000000 },
    { id: '2', name: 'iPhone 15 Pro Max', quantity: 28, unit: 'Chiếc', price: 35000000 },
    { id: '3', name: 'Samsung Galaxy S24', quantity: 35, unit: 'Chiếc', price: 22000000 },
    { id: '4', name: 'iPad Air M2', quantity: 20, unit: 'Chiếc', price: 18000000 },
    { id: '5', name: 'AirPods Pro 2', quantity: 85, unit: 'Chiếc', price: 6500000 },
  ];

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
            // Reset form
            setCustomer('');
            setOrderNumber('');
            setNote('');
            setOrderItems([]);
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
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Form thông tin chung */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>

          {/* Khách hàng */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Khách hàng <Text style={styles.required}>*</Text>
            </Text>
            <View style={[
              styles.inputWrapper,
              customerFocused && styles.inputWrapperFocused
            ]}>
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={customerFocused ? '#FF9800' : '#999'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập tên khách hàng"
                placeholderTextColor="#999"
                value={customer}
                onChangeText={setCustomer}
                onFocus={() => setCustomerFocused(true)}
                onBlur={() => setCustomerFocused(false)}
              />
            </View>
          </View>

          {/* Số đơn hàng & Ngày */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                Số đơn hàng <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputWrapper,
                orderFocused && styles.inputWrapperFocused
              ]}>
                <Ionicons 
                  name="receipt-outline" 
                  size={20} 
                  color={orderFocused ? '#FF9800' : '#999'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Số ĐH"
                  placeholderTextColor="#999"
                  value={orderNumber}
                  onChangeText={setOrderNumber}
                  onFocus={() => setOrderFocused(true)}
                  onBlur={() => setOrderFocused(false)}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flex1, { marginLeft: 10 }]}>
              <Text style={styles.label}>Ngày đơn</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color="#999" 
                  style={styles.inputIcon} 
                />
                <Text style={styles.dateText}>{orderDate}</Text>
              </View>
            </View>
          </View>

          {/* Ghi chú */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú</Text>
            <View style={[
              styles.textAreaWrapper,
              noteFocused && styles.inputWrapperFocused
            ]}>
              <TextInput
                style={styles.textArea}
                placeholder="Nhập ghi chú (tùy chọn)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
                onFocus={() => setNoteFocused(true)}
                onBlur={() => setNoteFocused(false)}
              />
            </View>
          </View>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowProductModal(true)}
            >
              <Ionicons name="add-circle" size={20} color="#FF9800" />
              <Text style={styles.addButtonText}>Thêm SP</Text>
            </TouchableOpacity>
          </View>

          {orderItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={60} color="#BDBDBD" />
              <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
              <Text style={styles.emptySubtext}>
                Nhấn "Thêm SP" để thêm sản phẩm vào đơn hàng
              </Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {orderItems.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.product.name}</Text>
                      <Text style={styles.itemDetails}>
                        SL: {item.quantity} {item.product.unit} • 
                        Đơn giá: {formatCurrency(item.product.price)}
                      </Text>
                      {item.note ? (
                        <Text style={styles.itemNote}>Ghi chú: {item.note}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(index)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemTotal}>
                      Thành tiền: {formatCurrency(item.product.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tổng cộng */}
        {orderItems.length > 0 && (
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng số lượng:</Text>
              <Text style={styles.totalValue}>
                {orderItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng giá trị:</Text>
              <Text style={styles.totalPrice}>{formatCurrency(calculateTotal())}</Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.submitButtonText}>Tạo đơn hàng</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal chọn sản phẩm */}
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
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Chọn sản phẩm */}
              <Text style={styles.label}>Chọn sản phẩm</Text>
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
                    <View style={styles.radioButton}>
                      {selectedProduct?.id === item.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <View style={styles.productDetailsRow}>
                        <View style={styles.stockBadge}>
                          <Ionicons name="cube" size={14} color="#4CAF50" />
                          <Text style={styles.stockText}>
                            Tồn: {item.quantity} {item.unit}
                          </Text>
                        </View>
                        <Text style={styles.productPrice}>
                          {formatCurrency(item.price)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />

              {/* Số lượng */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Số lượng <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="layers-outline" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập số lượng"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                {selectedProduct && quantity && parseInt(quantity) > selectedProduct.quantity && (
                  <Text style={styles.errorText}>
                    ⚠️ Vượt quá tồn kho ({selectedProduct.quantity} {selectedProduct.unit})
                  </Text>
                )}
              </View>

              {/* Ghi chú */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ghi chú</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ghi chú cho sản phẩm này"
                    placeholderTextColor="#999"
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
                <Text style={styles.modalAddText}>Thêm</Text>
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
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: '#FF9800',
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  textAreaWrapper: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    fontSize: 15,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateText: {
    fontSize: 14,
    color: '#131313ff',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#BDBDBD',
    marginTop: 4,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  itemNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  removeButton: {
    padding: 4,
  },
  itemFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  totalSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  productItemSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF9800',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9800',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 6,
    marginLeft: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalAddButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FF9800',
    alignItems: 'center',
  },
  modalAddText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
