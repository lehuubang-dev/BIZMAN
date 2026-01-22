import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { CreatePurchaseOrderData } from '../../../types/purchaseOrder';

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

interface ImportGoodCreateProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductItem {
  id: string;
  quantity: number;
  unitPrice: number;
  expiredDate?: string;
  discountPercent: number;
  taxPercent: number;
  totalPrice: number;
  finalPrice: number;
  purchaseValue: number;
  note?: string;
}

export default function ImportGoodCreate({ visible, onClose, onSuccess }: ImportGoodCreateProps) {
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [supplier, setSupplier] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [contract, setContract] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString());
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([]);
  
  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductItem>({
    id: '',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    taxPercent: 0,
    totalPrice: 0,
    finalPrice: 0,
    purchaseValue: 0,
  });

  const resetForm = () => {
    setSupplier('');
    setWarehouse('');
    setContract('');
    setOrderNumber('');
    setOrderDate(new Date().toISOString());
    setDescription('');
    setNote('');
    setProducts([]);
  };

  const calculateProductPrices = (product: ProductItem): ProductItem => {
    const totalPrice = product.quantity * product.unitPrice;
    const discountAmount = totalPrice * product.discountPercent;
    const priceAfterDiscount = totalPrice - discountAmount;
    const taxAmount = priceAfterDiscount * product.taxPercent;
    const finalPrice = priceAfterDiscount + taxAmount;

    return {
      ...product,
      totalPrice,
      finalPrice,
      purchaseValue: finalPrice,
    };
  };

  const calculateOrderTotals = () => {
    const subTotal = products.reduce((sum, p) => sum + p.totalPrice, 0);
    const taxAmount = products.reduce((sum, p) => sum + (p.finalPrice - p.totalPrice + p.totalPrice * p.discountPercent), 0);
    const totalAmount = products.reduce((sum, p) => sum + p.finalPrice, 0);
    
    return { subTotal, taxAmount, totalAmount };
  };

  const handleAddProduct = () => {
    if (!currentProduct.id) {
      Alert.alert('Thông báo', 'Vui lòng nhập ID sản phẩm');
      return;
    }

    const calculatedProduct = calculateProductPrices(currentProduct);
    setProducts([...products, calculatedProduct]);
    setCurrentProduct({
      id: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 0,
      totalPrice: 0,
      finalPrice: 0,
      purchaseValue: 0,
    });
    setShowProductForm(false);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!supplier) {
      Alert.alert('Thông báo', 'Vui lòng nhập ID nhà cung cấp');
      return;
    }
    if (!warehouse) {
      Alert.alert('Thông báo', 'Vui lòng nhập ID kho hàng');
      return;
    }
    if (!orderNumber) {
      Alert.alert('Thông báo', 'Vui lòng nhập số đơn hàng');
      return;
    }
    if (products.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }

    const { subTotal, taxAmount, totalAmount } = calculateOrderTotals();

    const orderData: CreatePurchaseOrderData = {
      supplier,
      warehouse,
      ...(contract && { contract }),
      products,
      orderNumber,
      orderDate,
      description,
      note,
      subTotal,
      taxAmount,
      totalAmount,
      paymentStatus: 'PENDING',
      orderStatus: 'DRAFT',
    };

    setLoading(true);
    try {
      await purchaseOrderService.createPurchaseOrder(orderData);
      Alert.alert('Thành công', 'Tạo đơn nhập hàng thành công', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            onSuccess();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo đơn nhập hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN');
  };

  const { subTotal, taxAmount, totalAmount } = calculateOrderTotals();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.gray800} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo đơn nhập hàng</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số đơn hàng <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={orderNumber}
                onChangeText={setOrderNumber}
                placeholder="Ví dụ: PN-2026-0001"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID Nhà cung cấp <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={supplier}
                onChangeText={setSupplier}
                placeholder="ID nhà cung cấp"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID Kho hàng <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={warehouse}
                onChangeText={setWarehouse}
                placeholder="ID kho hàng"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID Hợp đồng</Text>
              <TextInput
                style={styles.input}
                value={contract}
                onChangeText={setContract}
                placeholder="ID hợp đồng (không bắt buộc)"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả đơn hàng"
                placeholderTextColor={COLORS.gray400}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder="Ghi chú"
                placeholderTextColor={COLORS.gray400}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sản phẩm</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowProductForm(true)}
              >
                <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
                <Text style={styles.addButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>

            {products.map((product, index) => (
              <View key={index} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.productId}>ID: {product.id}</Text>
                  <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productDetail}>SL: {product.quantity}</Text>
                  <Text style={styles.productDetail}>Đơn giá: {formatCurrency(product.unitPrice)}</Text>
                  <Text style={styles.productDetail}>Giảm: {product.discountPercent * 100}%</Text>
                  <Text style={styles.productDetail}>Thuế: {product.taxPercent * 100}%</Text>
                </View>
                <View style={styles.productFooter}>
                  <Text style={styles.productTotal}>Thành tiền: {formatCurrency(product.finalPrice)}</Text>
                </View>
                {product.note && (
                  <Text style={styles.productNote}>Ghi chú: {product.note}</Text>
                )}
              </View>
            ))}

            {products.length === 0 && (
              <View style={styles.emptyProducts}>
                <MaterialCommunityIcons name="package-variant" size={48} color={COLORS.gray400} />
                <Text style={styles.emptyText}>Chưa có sản phẩm</Text>
              </View>
            )}
          </View>

          {/* Product Form Modal */}
          {showProductForm && (
            <View style={styles.productFormOverlay}>
              <View style={styles.productForm}>
                <View style={styles.productFormHeader}>
                  <Text style={styles.productFormTitle}>Thêm sản phẩm</Text>
                  <TouchableOpacity onPress={() => setShowProductForm(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={COLORS.gray800} />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>ID Sản phẩm <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={styles.input}
                      value={currentProduct.id}
                      onChangeText={(text) => setCurrentProduct({ ...currentProduct, id: text })}
                      placeholder="ID sản phẩm"
                      placeholderTextColor={COLORS.gray400}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Số lượng <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={styles.input}
                      value={currentProduct.quantity.toString()}
                      onChangeText={(text) => setCurrentProduct({ ...currentProduct, quantity: parseInt(text) || 0 })}
                      placeholder="Số lượng"
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.gray400}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Đơn giá <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={styles.input}
                      value={currentProduct.unitPrice.toString()}
                      onChangeText={(text) => setCurrentProduct({ ...currentProduct, unitPrice: parseFloat(text) || 0 })}
                      placeholder="Đơn giá"
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.gray400}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Giảm giá (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={(currentProduct.discountPercent * 100).toString()}
                      onChangeText={(text) => setCurrentProduct({ ...currentProduct, discountPercent: (parseFloat(text) || 0) / 100 })}
                      placeholder="Phần trăm giảm giá"
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.gray400}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Thuế (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={(currentProduct.taxPercent * 100).toString()}
                      onChangeText={(text) => setCurrentProduct({ ...currentProduct, taxPercent: (parseFloat(text) || 0) / 100 })}
                      placeholder="Phần trăm thuế"
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.gray400}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={currentProduct.note}
                      onChangeText={(text) => setCurrentProduct({ ...currentProduct, note: text })}
                      placeholder="Ghi chú sản phẩm"
                      placeholderTextColor={COLORS.gray400}
                      multiline
                      numberOfLines={2}
                    />
                  </View>

                  <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct}>
                    <Text style={styles.addProductButtonText}>Thêm sản phẩm</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          )}

          {/* Summary Section */}
          {products.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tổng kết</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(subTotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Thuế:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(taxAmount)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Tạo đơn</Text>
            )}
          </TouchableOpacity>
        </View>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 6,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray800,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  productCard: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productId: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  productDetail: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  productFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: 8,
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
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray600,
  },
  productFormOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  productForm: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 16,
  },
  productFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productFormTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  addProductButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addProductButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.gray100,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
