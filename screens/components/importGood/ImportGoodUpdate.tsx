import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { contractService } from '../../../services/contractService';
import { productService } from '../../../services/productService';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DialogNotification from '../common/DialogNotification';

interface ImportGoodUpdateProps {
  visible: boolean;
  orderId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

interface ProductItem {
  id: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  taxRate: number;
  discountAmount?: number;
  taxAmount?: number;
  totalPrice: number;
  finalPrice: number;
  purchaseValue: number;
  note?: string;
  expiredDate?: string;
}

type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
type OrderStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";

interface CreatePurchaseOrderData {
  supplier: string;
  warehouse: string;
  contract?: string;
  products: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discountRate: number;
    discountAmount: number;
    subTotal: number;
    totalPrice: number;
    note?: string;
  }>;
  documents?: string[];
  orderDate: string;
  description?: string;
  note?: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

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

export default function ImportGoodUpdate({ visible, orderId, onClose, onUpdated }: ImportGoodUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Options for dropdowns
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [contractDetail, setContractDetail] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [contractProductQuantities, setContractProductQuantities] = useState<{[key: string]: number}>({});

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [showExpiredDatePicker, setShowExpiredDatePicker] = useState(false);
  const [showOrderDatePicker, setShowOrderDatePicker] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductItem>({
    id: "",
    quantity: 1,
    unitPrice: 0,
    discountRate: 0,
    taxRate: 0,
    totalPrice: 0,
    finalPrice: 0,
    purchaseValue: 0,
  });

  useEffect(() => {
    if (visible && orderId) {
      loadOptions();
      fetchOrder(orderId);
    } else {
      setForm(null);
    }
  }, [visible, orderId]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [suppliersData, warehousesData, contractsData, productsData] = await Promise.all([
        purchaseOrderService.getSuppliers(),
        purchaseOrderService.getWarehouses(),
        purchaseOrderService.getContracts(),
        productService.getProductVariants(),
      ]);
      setSuppliers(suppliersData);
      setWarehouses(warehousesData);
      setContracts(contractsData);
      setAllProducts(productsData);
      setProductOptions(productsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchOrder = async (id: string) => {
    setLoading(true);
    try {
      const data = await purchaseOrderService.getPurchaseOrderById(id);
      setForm(data);
      
      // Load contract detail if order has contract
      if (data?.contract?.id || data?.contract) {
        const contractId = typeof data.contract === 'string' ? data.contract : data.contract.id;
        await loadContractDetail(contractId);
      } else {
        setContractDetail(null);
        setProductOptions(allProducts);
        setContractProductQuantities({});
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err && err.message ? err.message : 'Không thể tải đơn hàng');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const loadContractDetail = async (contractId: string) => {
    if (!contractId) {
      setContractDetail(null);
      setProductOptions(allProducts);
      setContractProductQuantities({});
      return;
    }
    
    setLoadingContract(true);
    try {
      // Load contract detail and product quantities in parallel
      const [contractData, quantitiesResponse] = await Promise.all([
        contractService.getContractById(contractId),
        purchaseOrderService.getProductQuantitiesByContractId(contractId)
      ]);
      
      console.log('Contract Detail:', contractData);
      console.log('Product Quantities Response:', quantitiesResponse);
      
      if (contractData) {
        setContractDetail(contractData);
        
        // Tạo object mapping cho số lượng còn lại
        const remainingQuantities: {[key: string]: number} = {};
        
        // Kiểm tra xem API trả về số lượng gốc hay số lượng còn lại
        if (contractData.items && contractData.items.length > 0) {
          contractData.items.forEach((item: any) => {
            const variantId = item.variant.id;
            const originalQuantity = item.quantity; // Số lượng gốc từ hợp đồng
            
            // API response format: quantitiesResponse.data[variantId] = remaining quantity
            const apiQuantity = quantitiesResponse?.data?.[variantId];
            
            if (apiQuantity !== undefined) {
              // API có trả về dữ liệu cho variant này
              remainingQuantities[variantId] = apiQuantity;
              console.log(`Variant ${variantId}: Original=${originalQuantity}, API_Remaining=${apiQuantity}`);
            } else {
              // API không có dữ liệu, giả sử chưa nhập hàng
              remainingQuantities[variantId] = originalQuantity;
              console.log(`Variant ${variantId}: Original=${originalQuantity}, Assumed_Remaining=${originalQuantity}`);
            }
          });
        }
        
        console.log('Final Remaining Quantities:', remainingQuantities);
        setContractProductQuantities(remainingQuantities);
        
        // Filter products theo contract items - API trả về variant thay vì product
        if (contractData.items && contractData.items.length > 0) {
          // Lấy danh sách variant từ contract items
          const contractProducts = contractData.items.map((item: any) => ({
            ...item.variant,
            // Thêm thông tin từ contract item để dùng sau
            contractQuantity: item.quantity,
            contractUnitPrice: item.unitPrice,
            contractTaxRate: item.taxRate,
            contractTaxAmount: item.taxAmount,
            contractDiscountRate: item.discountRate,
            contractDiscountAmount: item.discountAmount,
            contractNote: item.note,
            // Thêm số lượng còn lại từ tính toán
            remainingQuantity: remainingQuantities[item.variant.id] || 0
          }));
          setProductOptions(contractProducts);
          console.log('Contract products with remaining quantities:', contractProducts);
        } else {
          setProductOptions(allProducts);
        }
      }
    } catch (error: any) {
      console.error('Error loading contract detail or quantities:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hợp đồng');
      setContractDetail(null);
      setProductOptions(allProducts);
      setContractProductQuantities({});
    } finally {
      setLoadingContract(false);
    }
  };

  // Helper function để tính số lượng còn lại thực tế
  const getActualRemainingQuantity = (productId: string) => {
    if (!contractDetail || contractProductQuantities[productId] === undefined) {
      return null;
    }
    
    // Số lượng còn lại từ API (đã trừ các đơn hàng trước đó)
    const apiRemainingQuantity = contractProductQuantities[productId];
    
    // Số lượng đã có trong form hiện tại (exclude current editing)
    const usedInCurrentOrder = (form?.products || [])
      .filter((p: any) => (p.variant?.id || p.id) === productId)
      .reduce((total: number, p: any) => total + p.quantity, 0);
    
    // Số lượng còn lại thực tế = số lượng từ API - số lượng đã dùng trong order
    return Math.max(0, apiRemainingQuantity - usedInCurrentOrder);
  };

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
    
    // Handle contract change
    if (key === 'contract') {
      loadContractDetail(value);
      
      // Reset supplier if contract changes
      if (value && contractDetail && contractDetail.supplier?.id) {
        setForm((prev: any) => ({ ...prev, supplier: contractDetail.supplier.id }));
      }
      
      // Reset contract product quantities if no contract
      if (!value) {
        setContractProductQuantities({});
      }
    }
  };

  const handleRemoveProduct = (index: number) => {
    const products = [...(form.products || [])];
    products.splice(index, 1);
    setForm((prev: any) => ({ ...prev, products }));
  };

  const handleRemoveDocument = (index: number) => {
    const documents = [...(form.documents || [])];
    documents.splice(index, 1);
    setForm((prev: any) => ({ ...prev, documents }));
  };

  const calculateProductPrices = (product: ProductItem): ProductItem => {
    const totalPrice = product.quantity * product.unitPrice;
    
    // Calculate discount and tax amounts based on rates
    const discountAmount = product.discountAmount !== undefined 
      ? product.discountAmount 
      : totalPrice * (product.discountRate || 0) / 100;
    
    const priceAfterDiscount = totalPrice - discountAmount;
    
    const taxAmount = product.taxAmount !== undefined
      ? product.taxAmount
      : priceAfterDiscount * (product.taxRate || 0) / 100;
    
    const finalPrice = priceAfterDiscount + taxAmount;

    return {
      ...product,
      totalPrice,
      finalPrice,
      purchaseValue: finalPrice,
      discountAmount,
      taxAmount,
      // Keep rates for API
      discountRate: product.discountRate || (product.discountAmount ? (discountAmount / totalPrice * 100) : 0),
      taxRate: product.taxRate || (product.taxAmount ? (taxAmount / priceAfterDiscount * 100) : 0),
    };
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = productOptions.find((p) => p.id === productId);
    if (selectedProduct) {
      // Get product name - handle different data structures
      const productName = selectedProduct.name || selectedProduct.productName || selectedProduct.product?.name || '';
      
      // Nếu có contract detail, lấy thông tin từ product option đã được enhance với contract info
      if (contractDetail && selectedProduct.contractQuantity !== undefined) {
        // Thông tin đã được lưu trong productOptions khi load contract
        setCurrentProduct({
          ...currentProduct,
          id: productId,
          name: productName,
          quantity: selectedProduct.contractQuantity,
          unitPrice: selectedProduct.contractUnitPrice,
          discountAmount: selectedProduct.contractDiscountAmount || 0,
          taxAmount: selectedProduct.contractTaxAmount || 0,
          discountRate: selectedProduct.contractDiscountRate || 0,
          taxRate: selectedProduct.contractTaxRate || 0,
          note: selectedProduct.contractNote || '',
        });
      } else {
        // Không có contract hoặc sản phẩm không thuộc contract
        setCurrentProduct({
          ...currentProduct,
          id: productId,
          name: productName,
          unitPrice: selectedProduct.standardCost || selectedProduct.lastPurchaseCost || selectedProduct.costPrice || selectedProduct.price || selectedProduct.unitPrice || 0,
          discountAmount: undefined,
          taxAmount: undefined,
        });
      }
    }
  };

  const handleAddProduct = () => {
    if (!currentProduct.id) {
      Alert.alert("Thông báo", "Vui lòng chọn sản phẩm");
      return;
    }

    // Validation số lượng
    if (currentProduct.quantity <= 0) {
      Alert.alert("Thông báo", "Số lượng phải lớn hơn 0");
      return;
    }

    // Nếu có contract, kiểm tra số lượng không vượt quá
    if (contractDetail) {
      const contractItem = contractDetail.items?.find(
        (item: any) => item.variant.id === currentProduct.id
      );
      if (contractItem && currentProduct.quantity > contractItem.quantity) {
        Alert.alert(
          "Thông báo",
          `Số lượng không được vượt quá ${contractItem.quantity} (theo hợp đồng)`
        );
        return;
      }
    }

    const calculatedProduct = calculateProductPrices(currentProduct);
    const products = [...(form.products || []), calculatedProduct];
    setForm((prev: any) => ({ ...prev, products }));
    
    setCurrentProduct({
      id: "",
      quantity: 1,
      unitPrice: 0,
      discountRate: 0,
      taxRate: 0,
      totalPrice: 0,
      finalPrice: 0,
      purchaseValue: 0,
    });
    setShowProductForm(false);
  };

  const calculateOrderTotals = () => {
    const products = form?.products || [];
    const subTotal = products.reduce((sum: number, p: any) => sum + (p.totalPrice || p.quantity * p.unitPrice), 0);
    const discountAmount = products.reduce((sum: number, p: any) => sum + (p.discountAmount || 0), 0);
    const taxAmount = products.reduce((sum: number, p: any) => sum + (p.taxAmount || 0), 0);
    const totalAmount = products.reduce((sum: number, p: any) => sum + (p.finalPrice || p.totalPrice || p.quantity * p.unitPrice), 0);

    return { subTotal, taxAmount, totalAmount, discountAmount };
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const documentId = await purchaseOrderService.uploadDocument(file);
        const documents = [...(form.documents || [])];
        documents.push(documentId);
        setForm((prev: any) => ({ ...prev, documents }));
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải tài liệu lên');
    }
  };

  const handleSave = async () => {
    if (!form) return;

    if (!form.orderNumber) {
      Alert.alert('Thông báo', 'Vui lòng nhập số đơn hàng');
      return;
    }
    if (!form.supplier) {
      Alert.alert('Thông báo', 'Vui lòng chọn nhà cung cấp');
      return;
    }
    if (!form.warehouse) {
      Alert.alert('Thông báo', 'Vui lòng chọn kho hàng');
      return;
    }
    if (!form.products || form.products.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }

    const { subTotal, taxAmount, totalAmount, discountAmount } = calculateOrderTotals();

    setSaving(true);
    try {
      const payload: CreatePurchaseOrderData = {
        supplier: form.supplier?.id || form.supplier,
        warehouse: form.warehouse?.id || form.warehouse,
        ...(form.contract && { contract: form.contract?.id || form.contract }),
        products: (form.products || []).map((p: any) => ({
          variantId: p.variant?.id || p.id,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          taxRate: p.taxRate || 0,
          taxAmount: p.taxAmount || 0,
          discountRate: p.discountRate || 0,
          discountAmount: p.discountAmount || 0,
          subTotal: p.quantity * p.unitPrice,
          totalPrice: p.finalPrice || p.totalPrice || (p.quantity * p.unitPrice),
          ...(p.note && { note: p.note }),
        })),
        ...(form.documents && form.documents.length > 0 && { documents: form.documents.map((d: any) => d.id || d) }),
        orderDate: form.orderDate,
        description: form.description || '',
        note: form.note || '',
        subTotal,
        taxAmount,
        discountAmount,
        totalAmount,
      };

      // Update with ID for update operation
      const updatePayload = {
        ...payload,
        id: form.id
      };

      await purchaseOrderService.updatePurchaseOrder(updatePayload);
      
      setShowSuccessDialog(true);
      
      // Auto close success dialog after 2 seconds
      setTimeout(() => {
        setShowSuccessDialog(false);
        onUpdated && onUpdated();
        onClose();
      }, 2000);
    } catch (err: any) {
      Alert.alert('Lỗi', err && err.message ? err.message : 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN');
  };

  if (loadingOptions) {
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
          <Text style={styles.headerTitle}>Cập nhật đơn nhập hàng</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : form ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Order Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số đơn hàng</Text>
                <TextInput
                  style={styles.input}
                  value={form.orderNumber}
                  onChangeText={(t) => handleChange('orderNumber', t)}
                  placeholder="Ví dụ: PN-2026-0001"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Nhà cung cấp <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.pickerContainer, contractDetail && styles.pickerDisabled]}>
                  <Picker
                    selectedValue={form.supplier?.id || form.supplier || ''}
                    onValueChange={(value) => handleChange('supplier', value)}
                    style={styles.picker}
                    enabled={!contractDetail}
                  >
                    <Picker.Item label="-- Chọn nhà cung cấp --" value="" />
                    {suppliers.map((s) => (
                      <Picker.Item key={s.id} label={s.name} value={s.id} />
                    ))}
                  </Picker>
                </View>
                {contractDetail && (
                  <Text style={styles.helperText}>
                    Nhà cung cấp sẽ được tự động chọn từ hợp đồng
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Kho hàng <Text style={styles.required}>*</Text>
                </Text>
                
                {/* Hiển thị thông tin kho hàng từ hợp đồng */}
                {contractDetail && contractDetail.warehouse && (
                  <View style={styles.contractWarehouseInfo}>
                    <View style={styles.contractWarehouseHeader}>
                      <MaterialCommunityIcons 
                        name="warehouse" 
                        size={16} 
                        color={COLORS.primary} 
                      />
                      <Text style={styles.contractWarehouseTitle}>
                        Kho hàng từ hợp đồng
                      </Text>
                    </View>
                    <View style={styles.contractWarehouseDetails}>
                      <Text style={styles.contractWarehouseName}>
                        {contractDetail.warehouse.name}
                      </Text>
                      {contractDetail.warehouse.address && (
                        <Text style={styles.contractWarehouseAddress}>
                          📍 {contractDetail.warehouse.address}
                        </Text>
                      )}
                      {contractDetail.warehouse.manager && (
                        <Text style={styles.contractWarehouseManager}>
                          👤 {contractDetail.warehouse.manager}
                        </Text>
                      )}
                      {contractDetail.warehouse.phone && (
                        <Text style={styles.contractWarehousePhone}>
                          📞 {contractDetail.warehouse.phone}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.contractWarehouseNote}>
                      💡 Bạn có thể chọn kho hàng khác nếu cần
                    </Text>
                  </View>
                )}
                
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.warehouse?.id || form.warehouse || ''}
                    onValueChange={(value) => handleChange('warehouse', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="-- Chọn kho hàng --" value="" />
                    {warehouses.map((w) => (
                      <Picker.Item 
                        key={w.id} 
                        label={w.name + (contractDetail && contractDetail.warehouse && w.id === contractDetail.warehouse.id ? ' (Từ hợp đồng)' : '')} 
                        value={w.id} 
                      />
                    ))}
                  </Picker>
                </View>
                
                {form.warehouse && form.warehouse !== contractDetail?.warehouse?.id && contractDetail?.warehouse && (
                  <Text style={styles.warningText}>
                    ⚠️ Bạn đã chọn kho hàng khác với kho hàng trong hợp đồng
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hợp đồng (không bắt buộc)</Text>
                <View style={[styles.pickerContainer, loadingContract && styles.pickerDisabled]}>
                  <Picker
                    selectedValue={form.contract?.id || form.contract || ''}
                    onValueChange={(value) => handleChange('contract', value)}
                    style={styles.picker}
                    enabled={!loadingContract}
                  >
                    <Picker.Item label="-- Chọn hợp đồng --" value="" />
                    {contracts.map((c) => (
                      <Picker.Item key={c.id} label={`${c.contractNumber} - ${c.supplier?.name || 'N/A'}`} value={c.id} />
                    ))}
                  </Picker>
                </View>
                {loadingContract && (
                  <Text style={styles.helperText}>Đang tải chi tiết hợp đồng...</Text>
                )}
                {contractDetail && (
                  <Text style={styles.helperText}>
                    Nhà cung cấp: {contractDetail.supplier?.name || 'N/A'}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Ngày đặt hàng <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowOrderDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: COLORS.gray800,
                      fontSize: 14,
                    }}
                  >
                    {form.orderDate ? new Date(form.orderDate).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}
                  </Text>
                </TouchableOpacity>
                
                {showOrderDatePicker && (
                  <DateTimePicker
                    value={form.orderDate ? new Date(form.orderDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowOrderDatePicker(false);
                      if (event.type === "dismissed") return;
                      if (!selectedDate) return;
                      handleChange('orderDate', selectedDate.toISOString());
                    }}
                  />
                )}
                <Text style={styles.helperText}>Ngày tạo đơn nhập hàng</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={form.description || ''}
                  onChangeText={(t) => handleChange('description', t)}
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
                  value={form.note || ''}
                  onChangeText={(t) => handleChange('note', t)}
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
                  <MaterialCommunityIcons
                    name="plus"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.addButtonText}>Thêm</Text>
                </TouchableOpacity>
              </View>

              {(form.products || []).map((product: any, index: number) => (
                <View key={index} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productName}>
                      {product.name || 
                       product.variant?.name || 
                       product.variant?.productName || 
                       product.variant?.product?.name ||
                       product.productName ||
                       product.product?.name ||
                       product.id}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                      <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productDetail}>SL: {product.quantity}</Text>
                    <Text style={styles.productDetail}>
                      Đơn giá: {formatCurrency(product.unitPrice)}
                    </Text>
                    <Text style={styles.productDetail}>
                      Giảm: {product.discountRate ? (product.discountRate).toFixed(1) + '%' : 
                             product.discountPercent ? (product.discountPercent * 100).toFixed(1) + '%' : 
                             product.discountAmount ? formatCurrency(product.discountAmount) + 'đ' : '-'}
                    </Text>
                    <Text style={styles.productDetail}>
                      Thuế: {product.taxRate ? (product.taxRate).toFixed(1) + '%' : 
                             product.taxPercent ? (product.taxPercent * 100).toFixed(1) + '%' : 
                             product.taxAmount ? formatCurrency(product.taxAmount) + 'đ' : '-'}
                    </Text>
                  </View>
                  <View style={styles.productFooter}>
                    <Text style={styles.productTotal}>
                      Thành tiền: {formatCurrency(
                        product.finalPrice || 
                        product.totalPrice || 
                        product.purchaseValue || 
                        (product.quantity * product.unitPrice)
                      )} 
                    </Text>
                  </View>
                  {product.note && (
                    <Text style={styles.productNote}>Ghi chú: {product.note}</Text>
                  )}
                </View>
              ))}

              {form.products && form.products.length === 0 && (
                <View style={styles.emptyProducts}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={48}
                    color={COLORS.gray400}
                  />
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

              {(form.documents || []).map((doc: any, index: number) => (
                <View key={index} style={styles.documentCard}>
                  <MaterialCommunityIcons
                    name="file-document"
                    size={20}
                    color={COLORS.gray600}
                  />
                  <Text style={styles.documentText}>Tài liệu {index + 1}</Text>
                  <TouchableOpacity onPress={() => handleRemoveDocument(index)}>
                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {form.documents && form.documents.length === 0 && (
                <Text style={styles.emptyText}>Chưa có tài liệu</Text>
              )}
            </View>

            {/* Summary Section */}
            {form.products && form.products.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tổng kết</Text>
                {(() => {
                  const { subTotal, taxAmount, totalAmount, discountAmount } = calculateOrderTotals();
                  return (
                    <>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tạm tính:</Text>
                        <Text style={styles.summaryValue}>
                          {formatCurrency(subTotal)} 
                        </Text>
                      </View>
                      {discountAmount > 0 && (
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Giảm giá:</Text>
                          <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
                            -{formatCurrency(discountAmount)} 
                          </Text>
                        </View>
                      )}
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Thuế:</Text>
                        <Text style={styles.summaryValue}>
                          {formatCurrency(taxAmount)} 
                        </Text>
                      </View>
                      <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Tổng cộng:</Text>
                        <Text style={styles.totalValue}>
                          {formatCurrency(totalAmount)} 
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="database-off-outline" size={48} color={COLORS.gray400} />
            <Text style={styles.emptyText}>Không có dữ liệu</Text>
          </View>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <Modal visible={showProductForm} transparent animationType="fade">
            <View style={styles.productFormOverlay}>
              <View style={styles.productForm}>
                <View style={styles.productFormHeader}>
                  <Text style={styles.productFormTitle}>Thêm sản phẩm</Text>
                  <TouchableOpacity onPress={() => setShowProductForm(false)}>
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color={COLORS.gray800}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Sản phẩm <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={currentProduct.id}
                        onValueChange={handleProductSelect}
                        style={styles.picker}
                      >
                        <Picker.Item label="-- Chọn sản phẩm --" value="" />
                        {productOptions.map((p) => {
                          const displayName = p.name || p.productName || p.product?.name || 'Sản phẩm ' + p.id;
                          const displaySku = p.sku || p.code || p.productCode || '';
                          return (
                            <Picker.Item
                              key={p.id}
                              label={displaySku ? `${displayName} (${displaySku})` : displayName}
                              value={p.id}
                            />
                          );
                        })}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Số lượng <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={currentProduct.quantity.toString()}
                        onChangeText={(text) => {
                          // Chỉ cho phép số dương
                          const numValue = parseInt(text) || 0;
                          if (numValue >= 0) {
                            setCurrentProduct({
                              ...currentProduct,
                              quantity: numValue,
                            });
                          }
                        }}
                        placeholder="Số lượng"
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.gray400}
                      />
                      {contractDetail && currentProduct.id && (() => {
                        const actualRemainingQuantity = getActualRemainingQuantity(currentProduct.id);
                        const apiRemainingQuantity = contractProductQuantities[currentProduct.id];
                        const usedInCurrentOrder = (form?.products || [])
                          .filter((p: any) => (p.variant?.id || p.id) === currentProduct.id)
                          .reduce((total: number, p: any) => total + p.quantity, 0);
                        
                        // Tìm thông tin gốc từ contract
                        const contractItem = contractDetail.items?.find((item: any) => item.variant.id === currentProduct.id);
                        const originalContractQuantity = contractItem?.quantity || 0;
                        
                        return apiRemainingQuantity !== undefined ? (
                          <View>
                            <View style={styles.quantityDebugContainer}>
                              <Text style={styles.quantityDebugTitle}>📊 Tình huống số lượng:</Text>
                              <Text style={styles.quantityDebugText}>
                                • Số lượng hợp đồng: {originalContractQuantity}
                              </Text>
                              <Text style={styles.quantityDebugText}>
                                • Còn lại (API): {apiRemainingQuantity}
                              </Text>
                              {usedInCurrentOrder > 0 && (
                                <Text style={styles.quantityDebugText}>
                                  • Đang sử dụng: {usedInCurrentOrder}
                                </Text>
                              )}
                              <Text style={[styles.quantityDebugText, styles.quantityFinalText]}>
                                ✅ Còn lại thực tế: {actualRemainingQuantity}
                              </Text>
                            </View>
                            
                            <Text style={styles.helperText}>
                              Số lượng còn lại: {actualRemainingQuantity} (theo hợp đồng)
                            </Text>
                            {usedInCurrentOrder > 0 && (
                              <Text style={styles.usedQuantityText}>
                                Đã sử dụng trong đơn này: {usedInCurrentOrder}
                              </Text>
                            )}
                          </View>
                        ) : null;
                      })()}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        Đơn giá <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={currentProduct.unitPrice.toString()}
                        onChangeText={(text: string) =>
                          setCurrentProduct({
                            ...currentProduct,
                            unitPrice: parseFloat(text) || 0,
                          })
                        }
                        placeholder="Đơn giá"
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.gray400}
                      />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ngày hết hạn</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowExpiredDatePicker(true)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          color: currentProduct.expiredDate
                            ? COLORS.gray800
                            : COLORS.gray400,
                          fontSize: 14,
                        }}
                      >
                        {currentProduct.expiredDate
                          ? currentProduct.expiredDate.slice(0, 10)
                          : "Chọn ngày (YYYY-MM-DD)"}
                      </Text>
                    </TouchableOpacity>

                    {showExpiredDatePicker && (
                      <DateTimePicker
                        value={
                          currentProduct.expiredDate
                            ? new Date(currentProduct.expiredDate)
                            : new Date()
                        }
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowExpiredDatePicker(false);
                          if (event.type === "dismissed") return;
                          if (!selectedDate) return;
                          setCurrentProduct({
                            ...currentProduct,
                            expiredDate: selectedDate.toISOString(),
                          });
                        }}
                      />
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Giảm giá {currentProduct.discountAmount !== undefined ? '(đ)' : '(%)'})</Text>
                    <TextInput
                      style={[styles.input, currentProduct.discountAmount !== undefined && styles.inputDisabled]}
                      value={currentProduct.discountAmount !== undefined
                        ? Math.round(currentProduct.discountAmount).toLocaleString('vi-VN')
                        : (currentProduct.discountRate * 100).toString()
                      }
                      onChangeText={(text) =>
                        setCurrentProduct({
                          ...currentProduct,
                          discountRate: (parseFloat(text) || 0) / 100,
                        })
                      }
                      placeholder={currentProduct.discountAmount !== undefined ? "Giảm giá (từ hợp đồng)" : "Phần trăm giảm giá"}
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.gray400}
                      editable={currentProduct.discountAmount === undefined}
                    />
                    {currentProduct.discountAmount !== undefined && (
                      <Text style={styles.helperText}>Giảm giá được lấy từ hợp đồng</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Thuế {currentProduct.taxAmount !== undefined ? '(đ)' : '(%)'}</Text>
                    <TextInput
                      style={[styles.input, currentProduct.taxAmount !== undefined && styles.inputDisabled]}
                      value={currentProduct.taxAmount !== undefined
                        ? Math.round(currentProduct.taxAmount).toLocaleString('vi-VN')
                        : (currentProduct.taxRate * 100).toString()
                      }
                      onChangeText={(text) =>
                        setCurrentProduct({
                          ...currentProduct,
                          taxRate: (parseFloat(text) || 0) / 100,
                        })
                      }
                      placeholder={currentProduct.taxAmount !== undefined ? "Thuế (từ hợp đồng)" : "Phần trăm thuế"}
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.gray400}
                      editable={currentProduct.taxAmount === undefined}
                    />
                    {currentProduct.taxAmount !== undefined && (
                      <Text style={styles.helperText}>Thuế được lấy từ hợp đồng</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={currentProduct.note || ''}
                      onChangeText={(text) =>
                        setCurrentProduct({ ...currentProduct, note: text })
                      }
                      placeholder="Ghi chú sản phẩm"
                      placeholderTextColor={COLORS.gray400}
                      multiline
                      numberOfLines={2}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.addProductButton}
                    onPress={handleAddProduct}
                  >
                    <Text style={styles.addProductButtonText}>
                      Thêm sản phẩm
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

        {/* Footer */}
        {form && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Cập nhật</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Success Dialog */}
      <DialogNotification
        visible={showSuccessDialog}
        type="success"
        title="Cập nhật thành công!"
        message="Đơn nhập hàng đã được cập nhật thành công"
        actions={[
          {
            text: "OK",
            onPress: () => {
              setShowSuccessDialog(false);
              onUpdated && onUpdated();
              onClose();
            }
          }
        ]}
        onDismiss={() => {
          setShowSuccessDialog(false);
          onUpdated && onUpdated();
          onClose();
        }}
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },

  content: {
    flex: 1,
  },

  // Section
  section: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 16,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Input Group
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 8,
    letterSpacing: 0.2,
  },

  // Input
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.gray800,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Picker
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  picker: {
    height: 52,
  },

  // Product Card
  productCard: {
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.gray50,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
    lineHeight: 20,
    marginRight: 8,
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  productDetail: {
    fontSize: 12,
    color: COLORS.gray600,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    fontWeight: '600',
  },
  productFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray400,
    paddingTop: 12,
    marginTop: 4,
  },
  productTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  productNote: {
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: 'italic',
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gray400,
  },

  // Empty State
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },

  // Document Card
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '500',
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  totalRow: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    marginTop: 4,
    paddingVertical: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gray400,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.5,
  },

  // Product Form Modal
  productFormOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  productForm: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: "100%",
    maxHeight: "85%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  productFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  productFormTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  addProductButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addProductButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  required: {
    color: COLORS.error,
  },
  pickerDisabled: {
    backgroundColor: COLORS.gray100,
    opacity: 0.7,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 4,
    fontStyle: "italic",
  },
  
  // Contract warehouse info styles
  contractWarehouseInfo: {
    backgroundColor: COLORS.primary + "08",
    borderWidth: 1,
    borderColor: COLORS.primary + "20",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contractWarehouseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  contractWarehouseTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    flex: 1,
  },
  contractWarehouseDetails: {
    gap: 6,
    marginBottom: 10,
  },
  contractWarehouseName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  contractWarehouseAddress: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  contractWarehouseManager: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  contractWarehousePhone: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  contractWarehouseNote: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: "italic",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary + "20",
  },
  warningText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.error + "10",
    borderRadius: 6,
    fontWeight: "500",
  },
  usedQuantityText: {
    fontSize: 11,
    color: COLORS.gray600,
    marginTop: 2,
    fontStyle: "italic",
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quantityDebugContainer: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  quantityDebugTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gray800,
    marginBottom: 6,
  },
  quantityDebugText: {
    fontSize: 11,
    color: COLORS.gray600,
    lineHeight: 16,
    marginBottom: 2,
    fontFamily: "monospace",
  },
  quantityFinalText: {
    fontWeight: "700",
    color: COLORS.success,
    marginTop: 4,
  },
  inputDisabled: {
    backgroundColor: COLORS.gray100,
    color: COLORS.gray600,
  },
});