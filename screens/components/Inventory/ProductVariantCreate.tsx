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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productService } from '../../../services/productService';
import { CreateProductVariantStandaloneRequest } from '../../../types/product';
import { COLORS } from '../../../constants/colors';

interface ProductVariantCreateProps {
  productId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProductVariantCreate({ 
  productId, 
  onClose, 
  onSuccess 
}: ProductVariantCreateProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateProductVariantStandaloneRequest>({
    productId,
    sku: '',
    name: '',
    model: '',
    partNumber: '',
    attributes: {},
    unit: 'cái',
    standardCost: 0,
    documentIds: [],
  });

  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');

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
      Alert.alert('Lỗi', 'Vui lòng điền tên và SKU cho biến thể');
      return;
    }

    if (formData.standardCost <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá chuẩn hợp lệ');
      return;
    }

    setSubmitting(true);
    try {
      const response = await productService.createProductVariant(formData);
      
      if (response?.data) {
        Alert.alert('Thành công', 'Tạo biến thể sản phẩm thành công', [
          { text: 'OK', onPress: () => {
            onSuccess?.();
            onClose();
          }}
        ]);
      } else {
        throw new Error('Không có dữ liệu phản hồi');
      }
    } catch (err: any) {
      console.error('Create variant error:', err);
      Alert.alert('Lỗi', err?.message || 'Không thể tạo biến thể sản phẩm');
    } finally {
      setSubmitting(false);
    }
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
          <Text style={styles.title}>Tạo biến thể sản phẩm</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            
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
              <Text style={styles.submitText}>Tạo biến thể</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
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
    backgroundColor: COLORS.primary,
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
});