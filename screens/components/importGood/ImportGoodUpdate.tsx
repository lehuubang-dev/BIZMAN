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
import * as DocumentPicker from 'expo-document-picker';

interface ImportGoodUpdateProps {
  visible: boolean;
  orderId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
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
  error: '#EF4444',
};

export default function ImportGoodUpdate({ visible, orderId, onClose, onUpdated }: ImportGoodUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [form, setForm] = useState<any>(null);

  // Options for dropdowns
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

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
      const [suppliersData, warehousesData] = await Promise.all([
        purchaseOrderService.getSuppliers(),
        purchaseOrderService.getWarehouses(),
      ]);
      setSuppliers(suppliersData);
      setWarehouses(warehousesData);
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
    } catch (err: any) {
      Alert.alert('Lỗi', err && err.message ? err.message : 'Không thể tải đơn hàng');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
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

    setSaving(true);
    try {
      const payload: any = {
        id: form.id,
        supplier: form.supplier?.id || form.supplier,
        warehouse: form.warehouse?.id || form.warehouse,
        contract: form.contract?.id || form.contract || '',
        products: (form.products || []).map((p: any) => ({
          id: p.id,
          quantity: p.quantity,
          note: p.note,
          expiredDate: p.expiredDate,
          taxPercent: p.taxPercent,
          discountPercent: p.discountPercent,
          unitPrice: p.unitPrice,
          totalPrice: p.totalPrice,
          finalPrice: p.finalPrice,
          purchaseValue: p.purchaseValue,
        })),
        documents: (form.documents || []).map((d: any) => d.id || d),
        orderNumber: form.orderNumber,
        description: form.description,
        note: form.note,
        orderDate: form.orderDate,
        subTotal: form.subTotal || 0,
        taxAmount: form.taxAmount || 0,
        totalAmount: form.totalAmount || 0,
      };

      await purchaseOrderService.updatePurchaseOrder(payload);
      Alert.alert('Thành công', 'Đã cập nhật đơn nhập hàng');
      onUpdated && onUpdated();
      onClose();
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
                <Text style={styles.label}>Nhà cung cấp</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.supplier?.id || form.supplier || ''}
                    onValueChange={(value) => handleChange('supplier', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="-- Chọn nhà cung cấp --" value="" />
                    {suppliers.map((s) => (
                      <Picker.Item key={s.id} label={s.name} value={s.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kho hàng</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.warehouse?.id || form.warehouse || ''}
                    onValueChange={(value) => handleChange('warehouse', value)}
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
              </View>

              {(form.products || []).map((product: any, index: number) => (
                <View key={index} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productName}>{product.name || product.id}</Text>
                    <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                      <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.productDetails}>
                    <Text style={styles.productDetail}>SL: {product.quantity}</Text>
                    <Text style={styles.productDetail}>
                      Đơn giá: {formatCurrency(product.unitPrice)}đ
                    </Text>
                    <Text style={styles.productDetail}>
                      Giảm: {product.discountPercent ? (product.discountPercent * 100) + '%' : '-'}
                    </Text>
                    <Text style={styles.productDetail}>
                      Thuế: {product.taxPercent ? (product.taxPercent * 100) + '%' : '-'}
                    </Text>
                  </View>
                  <View style={styles.productFooter}>
                    <Text style={styles.productTotal}>
                      Thành tiền: {formatCurrency(product.finalPrice)} đ
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
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tạm tính:</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(form.subTotal || 0)} đ
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Thuế:</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(form.taxAmount || 0)} đ
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Tổng cộng:</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(form.totalAmount || 0)} đ
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="database-off-outline" size={48} color={COLORS.gray400} />
            <Text style={styles.emptyText}>Không có dữ liệu</Text>
          </View>
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
});