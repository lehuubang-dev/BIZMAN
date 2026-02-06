import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productService } from '../../../services/productService';
import { ProductVariant, UpdateProductVariantRequest, Product } from '../../../types/product';
import { COLORS } from '../../../constants/colors';
import DialogNotification from '../common/DialogNotification';

interface ProductVariantUpdateProps {
  variant: ProductVariant;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProductVariantUpdate({ 
  variant, 
  onClose, 
  onSuccess 
}: ProductVariantUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  // Product selection
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Document upload
  const [uploadedDocuments, setUploadedDocuments] = useState<{id: string, name: string, url: string}[]>([]);
  
  // Dialog notification
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<'success' | 'error'>('success');
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  const [formData, setFormData] = useState<UpdateProductVariantRequest>({
    id: variant.id,
    sku: variant.sku,
    name: variant.name,
    model: variant.model || '',
    partNumber: variant.partNumber || '',
    attributes: variant.attributes || {},
    unit: variant.unit,
    standardCost: variant.standardCost,
    documentIds: variant.documents?.map(d => d.id) || [],
  });

  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');

  // Load products and documents on mount
  useEffect(() => {
    loadProducts();
    loadExistingDocuments();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsList = await productService.getProducts();
      setProducts(productsList);
      
      // Set selected product from variant
      if (variant.product) {
        setSelectedProduct(variant.product);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showDialog('error', 'Lỗi', 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingDocuments = () => {
    if (variant.documents && variant.documents.length > 0) {
      const docs = variant.documents.map(doc => ({
        id: doc.id,
        name: doc.fileName || `Document_${doc.id}`,
        url: doc.filePath || ''
      }));
      setUploadedDocuments(docs);
    }
  };

  const showDialog = (type: 'success' | 'error', title: string, message: string) => {
    setDialogType(type);
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData(prev => ({ ...prev, productId: product.id }));
    setShowProductPicker(false);
  };

  const handleUploadDocument = async () => {
    try {
      setUploadingDocument(true);
      
      // Import DocumentPicker from Expo
      const DocumentPicker = require('expo-document-picker');
      
      // Chọn tài liệu từ máy
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/*',
          'text/plain',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      
      if (pickerResult.canceled) {
        console.log('🚪 User cancelled document picker');
        return;
      }
      
      const selectedFile = pickerResult.assets[0];
      
      // Tạo file object cho API
      const fileForUpload = {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/pdf',
        name: selectedFile.name,
        size: selectedFile.size,
      };
      
      console.log('📎 Starting document upload...', selectedFile.name);
      const uploadedDoc = await productService.uploadDocument(fileForUpload);
      
      const newDocument = {
        id: uploadedDoc.id,
        name: uploadedDoc.fileName,
        url: uploadedDoc.filePath
      };
      
      const newDocuments = [...uploadedDocuments, newDocument];
      setUploadedDocuments(newDocuments);
      setFormData(prev => ({ ...prev, documentIds: newDocuments.map(d => d.id) }));
      
      console.log('✅ Document uploaded successfully:', newDocument);
      showDialog('success', 'Thành công', `Tài liệu "${uploadedDoc.fileName}" đã được tải lên thành công`);
      
      // Tự động đóng thông báo sau 2 giây
      setTimeout(() => {
        setDialogVisible(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Document upload failed:', error);
      showDialog('error', 'Lỗi', error?.message || 'Không thể tải lên tài liệu. Vui lòng thử lại.');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    const newDocuments = uploadedDocuments.filter(d => d.id !== documentId);
    setUploadedDocuments(newDocuments);
    setFormData(prev => ({ ...prev, documentIds: newDocuments.map(d => d.id) }));
  };

  const handleAddAttribute = () => {
    if (attributeKey.trim() && attributeValue.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeKey.trim()]: attributeValue.trim(),
        },
      }));
      setAttributeKey('');
      setAttributeValue('');
    }
  };

  const handleRemoveAttribute = (key: string) => {
    setFormData(prev => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[key];
      return { ...prev, attributes: newAttributes };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.sku.trim()) {
      showDialog('error', 'Lỗi', 'Vui lòng điền tên và SKU cho biến thể');
      return;
    }

    if (formData.standardCost <= 0) {
      showDialog('error', 'Lỗi', 'Vui lòng nhập giá chuẩn hợp lệ');
      return;
    }

    setSubmitting(true);
    try {
      const response = await productService.updateProductVariant(formData);
      
      if (response?.data || response) {
        // Hiển thị thông báo thành công tự động đóng
        showDialog('success', 'Thành công', 'Cập nhật biến thể sản phẩm thành công');
        
        // Tự động đóng modal và refresh danh sách sau 1.5 giây
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        throw new Error('Không có dữ liệu phản hồi');
      }
    } catch (err: any) {
      console.error('Update variant error:', err);
      showDialog('error', 'Lỗi', err?.message || 'Không thể cập nhật biến thể sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setDialogVisible(false);
    // Chỉ đóng dialog, success sẽ tự động xử lý
  };

  const handleCostChange = (text: string) => {
    const numericValue = parseFloat(text.replace(/[^0-9]/g, ''));
    setFormData(prev => ({ ...prev, standardCost: isNaN(numericValue) ? 0 : numericValue }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
          </TouchableOpacity>
          <Text style={styles.title}>Cập nhật biến thể</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            
            {/* Product Selection */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Sản phẩm <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity 
                style={[styles.input, styles.productSelector]}
                onPress={() => setShowProductPicker(true)}
              >
                {selectedProduct ? (
                  <View style={styles.productSelected}>
                    <MaterialCommunityIcons name="package-variant-closed" size={20} color={COLORS.primary} />
                    <Text style={styles.productSelectedText}>{selectedProduct.name}</Text>
                  </View>
                ) : (
                  <View style={styles.productPlaceholder}>
                    <MaterialCommunityIcons name="plus" size={20} color={COLORS.gray400} />
                    <Text style={styles.placeholderText}>Chọn sản phẩm</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.field}>
              <Text style={styles.label}>
                Tên biến thể <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Nhập tên biến thể"
                placeholderTextColor={COLORS.gray500}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                SKU <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.sku}
                onChangeText={(text) => setFormData(prev => ({ ...prev, sku: text }))}
                placeholder="Nhập mã SKU duy nhất"
                placeholderTextColor={COLORS.gray500}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  style={styles.input}
                  value={formData.model}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, model: text }))}
                  placeholder="Nhập model"
                  placeholderTextColor={COLORS.gray500}
                />
              </View>
              
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Part Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.partNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, partNumber: text }))}
                  placeholder="Nhập part number"
                  placeholderTextColor={COLORS.gray500}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Đơn vị</Text>
                <TextInput
                  style={styles.input}
                  value={formData.unit}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, unit: text }))}
                  placeholder="Nhập đơn vị"
                  placeholderTextColor={COLORS.gray500}
                />
              </View>
              
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>
                  Giá chuẩn (VNĐ) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.standardCost > 0 ? formatCurrency(formData.standardCost) : ''}
                  onChangeText={handleCostChange}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.gray500}
                />
              </View>
            </View>
          </View>

          {/* Documents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài liệu đính kèm</Text>
            
            {/* Upload Button */}
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleUploadDocument}
              disabled={uploadingDocument}
            >
              {uploadingDocument ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <MaterialCommunityIcons name="cloud-upload" size={20} color={COLORS.primary} />
              )}
              <Text style={styles.uploadButtonText}>
                {uploadingDocument ? 'Đang tải lên...' : 'Tải lên tài liệu'}
              </Text>
            </TouchableOpacity>

            {/* Document List */}
            {uploadedDocuments.length > 0 && (
              <View style={styles.documentsList}>
                {uploadedDocuments.map((doc) => (
                  <View key={doc.id} style={styles.documentItem}>
                    <View style={styles.documentInfo}>
                      <MaterialCommunityIcons name="file-document" size={20} color={COLORS.primary} />
                      <Text style={styles.documentName}>{doc.name}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeDocumentBtn}
                      onPress={() => handleRemoveDocument(doc.id)}
                    >
                      <MaterialCommunityIcons name="close" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {uploadedDocuments.length === 0 && (
              <Text style={styles.emptyDocumentsText}>
                Chưa có tài liệu nào. Tải lên tài liệu liên quan đến biến thể.
              </Text>
            )}
          </View>

          {/* Attributes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thuộc tính</Text>
            
            {/* Add new attribute */}
            <View style={styles.attributeInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={attributeKey}
                onChangeText={setAttributeKey}
                placeholder="Tên thuộc tính"
                placeholderTextColor={COLORS.gray500}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginHorizontal: 4 }]}
                value={attributeValue}
                onChangeText={setAttributeValue}
                placeholder="Giá trị"
                placeholderTextColor={COLORS.gray500}
              />
              <TouchableOpacity
                style={styles.addAttributeBtn}
                onPress={handleAddAttribute}
              >
                <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Current attributes */}
            <View style={styles.attributesList}>
              {Object.entries(formData.attributes || {}).map(([key, value]) => (
                <View key={key} style={styles.attributeItem}>
                  <View style={styles.attributeInfo}>
                    <Text style={styles.attributeName}>{key}</Text>
                    <Text style={styles.attributeValue}>{value}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeAttributeBtn}
                    onPress={() => handleRemoveAttribute(key)}
                  >
                    <MaterialCommunityIcons name="close" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {Object.keys(formData.attributes || {}).length === 0 && (
              <Text style={styles.emptyAttributesText}>
                Chưa có thuộc tính nào. Thêm thuộc tính để phân biệt biến thể.
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.submitText}>Cập nhật biến thể</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Product Picker Modal */}
      {showProductPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn sản phẩm</Text>
              <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>Đang tải danh sách sản phẩm...</Text>
              </View>
            ) : (
              <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.productItem,
                      selectedProduct?.id === item.id && styles.productItemSelected
                    ]}
                    onPress={() => handleSelectProduct(item)}
                  >
                    <MaterialCommunityIcons 
                      name="package-variant-closed" 
                      size={20} 
                      color={COLORS.primary} 
                    />
                    <View style={styles.productItemInfo}>
                      <Text style={styles.productItemName}>{item.name}</Text>
                      <Text style={styles.productItemCode}>{item.code || item.id}</Text>
                    </View>
                    {selectedProduct?.id === item.id && (
                      <MaterialCommunityIcons name="check" size={20} color={COLORS.success} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.productList}
              />
            )}
          </View>
        </View>
      )}
      
      {/* Dialog Notification */}
      <DialogNotification
        visible={dialogVisible}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        actions={dialogType === 'error' ? [
          {
            text: 'OK',
            onPress: handleDialogClose,
            style: 'default',
          },
        ] : []} // Không hiển thị nút OK khi thành công
        onDismiss={dialogType === 'error' ? handleDialogClose : undefined} // Không cho phép đóng bằng tap outside khi thành công
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 200,
  },
  container: {
    width: '100%',
    maxHeight: '95%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray800,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  required: {
    color: '#DC2626',
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray800,
    backgroundColor: COLORS.white,
  },
  row: {
    flexDirection: 'row',
  },
  attributeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addAttributeBtn: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  attributesList: {
    gap: 8,
  },
  attributeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  attributeInfo: {
    flex: 1,
  },
  attributeName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  attributeValue: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  removeAttributeBtn: {
    padding: 4,
  },
  emptyAttributesText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  submitBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  // Product Selector
  productSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  productSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productSelectedText: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '600',
  },
  productPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.gray400,
  },
  // Document Upload
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: COLORS.primary + '10',
  },
  uploadButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  documentsList: {
    gap: 8,
    marginTop: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '500',
  },
  removeDocumentBtn: {
    padding: 4,
  },
  emptyDocumentsText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  modalLoading: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  productList: {
    maxHeight: 400,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  productItemSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  productItemInfo: {
    flex: 1,
  },
  productItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  productItemCode: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
});