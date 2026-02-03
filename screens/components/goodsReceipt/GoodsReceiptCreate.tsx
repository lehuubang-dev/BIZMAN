import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { goodsReceiptService } from '../../../services/goodsReceiptService';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { 
  CreateGoodsReceiptData,
  UpdateGoodsReceiptData,
  GoodsReceiptStatus,
  GoodsReceipt
} from '../../../types/goodsReceipt';

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
};

interface GoodsReceiptCreateProps {
  visible: boolean;
  receiptId: string | null; // For editing
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductItem {
  productId: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  location: string;
  stack: number;
  fee: number;
  note?: string;
}

export default function GoodsReceiptCreate({ 
  visible, 
  receiptId, 
  onClose, 
  onSuccess 
}: GoodsReceiptCreateProps) {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingPO, setLoadingPO] = useState(false);
  
  // Options for dropdowns
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [purchaseOrderDetail, setPurchaseOrderDetail] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  
  // Form fields
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString());
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [status, setStatus] = useState<GoodsReceiptStatus>('DRAFT');
  
  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductItem>({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    location: '',
    stack: 1,
    fee: 0,
  });

  useEffect(() => {
    if (visible) {
      loadOptions();
      if (receiptId) {
        loadReceiptDetail();
      }
    }
  }, [visible, receiptId]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [purchaseOrdersData, warehousesData, suppliersData, productsData] = await Promise.all([
        purchaseOrderService.getPurchaseOrders(),
        purchaseOrderService.getWarehouses(),
        purchaseOrderService.getSuppliers(),
        purchaseOrderService.getProducts(),
      ]);
      
      setPurchaseOrders(purchaseOrdersData);
      setWarehouses(warehousesData);
      setSuppliers(suppliersData);
      setAllProducts(productsData);
      setProductOptions(productsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadPurchaseOrderDetail = async (poId: string) => {
    if (!poId) {
      setPurchaseOrderDetail(null);
      setProductOptions(allProducts);
      return;
    }
    
    setLoadingPO(true);
    try {
      const data = await purchaseOrderService.getPurchaseOrderById(poId);
      console.log('Purchase Order Detail:', data);
      
      if (data) {
        setPurchaseOrderDetail(data);
        
        // Auto-fill supplier (không thể thay đổi)
        if (data.supplier?.id) {
          setSupplierId(data.supplier.id);
        }
        
        // Auto-fill warehouse (có thể thay đổi)
        if (data.warehouse?.id) {
          setWarehouseId(data.warehouse.id);
        }
        
        // Filter products theo purchase order
        if (data.products && data.products.length > 0) {
          setProductOptions(data.products);
        } else {
          setProductOptions(allProducts);
        }
      }
    } catch (error: any) {
      console.error('Error loading purchase order detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      setPurchaseOrderDetail(null);
      setProductOptions(allProducts);
    } finally {
      setLoadingPO(false);
    }
  };

  const loadReceiptDetail = async () => {
    if (!receiptId) return;
    
    setLoadingDetail(true);
    try {
      const data = await goodsReceiptService.getGoodsReceiptById(receiptId);
      if (data) {
        setPurchaseOrderId(data.purchaseOrder?.id || '');
        setWarehouseId(data.warehouse?.id || '');
        setSupplierId(data.supplier?.id || '');
        setReceiptDate(data.receiptDate);
        setDescription(data.description || '');
        setNote(data.note || '');
        setStatus(data.status);
        setProducts(data.products.map(p => ({
          productId: p.product.id,
          name: p.product.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          totalPrice: p.totalPrice,
          location: p.location,
          stack: p.stack,
          fee: p.fee,
          note: p.note,
        })));
        // Documents would need IDs, for now just count them
        setDocuments(data.documents?.map(d => d.id) || []);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết phiếu nhập hàng');
    } finally {
      setLoadingDetail(false);
    }
  };

  const resetForm = () => {
    setPurchaseOrderId('');
    setWarehouseId('');
    setSupplierId('');
    setReceiptDate(new Date().toISOString());
    setDescription('');
    setNote('');
    setProducts([]);
    setDocuments([]);
    setStatus('DRAFT');
    console.log('Form reset - receiptDate set to:', new Date().toISOString());
  };

  const calculateProductPrice = (product: ProductItem): ProductItem => {
    const totalPrice = product.quantity * product.unitPrice;
    return {
      ...product,
      totalPrice,
    };
  };

  const calculateSubTotal = () => {
    return products.reduce((sum, p) => sum + p.totalPrice, 0);
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = productOptions.find(p => p.id === productId);
    if (selectedProduct) {
      // Nếu có purchase order detail, lấy thông tin từ đó
      const poProduct = purchaseOrderDetail?.products?.find((p: any) => p.id === productId);
      
      setCurrentProduct({
        ...currentProduct,
        productId: productId,
        name: selectedProduct.name,
        quantity: poProduct?.quantity || 1,
        unitPrice: poProduct?.unitPrice || selectedProduct.costPrice || 0,
      });
    }
  };

  const handleAddProduct = () => {
    if (!currentProduct.productId) {
      Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm');
      return;
    }

    const calculatedProduct = calculateProductPrice(currentProduct);
    setProducts([...products, calculatedProduct]);
    setCurrentProduct({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      location: '',
      stack: 1,
      fee: 0,
    });
    setShowProductForm(false);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);
        
        const documentId = await purchaseOrderService.uploadDocument(file);
        console.log('Document uploaded, ID/Path:', documentId);
        
        setDocuments([...documents, documentId]);
      }
    } catch (error: any) {
      console.error('Document upload error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải tài liệu lên');
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!purchaseOrderId) {
      Alert.alert('Thông báo', 'Vui lòng chọn đơn hàng');
      return;
    }
    if (!warehouseId) {
      Alert.alert('Thông báo', 'Vui lòng chọn kho hàng');
      return;
    }
    if (!supplierId) {
      Alert.alert('Thông báo', 'Vui lòng chọn nhà cung cấp');
      return;
    }
    if (products.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }

    const subTotal = calculateSubTotal();

    const receiptData: CreateGoodsReceiptData | UpdateGoodsReceiptData = {
      ...(receiptId && { id: receiptId }),
      purchaseOrderId,
      warehouseId,
      supplierId,
      documents,
      products: products.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        totalPrice: p.totalPrice,
        location: p.location,
        stack: p.stack,
        fee: p.fee,
        ...(p.note && { note: p.note }),
      })),
      description,
      note,
      status,
      receiptDate,
      subTotal,
    };

    console.log('Submitting goods receipt:', JSON.stringify(receiptData, null, 2));
    
    setLoading(true);
    try {
      let result;
      if (receiptId) {
        result = await goodsReceiptService.updateGoodsReceipt(receiptData as UpdateGoodsReceiptData);
        console.log('Goods receipt updated, result:', result);
      } else {
        result = await goodsReceiptService.createGoodsReceipt(receiptData);
        console.log('Goods receipt created, result:', result);
      }
      
      resetForm();
      onClose();
      onSuccess();
      
      Alert.alert('Thành công', receiptId ? 'Cập nhật phiếu nhập hàng thành công' : 'Tạo phiếu nhập hàng thành công');
    } catch (error: any) {
      console.error('Failed to save goods receipt:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu phiếu nhập hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN');
  };

  const subTotal = calculateSubTotal();

  const renderStatusRadio = (
    label: string,
    value: GoodsReceiptStatus,
    selectedValue: GoodsReceiptStatus,
    onSelect: (value: GoodsReceiptStatus) => void
  ) => (
    <TouchableOpacity
      style={styles.radioButton}
      onPress={() => onSelect(value)}
    >
      <View style={[styles.radioOuter, selectedValue === value && styles.radioOuterSelected]}>
        {selectedValue === value && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  if (loadingOptions || loadingDetail) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.gray800} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {receiptId ? 'Sửa phiếu nhập hàng' : 'Tạo phiếu nhập hàng'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Receipt Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin phiếu</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Đơn hàng <Text style={styles.required}>*</Text></Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={purchaseOrderId}
                  onValueChange={(value) => {
                    setPurchaseOrderId(value);
                    loadPurchaseOrderDetail(value);
                  }}
                  style={styles.picker}
                  enabled={!loadingPO}
                >
                  <Picker.Item label="-- Chọn đơn hàng --" value="" />
                  {purchaseOrders.map((po) => (
                    <Picker.Item 
                      key={po.id} 
                      label={`${po.orderNumber} - ${new Date(po.orderDate).toLocaleDateString('vi-VN')}`} 
                      value={po.id} 
                    />
                  ))}
                </Picker>
              </View>
              {loadingPO && (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 8 }} />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kho hàng <Text style={styles.required}>*</Text></Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={warehouseId}
                  onValueChange={setWarehouseId}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Chọn kho hàng --" value="" />
                  {warehouses.map((w) => (
                    <Picker.Item key={w.id} label={w.name} value={w.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nhà cung cấp <Text style={styles.required}>*</Text></Text>
              <View style={[styles.pickerContainer, purchaseOrderId && styles.pickerDisabled]}>
                <Picker
                  selectedValue={supplierId}
                  onValueChange={setSupplierId}
                  style={styles.picker}
                  enabled={!purchaseOrderId}
                >
                  <Picker.Item label="-- Chọn nhà cung cấp --" value="" />
                  {suppliers.map((s) => (
                    <Picker.Item key={s.id} label={s.name} value={s.id} />
                  ))}
                </Picker>
              </View>
              {purchaseOrderId && (
                <Text style={styles.helperText}>Nhà cung cấp được lấy từ đơn hàng</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả phiếu nhập"
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

          {/* Status Section */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trạng thái</Text>
            
            <View style={styles.radioGroup}>
              {renderStatusRadio('Nháp', 'DRAFT', status, setStatus)}
              {renderStatusRadio('Đã nhập kho', 'RECEIVED', status, setStatus)}
              {renderStatusRadio('Nhập một phần', 'PARTIAL', status, setStatus)}
              {renderStatusRadio('Đã hủy', 'CANCELLED', status, setStatus)}
            </View>
          </View> */}

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
                  <Text style={styles.productName}>{product.name || product.productId}</Text>
                  <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productDetail}>SL: {product.quantity}</Text>
                  <Text style={styles.productDetail}>Vị trí: {product.location}</Text>
                  <Text style={styles.productDetail}>Số lô: {product.stack}</Text>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productDetail}>Đơn giá: {formatCurrency(product.unitPrice)} đ</Text>
                  <Text style={styles.productDetail}>Phí: {formatCurrency(product.fee)} đ</Text>
                </View>
                <View style={styles.productFooter}>
                  <Text style={styles.productTotal}>Thành tiền: {formatCurrency(product.totalPrice)} đ</Text>
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

          {/* Documents Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tài liệu</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleUploadDocument}
              >
                <MaterialCommunityIcons name="upload" size={20} color={COLORS.white} />
                <Text style={styles.addButtonText}>Tải lên</Text>
              </TouchableOpacity>
            </View>

            {documents.map((doc, index) => (
              <View key={index} style={styles.documentCard}>
                <MaterialCommunityIcons name="file-document" size={20} color={COLORS.gray600} />
                <Text style={styles.documentText}>Tài liệu {index + 1}</Text>
                <TouchableOpacity onPress={() => handleRemoveDocument(index)}>
                  <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}

            {documents.length === 0 && (
              <Text style={styles.emptyText}>Chưa có tài liệu</Text>
            )}
          </View>

          {/* Product Form Modal */}
          {showProductForm && (
            <Modal visible={showProductForm} transparent animationType="fade">
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
                      <Text style={styles.label}>Sản phẩm <Text style={styles.required}>*</Text></Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={currentProduct.productId}
                          onValueChange={handleProductSelect}
                          style={styles.picker}
                        >
                          <Picker.Item label="-- Chọn sản phẩm --" value="" />
                          {productOptions.map((p) => (
                            <Picker.Item key={p.id} label={p.name} value={p.id} />
                          ))}
                        </Picker>
                      </View>
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
                      <Text style={styles.label}>Vị trí:</Text>
                      <TextInput
                        style={styles.input}
                        value={currentProduct.location}
                        onChangeText={(text) => setCurrentProduct({ ...currentProduct, location: text })}
                        placeholder="ví dụ: A-12-05"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Số lô <Text style={styles.required}>*</Text></Text>
                      <TextInput
                        style={styles.input}
                        value={currentProduct.stack.toString()}
                        onChangeText={(text) => setCurrentProduct({ ...currentProduct, stack: parseInt(text) || 1 })}
                        placeholder="Số lô"
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Phí</Text>
                      <TextInput
                        style={styles.input}
                        value={currentProduct.fee.toString()}
                        onChangeText={(text) => setCurrentProduct({ ...currentProduct, fee: parseFloat(text) || 0 })}
                        placeholder="Phí"
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
                        placeholder="Ghi chú"
                        placeholderTextColor={COLORS.gray400}
                        multiline
                        numberOfLines={2}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.addProductButton}
                      onPress={handleAddProduct}
                    >
                      <Text style={styles.addProductButtonText}>Thêm sản phẩm</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}

          {/* Summary Section */}
          {products.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tổng kết</Text>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.totalValue}>{formatCurrency(subTotal)} đ</Text>
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
              <Text style={styles.submitButtonText}>{receiptId ? 'Cập nhật' : 'Tạo phiếu'}</Text>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 55,
  },
  radioGroup: {
    gap: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.gray800,
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
  productName: {
    flex: 1,
    fontSize: 14,
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
  productFormOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
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
  pickerDisabled: {
    backgroundColor: COLORS.gray100,
    opacity: 0.7,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
