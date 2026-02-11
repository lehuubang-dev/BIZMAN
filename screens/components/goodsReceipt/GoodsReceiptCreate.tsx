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
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { goodsReceiptService } from '../../../services/goodsReceiptService';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { 
  CreateGoodsReceiptData,
  UpdateGoodsReceiptData,
  GoodsReceiptStatus,
  GoodsReceipt
} from '../../../types/goodsReceipt';
import DialogNotification from '../common/DialogNotification';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

interface GoodsReceiptCreateProps {
  visible: boolean;
  receiptId: string | null; // For editing
  onClose: () => void;
  onSuccess: (receiptCode?: string) => void;
}

interface ProductItem {
  variantId: string;
  name?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  note?: string;
  manufactureDate?: string;
  expiryDate?: string;
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
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]); // Format: YYYY-MM-DD
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [status, setStatus] = useState<GoodsReceiptStatus>('DRAFT');
  const [subTotal, setSubTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [fee, setFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductItem>({
    variantId: '',
    quantity: 1,
    unitPrice: 0,
    subTotal: 0,
    totalPrice: 0,
    taxRate: 0,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    note: '',
    manufactureDate: '',
    expiryDate: '',
  });
  
  // Date picker states
  const [showReceiptDatePicker, setShowReceiptDatePicker] = useState(false);
  const [showManufactureDatePicker, setShowManufactureDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  // Dialog notification states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
    title: '',
    message: '',
  });

  useEffect(() => {
    if (visible) {
      loadOptions();
      if (receiptId) {
        loadReceiptDetail();
      }
    }
  }, [visible, receiptId]);

  // Tự động tính lại tổng tiền từ danh sách sản phẩm
  useEffect(() => {
    if (products.length > 0 && !purchaseOrderId) {
      const calculatedSubTotal = products.reduce((sum, product) => sum + product.subTotal, 0);
      const calculatedTaxAmount = products.reduce((sum, product) => sum + product.taxAmount, 0);
      const calculatedDiscountAmount = products.reduce((sum, product) => sum + product.discountAmount, 0);
      
      setSubTotal(calculatedSubTotal);
      setTaxAmount(calculatedTaxAmount);
      setDiscountAmount(calculatedDiscountAmount);
      
      const newTotal = calculatedSubTotal + calculatedTaxAmount - calculatedDiscountAmount + fee;
      setTotalAmount(newTotal);
    } else if (products.length === 0 && !purchaseOrderId) {
      // Reset về 0 khi không còn sản phẩm nào và không có đơn hàng
      setSubTotal(0);
      setTaxAmount(0);
      setDiscountAmount(0);
      setTotalAmount(fee);
    }
  }, [products, fee, purchaseOrderId]);

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
      // Reset các trường thông tin khi bỏ chọn đơn hàng
      setSupplierId('');
      setWarehouseId('');
      setSubTotal(0);
      setTaxAmount(0);
      setDiscountAmount(0);
      setDescription('');
      setNote('');
      setTotalAmount(0);
      setDocuments([]);
      return;
    }
    
    setLoadingPO(true);
    try {
      const data = await purchaseOrderService.getPurchaseOrderById(poId);
      console.log('Purchase Order Detail:', data);
      
      if (data) {
        setPurchaseOrderDetail(data);
        
        // Tự động điền thông tin từ đơn hàng
        setSupplierId(data.supplier?.id || '');
        setWarehouseId(data.warehouse?.id || '');
        setSubTotal(data.subTotal || 0);
        setTaxAmount(data.taxAmount || 0);
        setDiscountAmount((data as any).discountAmount || 0);
        // Lấy description và note từ purchase order
        setDescription(data.description || '');
        setNote(data.note || '');
        
        // Tính tổng tiền tự động
        const calculatedTotal = (data.subTotal || 0) + (data.taxAmount || 0) - ((data as any).discountAmount || 0) + fee;
        setTotalAmount(calculatedTotal);
        
        // Tự động lấy documents từ đơn hàng nếu có
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents.map((doc: any) => doc.id));
        }
        
        // Lấy sản phẩm từ đơn hàng cho dropdown
        if (data.products && data.products.length > 0) {
          const orderProducts = data.products.map((p: any) => ({
            id: p.variant.id,
            name: p.variant.name,
            sku: p.variant.sku,
            unit: p.variant.unit,
            costPrice: p.unitPrice,
            // Lưu thông tin từ đơn hàng
            orderQuantity: p.quantity,
            orderUnitPrice: p.unitPrice,
            orderTaxRate: p.taxRate || 0,
            orderDiscountRate: p.discountRate || 0,
            orderNote: p.note || ''
          }));
          setProductOptions(orderProducts);
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
          variantId: p.variant.id,
          name: p.variant.name,
          sku: p.variant.sku,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          subTotal: p.subTotal,
          totalPrice: p.totalPrice,
          taxRate: p.taxRate || 0,
          taxAmount: p.taxAmount || 0,
          discountRate: p.discountRate || 0,
          discountAmount: p.discountAmount || 0,
          note: p.note,
          manufactureDate: p.manufactureDate || '',
          expiryDate: p.expiryDate || '',
        })));
        setTaxAmount(data.taxAmount || 0);
        setDiscountAmount(data.discountAmount || 0);
        setSubTotal(data.subTotal || 0);
        setTaxAmount(data.taxAmount || 0);
        setDiscountAmount(data.discountAmount || 0);
        setFee(data.fee || 0);
        setTotalAmount(data.totalAmount || 0);
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
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setNote('');
    setProducts([]);
    setDocuments([]);
    setStatus('DRAFT');
    setSubTotal(0);
    setTaxAmount(0);
    setDiscountAmount(0);
    setFee(0);
    setTotalAmount(0);
    setPurchaseOrderDetail(null);
    setProductOptions([]);
    setAllProducts([]);
    console.log('Form reset - receiptDate set to:', new Date().toISOString().split('T')[0]);
  };

  const calculateProductPrice = (product: ProductItem): ProductItem => {
    const subTotal = product.quantity * product.unitPrice;
    const taxAmount = Math.round((subTotal * product.taxRate) / 100);
    const discountAmount = Math.round((subTotal * product.discountRate) / 100);
    const totalPrice = subTotal + taxAmount - discountAmount;
    
    return {
      ...product,
      subTotal,
      taxAmount,
      discountAmount,
      totalPrice,
    };
  };

  // Tính số lượng còn lại của sản phẩm
  const getRemainingQuantity = (variantId: string): number => {
    if (!purchaseOrderDetail) return Infinity;
    
    // Lấy số lượng gốc từ đơn hàng
    const orderProduct = purchaseOrderDetail.products?.find((p: any) => p.variant.id === variantId);
    const originalQuantity = orderProduct?.quantity || 0;
    
    // Tính số lượng đã thêm vào danh sách
    const addedQuantity = products
      .filter(p => p.variantId === variantId)
      .reduce((sum, p) => sum + p.quantity, 0);
    
    return Math.max(0, originalQuantity - addedQuantity);
  };

  const validateQuantity = (variantId: string, inputQuantity: number): number => {
    // Không cho phép số âm
    if (inputQuantity < 0) return 0;
    
    // Kiểm tra số lượng còn lại
    const remaining = getRemainingQuantity(variantId);
    if (remaining === Infinity) return inputQuantity; // Không có giới hạn nếu không có đơn hàng
    
    return Math.min(inputQuantity, remaining);
  };

  // Format ngày thành dd/mm/yyyy cho hiển thị
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Kiểm tra ngày hạn sử dụng phải sau ngày sản xuất
  const validateExpiryDate = (manufactureDate: string, expiryDate: string): boolean => {
    if (!manufactureDate || !expiryDate) return true; // Cho phép nếu một trong hai ngày không có
    return new Date(expiryDate) > new Date(manufactureDate);
  };

  const handleProductSelect = (variantId: string) => {
    const selectedProduct = productOptions.find(p => p.id === variantId);
    if (selectedProduct) {
      const remaining = getRemainingQuantity(variantId);
      
      // Lấy thông tin từ đơn hàng đã lưu trong productOptions
      setCurrentProduct({
        ...currentProduct,
        variantId: variantId,
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        quantity: Math.min(selectedProduct.orderQuantity || 1, remaining),
        unitPrice: selectedProduct.orderUnitPrice || selectedProduct.costPrice || 0,
        taxRate: selectedProduct.orderTaxRate || 0,
        discountRate: selectedProduct.orderDiscountRate || 0,
        note: selectedProduct.orderNote || '',
      });
    }
  };

  const handleAddProduct = () => {
    if (!currentProduct.variantId) {
      setDialogConfig({
        type: 'warning',
        title: 'Thông báo',
        message: 'Vui lòng chọn sản phẩm',
      });
      setShowDialog(true);
      return;
    }

    // Validate quantity if purchase order is selected
    if (!validateQuantity(currentProduct.variantId, currentProduct.quantity)) {
      const remaining = getRemainingQuantity(currentProduct.variantId);
      setDialogConfig({
        type: 'warning',
        title: 'Thông báo',
        message: `Số lượng vượt quá số hàng còn lại trong đơn mua hàng. Còn lại: ${remaining}`,
      });
      setShowDialog(true);
      return;
    }

    const calculatedProduct = calculateProductPrice(currentProduct);
    setProducts([...products, calculatedProduct]);
    setCurrentProduct({
      variantId: '',
      quantity: 1,
      unitPrice: 0,
      subTotal: 0,
      totalPrice: 0,
      taxRate: 0,
      taxAmount: 0,
      discountRate: 0,
      discountAmount: 0,
      manufactureDate: '',
      expiryDate: '',
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
      setDialogConfig({
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể tải tài liệu lên',
      });
      setShowDialog(true);
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!purchaseOrderId) {
      setDialogConfig({
        type: 'warning',
        title: 'Thông báo',
        message: 'Vui lòng chọn đơn hàng',
      });
      setShowDialog(true);
      return;
    }
    if (!warehouseId) {
      setDialogConfig({
        type: 'warning',
        title: 'Thông báo',
        message: 'Vui lòng chọn kho hàng',
      });
      setShowDialog(true);
      return;
    }
    if (!supplierId) {
      setDialogConfig({
        type: 'warning',
        title: 'Thông báo',
        message: 'Vui lòng chọn nhà cung cấp',
      });
      setShowDialog(true);
      return;
    }
    if (!receiptDate) {
      setDialogConfig({
        type: 'warning',
        title: 'Thông báo',
        message: 'Vui lòng nhập ngày nhập hàng',
      });
      setShowDialog(true);
      return;
    }
    if (products.length === 0) {
      setDialogConfig({
        type: 'warning',
        title: 'Thông báo',
        message: 'Vui lòng thêm ít nhất 1 sản phẩm',
      });
      setShowDialog(true);
      return;
    }

    const receiptData: any = {
      ...(receiptId && { id: receiptId }),
      purchaseOrderId,
      warehouseId,
      supplierId,
      documents,
      products: products.map(p => ({
        variantId: p.variantId,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        subTotal: p.subTotal,
        totalPrice: p.totalPrice,
        taxRate: p.taxRate,
        taxAmount: p.taxAmount,
        discountRate: p.discountRate,
        discountAmount: p.discountAmount,
        ...(p.note && { note: p.note }),
        ...(p.manufactureDate && { manufactureDate: p.manufactureDate }),
        ...(p.expiryDate && { expiryDate: p.expiryDate }),
      })),
      receiptDate,
      subTotal,
      taxAmount,
      discountAmount,
      fee,
      totalAmount,
      ...(description && { description }),
      ...(note && { note }),
      status,
    };

    console.log('Submitting goods receipt:', JSON.stringify(receiptData, null, 2));
    
    setLoading(true);
    try {
      let result;
      if (receiptId) {
        result = await goodsReceiptService.updateGoodsReceipt(receiptData);
        console.log('Goods receipt updated, result:', result);
      } else {
        result = await goodsReceiptService.createGoodsReceipt(receiptData);
        console.log('Goods receipt created, result:', result);
      }
      
      resetForm();
      onClose();
      // Pass receipt code if it's a creation (not update)
      onSuccess(!receiptId && result?.receiptCode ? result.receiptCode : undefined);
      
      // Show success dialog only for update operations
      // For create operations, parent component will handle the success notification
      if (receiptId) {
        setDialogConfig({
          type: 'success',
          title: 'Thành công',
          message: 'Cập nhật phiếu nhập hàng thành công!',
        });
        setShowDialog(true);
      }
    } catch (error: any) {
      console.error('Failed to save goods receipt:', error);
      setDialogConfig({
        type: 'error',
        title: 'Lỗi',
        message: error.message || 'Không thể lưu phiếu nhập hàng',
      });
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN');
  };

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
              <Text style={styles.label}>Ngày nhập hàng <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowReceiptDatePicker(true)}
              >
                <Text style={[styles.datePickerText, !receiptDate && styles.placeholderText]}>
                  {receiptDate ? formatDateDisplay(receiptDate) : 'Chọn ngày nhập hàng'}
                </Text>
                <MaterialCommunityIcons name="calendar" size={20} color={COLORS.gray600} />
              </TouchableOpacity>
              {showReceiptDatePicker && (
                <DateTimePicker
                  value={receiptDate ? new Date(receiptDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowReceiptDatePicker(false);
                    if (selectedDate) {
                      setReceiptDate(selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
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
              {purchaseOrderId && (
                <Text style={styles.helperText}>Có thể chỉnh sửa mô tả từ đơn hàng</Text>
              )}
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
              {purchaseOrderId && (
                <Text style={styles.helperText}>Có thể chỉnh sửa ghi chú từ đơn hàng</Text>
              )}
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
                  <Text style={styles.productName}>{product.name || product.variantId}</Text>
                  <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productDetail}>SL: {product.quantity}</Text>
                  <Text style={styles.productDetail}>SKU: {product.sku || 'N/A'}</Text>
                  <Text style={styles.productDetail}>Thuế: {product.taxRate}%</Text>
                  <Text style={styles.productDetail}>Chiết khấu: {product.discountRate}%</Text>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productDetail}>Đơn giá: {formatCurrency(product.unitPrice)} VNĐ</Text>
                  <Text style={styles.productDetail}>Tổng phụ: {formatCurrency(product.subTotal)} VNĐ</Text>
                </View>
                <View style={styles.productFooter}>
                  <Text style={styles.productTotal}>Thành tiền: {formatCurrency(product.totalPrice)} VNĐ</Text>
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
              <Text style={styles.emptyText}>
                {purchaseOrderId ? 'Đơn hàng chưa có tài liệu' : 'Chưa có tài liệu'}
              </Text>
            )}
            
            {purchaseOrderId && documents.length > 0 && (
              <Text style={styles.helperText}>Tài liệu từ đơn hàng được tự động thêm vào</Text>
            )}
          </View>

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <View style={styles.summaryHeader}>
              <MaterialCommunityIcons name="calculator" size={24} color={COLORS.primary} />
              <Text style={styles.summaryTitle}>Tổng tiền (VNĐ)</Text>
            </View>
            
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tổng phụ:</Text>
                <TextInput
                  style={[styles.summaryInput, purchaseOrderId && styles.summaryInputDisabled]}
                  value={subTotal.toString()}
                  onChangeText={(text) => {
                    const newSubTotal = parseInt(text) || 0;
                    setSubTotal(newSubTotal);
                    const newTotal = newSubTotal + taxAmount - discountAmount + fee;
                    setTotalAmount(newTotal);
                  }}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.gray400}
                  editable={!purchaseOrderId}
                />
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tiền thuế:</Text>
                <TextInput
                  style={[styles.summaryInput, purchaseOrderId && styles.summaryInputDisabled]}
                  value={taxAmount.toString()}
                  onChangeText={(text) => {
                    const newTaxAmount = parseInt(text) || 0;
                    setTaxAmount(newTaxAmount);
                    const newTotal = subTotal + newTaxAmount - discountAmount + fee;
                    setTotalAmount(newTotal);
                  }}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.gray400}
                  editable={!purchaseOrderId}
                />
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá:</Text>
                <TextInput
                  style={[styles.summaryInput, purchaseOrderId && styles.summaryInputDisabled]}
                  value={discountAmount.toString()}
                  onChangeText={(text) => {
                    const newDiscountAmount = parseInt(text) || 0;
                    setDiscountAmount(newDiscountAmount);
                    const newTotal = subTotal + taxAmount - newDiscountAmount + fee;
                    setTotalAmount(newTotal);
                  }}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.gray400}
                  editable={!purchaseOrderId}
                />
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí khác:</Text>
                <TextInput
                  style={styles.summaryInput}
                  value={fee.toString()}
                  onChangeText={(text) => {
                    const feeValue = parseInt(text) || 0;
                    setFee(feeValue);
                    const newTotal = subTotal + taxAmount - discountAmount + feeValue;
                    setTotalAmount(newTotal);
                  }}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.totalSummaryRow}>
                <Text style={styles.totalSummaryLabel}>Tổng cộng:</Text>
                <Text style={styles.totalSummaryValue}>{formatCurrency(totalAmount)} VNĐ</Text>
              </View>
              
              {purchaseOrderId && (
                <Text style={styles.summaryHelperText}>* Các giá trị tự động từ đơn hàng</Text>
              )}
            </View>
          </View>

          {/* Product Form Modal */}
          {showProductForm && (
            <Modal visible={showProductForm} transparent animationType="slide">
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
                          selectedValue={currentProduct.variantId}
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
                        onChangeText={(text) => {
                          const inputValue = parseInt(text) || 0;
                          const validatedQuantity = validateQuantity(currentProduct.variantId, inputValue);
                          setCurrentProduct({ ...currentProduct, quantity: validatedQuantity });
                        }}
                        placeholder="Số lượng"
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.gray400}
                      />
                      {currentProduct.variantId && purchaseOrderDetail && (
                        <Text style={styles.helperText}>
                          Còn lại: {getRemainingQuantity(currentProduct.variantId)} / {purchaseOrderDetail.products?.find((p: any) => p.variant.id === currentProduct.variantId)?.quantity || 0}
                        </Text>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Đơn giá <Text style={styles.required}>*</Text></Text>
                      <TextInput
                        style={styles.input}
                        value={currentProduct.unitPrice.toString()}
                        onChangeText={(text) => setCurrentProduct({ ...currentProduct, unitPrice: parseInt(text) || 0 })}
                        placeholder="Đơn giá"
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Thuế suất (%):</Text>
                      <TextInput
                        style={styles.input}
                        value={currentProduct.taxRate.toString()}
                        onChangeText={(text) => setCurrentProduct({ ...currentProduct, taxRate: parseInt(text) || 0 })}
                        placeholder="Ví dụ: 10"
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Chiết khấu (%):</Text>
                      <TextInput
                        style={styles.input}
                        value={currentProduct.discountRate.toString()}
                        onChangeText={(text) => setCurrentProduct({ ...currentProduct, discountRate: parseInt(text) || 0 })}
                        placeholder="Ví dụ: 5"
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>

                    {/* <View style={styles.inputGroup}>
                      <Text style={styles.label}>Ngày sản xuất:</Text>
                      <TouchableOpacity 
                        style={styles.datePickerButton}
                        onPress={() => setShowManufactureDatePicker(true)}
                      >
                        <Text style={[styles.datePickerText, !currentProduct.manufactureDate && styles.placeholderText]}>
                          {currentProduct.manufactureDate ? formatDateDisplay(currentProduct.manufactureDate) : 'Chọn ngày sản xuất'}
                        </Text>
                        <MaterialCommunityIcons name="calendar" size={20} color={COLORS.gray600} />
                      </TouchableOpacity>
                      {showManufactureDatePicker && (
                        <DateTimePicker
                          value={currentProduct.manufactureDate ? new Date(currentProduct.manufactureDate) : new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            setShowManufactureDatePicker(false);
                            if (selectedDate) {
                              const newManufactureDate = selectedDate.toISOString().split('T')[0];
                              setCurrentProduct({ 
                                ...currentProduct, 
                                manufactureDate: newManufactureDate 
                              });
                              
                              // Kiểm tra và reset ngày hạn sử dụng nếu không hợp lệ
                              if (currentProduct.expiryDate && !validateExpiryDate(newManufactureDate, currentProduct.expiryDate)) {
                                setDialogConfig({
                                  type: 'info',
                                  title: 'Thông báo',
                                  message: 'Ngày hạn sử dụng đã được reset vì phải sau ngày sản xuất',
                                });
                                setShowDialog(true);
                                setCurrentProduct(prev => ({ ...prev, expiryDate: '' }));
                              }
                            }
                          }}
                        />
                      )}
                    </View> */}

                    {/* <View style={styles.inputGroup}>
                      <Text style={styles.label}>Hạn sử dụng:</Text>
                      <TouchableOpacity 
                        style={styles.datePickerButton}
                        onPress={() => setShowExpiryDatePicker(true)}
                      >
                        <Text style={[styles.datePickerText, !currentProduct.expiryDate && styles.placeholderText]}>
                          {currentProduct.expiryDate ? formatDateDisplay(currentProduct.expiryDate) : 'Chọn hạn sử dụng'}
                        </Text>
                        <MaterialCommunityIcons name="calendar" size={20} color={COLORS.gray600} />
                      </TouchableOpacity>
                      {currentProduct.manufactureDate && (
                        <Text style={styles.helperText}>
                          Phải sau ngày sản xuất: {formatDateDisplay(currentProduct.manufactureDate)}
                        </Text>
                      )}
                      {showExpiryDatePicker && (
                        <DateTimePicker
                          value={currentProduct.expiryDate ? new Date(currentProduct.expiryDate) : new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          minimumDate={currentProduct.manufactureDate ? new Date(new Date(currentProduct.manufactureDate).getTime() + 24 * 60 * 60 * 1000) : undefined}
                          onChange={(event, selectedDate) => {
                            setShowExpiryDatePicker(false);
                            if (selectedDate) {
                              const newExpiryDate = selectedDate.toISOString().split('T')[0];
                              
                              // Kiểm tra validation
                              if (currentProduct.manufactureDate && !validateExpiryDate(currentProduct.manufactureDate, newExpiryDate)) {
                                setDialogConfig({
                                  type: 'error',
                                  title: 'Lỗi',
                                  message: 'Hạn sử dụng phải sau ngày sản xuất',
                                });
                                setShowDialog(true);
                                return;
                              }
                              
                              setCurrentProduct({ 
                                ...currentProduct, 
                                expiryDate: newExpiryDate 
                              });
                            }
                          }}
                        />
                      )}
                    </View> */}

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
                      onPress={() => {
                        // Kiểm tra validation ngày trước khi thêm
                        if (currentProduct.manufactureDate && currentProduct.expiryDate && 
                            !validateExpiryDate(currentProduct.manufactureDate, currentProduct.expiryDate)) {
                          setDialogConfig({
                            type: 'error',
                            title: 'Lỗi',
                            message: 'Hạn sử dụng phải sau ngày sản xuất',
                          });
                          setShowDialog(true);
                          return;
                        }
                        handleAddProduct();
                      }}
                    >
                      <Text style={styles.addProductButtonText}>Thêm sản phẩm</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </Modal>
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

      {/* Dialog Notification */}
      <DialogNotification
        visible={showDialog}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        actions={[
          {
            text: 'OK',
            onPress: () => setShowDialog(false),
            style: 'default',
          },
        ]}
        onDismiss={() => setShowDialog(false)}
      />
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
    width: '50%',
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  productForm: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 16,
    paddingBottom: 24,
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
    color: COLORS.gray800,
    width: '50%',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
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
  totalAmountInput: {
    backgroundColor: COLORS.gray50,
    borderColor: COLORS.primary,
    fontWeight: '600',
    color: COLORS.primary,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  datePickerText: {
    fontSize: 14,
    color: COLORS.gray800,
    width: '90%',
  },
  placeholderText: {
    color: COLORS.gray400,
  },
  summarySection: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
    marginLeft: 8,
  },
  summaryContainer: {
    gap: 12,
  },
  summaryInput: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.gray800,
    backgroundColor: COLORS.white,
    textAlign: 'right',
    minWidth: 120,
    fontWeight: '600',
  },
  summaryInputDisabled: {
    backgroundColor: COLORS.gray100,
    color: COLORS.gray600,
    borderColor: COLORS.gray200,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.gray300,
    marginVertical: 8,
  },
  totalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  totalSummaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  totalSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryHelperText: {
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});
