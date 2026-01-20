import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { productService } from '../../../services/productService';
import { COLORS } from './constants';

interface ProductUpdateProps {
  productId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Category {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function ProductUpdate({ productId, onClose, onSuccess }: ProductUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dropdowns data
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Form fields
  const [formData, setFormData] = useState({
    id: productId,
    productCategoryId: '',
    productGroupId: '',
    brandId: '',
    tags: '',
    images: '',
    sku: '',
    productCode: '',
    name: '',
    description: '',
    type: 'PHYSICAL',
    unit: 'cái',
    model: '',
    partNumber: '',
    serialNumber: '',
    costPrice: '',
    sellPrice: '',
    minStock: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load product details and dropdown data in parallel
      const [product, cats, grps, brnds] = await Promise.all([
        productService.getProductDetail(productId),
        productService.getProductCategories(),
        productService.getProductGroups(),
        productService.getBrands(),
      ]);

      setCategories(cats);
      setGroups(grps);
      setBrands(brnds);

      if (product) {
        // Populate form with existing product data
        setFormData({
          id: product.id,
          productCategoryId: product.productCategory?.id || '',
          productGroupId: product.productGroup?.id || '',
          brandId: product.brand?.id || '',
          tags: product.tags?.map(t => '#' + t.name).join(', ') || '',
          images: product.images?.map(img => img.imageUrl).join(', ') || '',
          sku: product.sku || '',
          productCode: product.productCode || '',
          name: product.name || '',
          description: product.description || '',
          type: product.type || 'PHYSICAL',
          unit: product.unit || 'cái',
          model: (product as any).model || '',
          partNumber: (product as any).partNumber || '',
          serialNumber: (product as any).serialNumber || '',
          costPrice: product.costPrice?.toString() || '',
          sellPrice: product.sellPrice?.toString() || '',
          minStock: product.minStock?.toString() || '',
        });
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.sku || !formData.productCode) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      // Remove # from tags before sending
      const cleanTags = formData.tags 
        ? formData.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) 
        : [];

      // Parse images from comma-separated URLs
      const imageUrls = formData.images
        ? formData.images.split(',').map(url => url.trim()).filter(Boolean)
        : [];

      const payload = {
        id: formData.id,
        productCategoryId: formData.productCategoryId || undefined,
        productGroupId: formData.productGroupId || undefined,
        brandId: formData.brandId || undefined,
        tags: cleanTags,
        images: imageUrls,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        unit: formData.unit,
        model: formData.model || undefined,
        partNumber: formData.partNumber || undefined,
        serialNumber: formData.serialNumber || undefined,
        costPrice: parseFloat(formData.costPrice) || 0,
        sellPrice: parseFloat(formData.sellPrice) || 0,
        minStock: parseInt(formData.minStock) || 0,
      };

      await productService.updateProduct(payload);
      
      // Refresh list and close modal
      onSuccess?.();
      onClose();
      
      // Show success message
      Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagsChange = (text: string) => {
    // Format tags with # prefix
    const formatted = text
      .split(',')
      .map(tag => {
        const trimmed = tag.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          return '#' + trimmed;
        }
        return trimmed;
      })
      .join(', ');
    setFormData({ ...formData, tags: formatted });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={22} color={COLORS.gray800} />
          </TouchableOpacity>
          <Text style={styles.title}>Cập nhật hàng hóa</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Tên sản phẩm <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nhập tên sản phẩm"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            {/* Images */}
            <View style={styles.field}>
              <Text style={styles.label}>Hình ảnh (URL, cách nhau bằng dấu phẩy)</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                value={formData.images}
                onChangeText={(text) => setFormData({ ...formData, images: text })}
                placeholder="/uploads/image1.png, http://example.com/image2.png"
                placeholderTextColor={COLORS.gray400}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* SKU & Product Code */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>SKU <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.sku}
                  onChangeText={(text) => setFormData({ ...formData, sku: text })}
                  placeholder="SKU"
                  placeholderTextColor={COLORS.gray400}
                  editable={false}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Mã SP <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={formData.productCode}
                  onChangeText={(text) => setFormData({ ...formData, productCode: text })}
                  placeholder="Mã sản phẩm"
                  placeholderTextColor={COLORS.gray400}
                  editable={false}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Mô tả sản phẩm"
                placeholderTextColor={COLORS.gray400}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Category, Group, Brand */}
            <View style={styles.field}>
              <Text style={styles.label}>Danh mục</Text>
              <RNPickerSelect
                onValueChange={(value) => setFormData({ ...formData, productCategoryId: value })}
                items={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                value={formData.productCategoryId}
                placeholder={{ label: 'Chọn danh mục...', value: null }}
                style={{
                  inputIOS: styles.pickerInput,
                  inputAndroid: styles.pickerInput,
                  placeholder: { color: '#999' },
                }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nhóm hàng</Text>
              <RNPickerSelect
                onValueChange={(value) => setFormData({ ...formData, productGroupId: value })}
                items={groups.map(grp => ({ label: grp.name, value: grp.id }))}
                value={formData.productGroupId}
                placeholder={{ label: 'Chọn nhóm hàng...', value: null }}
                style={{
                  inputIOS: styles.pickerInput,
                  inputAndroid: styles.pickerInput,
                  placeholder: { color: '#999' },
                }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Thương hiệu</Text>
              <RNPickerSelect
                onValueChange={(value) => setFormData({ ...formData, brandId: value })}
                items={brands.map(brd => ({ label: brd.name, value: brd.id }))}
                value={formData.brandId}
                placeholder={{ label: 'Chọn thương hiệu...', value: null }}
                style={{
                  inputIOS: styles.pickerInput,
                  inputAndroid: styles.pickerInput,
                  placeholder: { color: '#999' },
                }}
              />
            </View>

            {/* Type & Unit */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Loại</Text>
                <TextInput
                  style={styles.input}
                  value={formData.type}
                  onChangeText={(text) => setFormData({ ...formData, type: text })}
                  placeholder="PHYSICAL"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Đơn vị</Text>
                <TextInput
                  style={styles.input}
                  value={formData.unit}
                  onChangeText={(text) => setFormData({ ...formData, unit: text })}
                  placeholder="cái"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>

            {/* Model & Part Number */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  style={styles.input}
                  value={formData.model}
                  onChangeText={(text) => setFormData({ ...formData, model: text })}
                  placeholder="I5-12900K"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Part Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.partNumber}
                  onChangeText={(text) => setFormData({ ...formData, partNumber: text })}
                  placeholder="I5-12900K-90C120T"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>

            {/* Serial Number */}
            <View style={styles.field}>
              <Text style={styles.label}>Serial Number</Text>
              <TextInput
                style={styles.input}
                value={formData.serialNumber}
                onChangeText={(text) => setFormData({ ...formData, serialNumber: text })}
                placeholder="SN-547785524"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            {/* Prices */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Giá vốn</Text>
                <TextInput
                  style={styles.input}
                  value={formData.costPrice}
                  onChangeText={(text) => setFormData({ ...formData, costPrice: text })}
                  placeholder="0"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Giá bán</Text>
                <TextInput
                  style={styles.input}
                  value={formData.sellPrice}
                  onChangeText={(text) => setFormData({ ...formData, sellPrice: text })}
                  placeholder="0"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Min Stock */}
            <View style={styles.field}>
              <Text style={styles.label}>Tồn tối thiểu</Text>
              <TextInput
                style={styles.input}
                value={formData.minStock}
                onChangeText={(text) => setFormData({ ...formData, minStock: text })}
                placeholder="0"
                placeholderTextColor={COLORS.gray400}
                keyboardType="numeric"
              />
            </View>

            {/* Tags */}
            <View style={styles.field}>
              <Text style={styles.label}>Tags (cách nhau bằng dấu phẩy)</Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={handleTagsChange}
                placeholder="#tag1, #tag2, #tag3"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.submitText}>Cập nhật</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  container: {
    width: '94%',
    maxHeight: '92%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  closeBtn: {
    padding: 6,
    marginRight: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.gray800,
  },
  center: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
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
  pickerInput: {
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray800,
    backgroundColor: COLORS.white,
  },
  submitBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
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
