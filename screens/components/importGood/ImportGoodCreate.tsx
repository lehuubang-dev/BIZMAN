import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { purchaseOrderService } from "../../../services/purchaseOrderService";
import { contractService } from "../../../services/contractService";
import { productService } from "../../../services/productService";
import {
  CreatePurchaseOrderData,
  PaymentStatus,
  OrderStatus,
} from "../../../types/purchaseOrder";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import DialogNotification from "../common/DialogNotification";

const COLORS = {
  primary: "#2196F3",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray600: "#4B5563",
  gray800: "#1F2937",
  success: "#10B981",
  error: "#EF4444",
};

interface ImportGoodCreateProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
}

export default function ImportGoodCreate({
  visible,
  onClose,
  onSuccess,
}: ImportGoodCreateProps) {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);

  // Options for dropdowns
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [contractDetail, setContractDetail] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Form fields
  const [supplier, setSupplier] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [contract, setContract] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString());
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("DRAFT");
  const [showExpiredDatePicker, setShowExpiredDatePicker] = useState(false);
  const [showOrderDatePicker, setShowOrderDatePicker] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
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
    if (visible) {
      loadOptions();
    }
  }, [visible]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [suppliersData, warehousesData, contractsData, productsData] =
        await Promise.all([
          purchaseOrderService.getSuppliers(),
          purchaseOrderService.getWarehouses(),
          purchaseOrderService.getContracts(),
          productService.getProductVariants(), // Use product variants instead
        ]);

      setSuppliers(suppliersData);
      setWarehouses(warehousesData);
      setContracts(contractsData);
      setAllProducts(productsData);
      setProductOptions(productsData);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadContractDetail = async (contractId: string) => {
    if (!contractId) {
      setContractDetail(null);
      setProductOptions(allProducts);
      return;
    }
    
    setLoadingContract(true);
    try {
      const data = await contractService.getContractById(contractId);
      console.log('Contract Detail:', data);
      
      if (data) {
        setContractDetail(data);
        
        // Auto-fill supplier (không thể thay đổi)
        if (data.supplier?.id) {
          setSupplier(data.supplier.id);
        }
        
        // Filter products theo contract items - API trả về variant thay vì product
        if (data.items && data.items.length > 0) {
          // Lấy danh sách variant từ contract items
          const contractProducts = data.items.map((item: any) => ({
            ...item.variant,
            // Thêm thông tin từ contract item để dùng sau
            contractQuantity: item.quantity,
            contractUnitPrice: item.unitPrice,
            contractTaxRate: item.taxRate,
            contractTaxAmount: item.taxAmount,
            contractDiscountRate: item.discountRate,
            contractDiscountAmount: item.discountAmount,
            contractNote: item.note
          }));
          setProductOptions(contractProducts);
        } else {
          setProductOptions(allProducts);
        }
      }
    } catch (error: any) {
      console.error('Error loading contract detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hợp đồng');
      setContractDetail(null);
      setProductOptions(allProducts);
    } finally {
      setLoadingContract(false);
    }
  };

  const resetForm = () => {
    setSupplier("");
    setWarehouse("");
    setContract("");
    setOrderNumber(""); // Keep this but API will auto-generate
    setOrderDate(new Date().toISOString());
    setDescription("");
    setNote("");
    setProducts([]);
    setDocuments([]);
    setPaymentStatus("PENDING");
    setOrderStatus("DRAFT");
    setContractDetail(null);
    setProductOptions(allProducts);
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

  const calculateOrderTotals = () => {
    const subTotal = products.reduce((sum, p) => sum + p.totalPrice, 0);
    const discountAmount = products.reduce((sum, p) => sum + (p.discountAmount || 0), 0);
    const taxAmount = products.reduce((sum, p) => sum + (p.taxAmount || 0), 0);
    const totalAmount = products.reduce((sum, p) => sum + p.finalPrice, 0);

    return { subTotal, taxAmount, totalAmount, discountAmount };
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
    setProducts([...products, calculatedProduct]);
    setCurrentProduct({
      id: "",
      quantity: 1,
      unitPrice: 0,
      discountRate: 0,
      taxRate: 0,
      totalPrice: 0,
      finalPrice: 0,
      purchaseValue: 0,
      note: undefined,
    });
    setShowProductForm(false);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (
        result.canceled === false &&
        result.assets &&
        result.assets.length > 0
      ) {
        const file = result.assets[0];
        console.log("Selected file:", file);

        const documentId = await purchaseOrderService.uploadDocument(file);
        console.log("Document uploaded, ID/Path:", documentId);

        setDocuments([...documents, documentId]);
      }
    } catch (error: any) {
      console.error("Document upload error:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải tài liệu lên");
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!supplier) {
      Alert.alert("Thông báo", "Vui lòng chọn nhà cung cấp");
      return;
    }
    if (!warehouse) {
      Alert.alert("Thông báo", "Vui lòng chọn kho hàng");
      return;
    }
    if (products.length === 0) {
      Alert.alert("Thông báo", "Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }

    const { subTotal, taxAmount, totalAmount, discountAmount } = calculateOrderTotals();

    const orderData: CreatePurchaseOrderData = {
      supplier,
      warehouse,
      ...(contract && { contract }),
      products: products.map((p) => ({
        variantId: p.id, // Use variantId instead of id
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        taxRate: p.taxRate || 0,
        taxAmount: p.taxAmount || 0,
        discountRate: p.discountRate || 0,
        discountAmount: p.discountAmount || 0,
        subTotal: p.quantity * p.unitPrice,
        totalPrice: p.finalPrice,
        ...(p.note && { note: p.note }),
      })),
      ...(documents.length > 0 && { documents }),
      orderDate,
      description,
      note,
      subTotal,
      taxAmount,
      discountAmount,
      totalAmount,
    };

    console.log(
      "Submitting purchase order:",
      JSON.stringify(orderData, null, 2),
    );

    setLoading(true);
    try {
      const result = await purchaseOrderService.createPurchaseOrder(orderData);
      console.log("Purchase order created, result:", result);

      resetForm();
      setShowSuccessDialog(true);
      
      // Auto close success dialog after 2 seconds
      setTimeout(() => {
        setShowSuccessDialog(false);
        onClose();
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to create purchase order:", error);
      Alert.alert("Lỗi", error.message || "Không thể tạo đơn nhập hàng");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString("vi-VN");
  };

  const { subTotal, taxAmount, totalAmount } = calculateOrderTotals();

  const renderRadioButton = (
    label: string,
    value: string,
    selectedValue: string,
    onSelect: (value: any) => void,
  ) => (
    <TouchableOpacity
      style={styles.radioButton}
      onPress={() => onSelect(value)}
    >
      <View
        style={[
          styles.radioOuter,
          selectedValue === value && styles.radioOuterSelected,
        ]}
      >
        {selectedValue === value && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

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
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.gray800}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo đơn nhập hàng</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Số đơn hàng
              </Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={orderNumber}
                onChangeText={setOrderNumber}
                placeholder="Hệ thống sẽ tự động tạo số đơn hàng"
                placeholderTextColor={COLORS.gray400}
                editable={false}
              />
              <Text style={styles.helperText}>Số đơn hàng sẽ được tự động tạo khi lưu</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hợp đồng</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={contract}
                  onValueChange={(value) => {
                    setContract(value);
                    loadContractDetail(value);
                  }}
                  style={styles.picker}
                  enabled={!loadingContract}
                >
                  <Picker.Item
                    label="-- Chọn hợp đồng --"
                    value=""
                  />
                  {contracts.map((c) => (
                    <Picker.Item
                      key={c.id}
                      label={c.contractNumber + " - " + c.title}
                      value={c.id}
                    />
                  ))}
                </Picker>
              </View>
              {loadingContract && (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 8 }} />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nhà cung cấp <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.pickerContainer, contract && styles.pickerDisabled]}>
                <Picker
                  selectedValue={supplier}
                  onValueChange={setSupplier}
                  style={styles.picker}
                  enabled={!contract}
                >
                  <Picker.Item label="-- Chọn nhà cung cấp --" value="" />
                  {suppliers.map((s) => (
                    <Picker.Item key={s.id} label={s.name} value={s.id} />
                  ))}
                </Picker>
              </View>
              {contract && (
                <Text style={styles.helperText}>Nhà cung cấp được lấy từ hợp đồng</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Kho hàng <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={warehouse}
                  onValueChange={setWarehouse}
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
                  {new Date(orderDate).toLocaleDateString('vi-VN')}
                </Text>
              </TouchableOpacity>
              
              {showOrderDatePicker && (
                <DateTimePicker
                  value={new Date(orderDate)}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowOrderDatePicker(false);
                    if (event.type === "dismissed") return;
                    if (!selectedDate) return;
                    setOrderDate(selectedDate.toISOString());
                  }}
                />
              )}
              <Text style={styles.helperText}>Ngày tạo đơn nhập hàng</Text>
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

          {/* Status Section */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trạng thái</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Trạng thái thanh toán</Text>
              <View style={styles.radioGroup}>
                {renderRadioButton(
                  "Chờ thanh toán",
                  "PENDING",
                  paymentStatus,
                  setPaymentStatus,
                )}
                {renderRadioButton(
                  "Đã thanh toán",
                  "COMPLETED",
                  paymentStatus,
                  setPaymentStatus,
                )}
                {renderRadioButton(
                  "Đã hủy",
                  "CANCELLED",
                  paymentStatus,
                  setPaymentStatus,
                )}
                {renderRadioButton(
                  "Thất bại",
                  "FAILED",
                  paymentStatus,
                  setPaymentStatus,
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Trạng thái đơn hàng</Text>
              <View style={styles.radioGroup}>
                {renderRadioButton(
                  "Nháp",
                  "DRAFT",
                  orderStatus,
                  setOrderStatus,
                )}
                {renderRadioButton(
                  "Đã duyệt",
                  "APPROVED",
                  orderStatus,
                  setOrderStatus,
                )}
                {renderRadioButton(
                  "Đã hủy",
                  "CANCELLED",
                  orderStatus,
                  setOrderStatus,
                )}
              </View>
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
                <MaterialCommunityIcons
                  name="plus"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.addButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>

            {products.map((product, index) => (
              <View key={index} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>
                    {product.name || product.id}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                    <MaterialCommunityIcons
                      name="delete"
                      size={20}
                      color={COLORS.error}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productDetail}>
                    SL: {product.quantity}
                  </Text>
                  <Text style={styles.productDetail}>
                    Đơn giá: {formatCurrency(product.unitPrice)}đ
                  </Text>
                  <Text style={styles.productDetail}>
                    Giảm: {product.discountAmount !== undefined 
                      ? formatCurrency(product.discountAmount) + 'đ'
                      : (product.discountRate * 100) + '%'
                    }
                  </Text>
                  <Text style={styles.productDetail}>
                    Thuế: {product.taxAmount !== undefined
                      ? formatCurrency(product.taxAmount) + 'đ'
                      : (product.taxRate * 100) + '%'
                    }
                  </Text>
                </View>
                <View style={styles.productFooter}>
                  <Text style={styles.productTotal}>
                    Thành tiền: {formatCurrency(product.finalPrice)}
                  </Text>
                </View>
                {product.note && (
                  <Text style={styles.productNote}>
                    Ghi chú: {product.note}
                  </Text>
                )}
              </View>
            ))}

            {products.length === 0 && (
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
                <MaterialCommunityIcons
                  name="upload"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.addButtonText}>Tải lên</Text>
              </TouchableOpacity>
            </View>

            {documents.map((doc, index) => (
              <View key={index} style={styles.documentCard}>
                <MaterialCommunityIcons
                  name="file-document"
                  size={20}
                  color={COLORS.gray600}
                />
                <Text style={styles.documentText}>Tài liệu {index + 1}</Text>
                <TouchableOpacity onPress={() => handleRemoveDocument(index)}>
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color={COLORS.error}
                  />
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
                        onChangeText={(text) =>
                          setCurrentProduct({
                            ...currentProduct,
                            quantity: parseInt(text) || 0,
                          })
                        }
                        placeholder="Số lượng"
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.gray400}
                      />
                      {contractDetail && currentProduct.id && (() => {
                        const contractItem = contractDetail.items?.find(
                          (item: any) => item.variant.id === currentProduct.id
                        );
                        return contractItem ? (
                          <Text style={styles.helperText}>
                            Số lượng tối đa: {contractItem.quantity} (theo hợp đồng)
                          </Text>
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
                        onChangeText={(text) =>
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
                      <Text style={styles.label}>Giảm giá {currentProduct.discountAmount !== undefined ? '(đ)' : '(%)'}</Text>
                      <TextInput
                        style={[styles.input, currentProduct.discountAmount !== undefined && styles.inputDisabled]}
                        value={currentProduct.discountAmount !== undefined
                          ? formatCurrency(currentProduct.discountAmount)
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
                          ? formatCurrency(currentProduct.taxAmount)
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
                        value={currentProduct.note}
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

          {/* Summary Section */}
          {products.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tổng kết</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(subTotal)} 
                </Text>
              </View>
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
            style={[
              styles.button,
              styles.submitButton,
              loading && styles.disabledButton,
            ]}
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

      {/* Success Dialog */}
      <DialogNotification
        visible={showSuccessDialog}
        type="success"
        title="Thành công!"
        message="Đơn nhập hàng đã được tạo thành công"
        actions={[
          {
            text: "OK",
            onPress: () => {
              setShowSuccessDialog(false);
              onClose();
              onSuccess();
            }
          }
        ]}
        onDismiss={() => {
          setShowSuccessDialog(false);
          onClose();
          onSuccess();
        }}
      />
    </Modal>
  );
}

// Chỉ cung cấp phần styles được redesign, code logic giữ nguyên

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },

  // Header - Redesigned
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    shadowColor: "#000",
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
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.gray800,
  },

  content: {
    flex: 1,
  },

  // Section - Redesigned
  section: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray800,
    marginBottom: 16,
  },

  // Add Button - Redesigned
  addButton: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
  },

  // Input Group - Redesigned
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.gray800,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  required: {
    color: COLORS.error,
  },

  // Input - Redesigned
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
    textAlignVertical: "top",
    paddingTop: 12,
  },

  // Picker - Redesigned
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  picker: {
    height: 52,
  },

  // Radio Group - Redesigned
  radioGroup: {
    gap: 10,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.gray400,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: "500",
    flex: 1,
  },

  // Product Card - Redesigned
  productCard: {
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.gray50,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.gray800,
    lineHeight: 20,
    marginRight: 8,
  },
  productDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "600",
  },
  productFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray400,
    paddingTop: 12,
    marginTop: 4,
  },
  productTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  productNote: {
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: "italic",
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gray400,
  },

  // Empty State - Redesigned
  emptyProducts: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderStyle: "dashed",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: "500",
  },

  // Document Card - Redesigned
  documentCard: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "500",
  },

  // Product Form Modal - Redesigned
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

  // Summary - Redesigned
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  totalRow: {
    backgroundColor: COLORS.primary + "10",
    borderWidth: 2,
    borderColor: COLORS.primary + "30",
    marginTop: 4,
    paddingVertical: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },

  // Footer - Redesigned
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gray400,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
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
    fontWeight: "700",
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
    fontStyle: "italic",
  },
  inputDisabled: {
    backgroundColor: COLORS.gray100,
    color: COLORS.gray600,
  },
});
