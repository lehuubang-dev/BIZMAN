import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { productService } from '../../../services/productService';
import { COLORS } from '../../../constants/colors';
import { CreateProductRequest } from '../../../types/product';
import Snackbar from '../common/Snackbar';

interface ProductCreateProps {
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

interface ImageItem {
  url: string;
  isPrimary: boolean;
}

interface VariantItem {
  sku: string;
  name: string;
  model?: string;
  partNumber?: string;
  attributes: Record<string, any>;
  unit: string;
  standardCost: number;
  documentIds?: string[];
}

const PRODUCT_UNITS = [
  { label: 'Cái', value: 'cái' },
  { label: 'Chiếc', value: 'chiếc' },
  { label: 'Bộ', value: 'bộ' },
  { label: 'Kg', value: 'kg' },
  { label: 'Gam', value: 'gam' },
  { label: 'Lít', value: 'lít' },
  { label: 'Mét', value: 'mét' },
  { label: 'Thùng', value: 'thùng' },
  { label: 'Hộp', value: 'hộp' },
];

export default function ProductCreate({ onClose, onSuccess }: ProductCreateProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [images, setImages] = useState<ImageItem[]>([]);
  const [variants, setVariants] = useState<VariantItem[]>([]);
  
  const [newAttributeKey, setNewAttributeKey] = useState<string[]>([]);
  const [newAttributeValue, setNewAttributeValue] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<CreateProductRequest>({
    productCategoryId: '',
    productGroupId: '',
    brandId: '',
    tags: [],
    images: [],
    name: '',
    description: '',
    type: 'PHYSICAL',
    variants: [],
  });

  const [tagsInput, setTagsInput] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    setLoading(true);
    try {
      const [cats, grps, brnds] = await Promise.all([
        productService.getProductCategories(),
        productService.getProductGroups(),
        productService.getBrands(),
      ]);
      setCategories(cats);
      setGroups(grps);
      setBrands(brnds);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể tải dữ liệu');
      setCategories([]);
      setGroups([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể chọn ảnh');
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploadingImage(true);
    try {
      const file = {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
      };
      
      const uploadedPath = await productService.uploadImage(file);
      
      const newImage: ImageItem = {
        url: uploadedPath,
        isPrimary: images.length === 0,
      };
      
      setImages(prev => [...prev, newImage]);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (prev[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  const addVariant = () => {
    const newVariant: VariantItem = {
      sku: '',
      name: '',
      model: '',
      partNumber: '',
      attributes: {},
      unit: 'cái',
      standardCost: 0,
      documentIds: [],
    };
    setVariants(prev => [...prev, newVariant]);
    setNewAttributeKey(prev => [...prev, '']);
    setNewAttributeValue(prev => [...prev, '']);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
    setNewAttributeKey(prev => prev.filter((_, i) => i !== index));
    setNewAttributeValue(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantItem, value: any) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const updateVariantAttribute = (variantIndex: number, key: string, value: string) => {
    setVariants(prev => prev.map((variant, i) => 
      i === variantIndex 
        ? { ...variant, attributes: { ...variant.attributes, [key]: value } }
        : variant
    ));
  };

  const removeVariantAttribute = (variantIndex: number, key: string) => {
    setVariants(prev => prev.map((variant, i) => {
      if (i === variantIndex) {
        const newAttributes = { ...variant.attributes };
        delete newAttributes[key];
        return { ...variant, attributes: newAttributes };
      }
      return variant;
    }));
  };

  const addNewAttributeToVariant = (index: number) => {
    const key = newAttributeKey[index]?.trim();
    const value = newAttributeValue[index]?.trim();
    
    if (key && value) {
      updateVariantAttribute(index, key, value);
      updateNewAttributeKey(index, '');
      updateNewAttributeValue(index, '');
    }
  };

  const updateNewAttributeKey = (index: number, value: string) => {
    setNewAttributeKey(prev => prev.map((item, i) => i === index ? value : item));
  };

  const updateNewAttributeValue = (index: number, value: string) => {
    setNewAttributeValue(prev => prev.map((item, i) => i === index ? value : item));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const imageUrls = images.map(img => img.url);

      const variantsPayload = variants.map(variant => ({
        sku: variant.sku.trim(),
        name: variant.name.trim(),
        model: variant.model?.trim() || undefined,
        partNumber: variant.partNumber?.trim() || undefined,
        attributes: variant.attributes || {},
        unit: variant.unit,
        standardCost: Number(variant.standardCost),
        documentIds: variant.documentIds || []
      }));

      const payload = {
        ...(formData.productCategoryId && { productCategoryId: formData.productCategoryId }),
        ...(formData.productGroupId && { productGroupId: formData.productGroupId }),
        ...(formData.brandId && { brandId: formData.brandId }),
        tags: formData.tags,
        images: imageUrls,
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        variants: variantsPayload,
      };

      const response = await productService.createProduct(payload);
      
      // Hiển thị thông báo thành công
      setSnackbar({
        visible: true,
        message: 'Sản phẩm đã được tạo thành công!',
        type: 'success'
      });
      
      // Đóng modal sau 1.5 giây và gọi onSuccess
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      let errorMessage = 'Không thể tạo sản phẩm';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        visible: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagsChange = (text: string) => {
    setTagsInput(text);
    const tags = text.split(',').map((t: string) => t.trim().replace(/^#/, '')).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả sản phẩm');
      return false;
    }
    if (!formData.type) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại sản phẩm');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (variants.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một biến thể sản phẩm');
      return false;
    }
    
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      if (!variant.sku.trim()) {
        Alert.alert('Lỗi', `Vui lòng nhập SKU cho biến thể ${i + 1}`);
        return false;
      }
      if (!variant.name.trim()) {
        Alert.alert('Lỗi', `Vui lòng nhập tên cho biến thể ${i + 1}`);
        return false;
      }
      if (!variant.unit.trim()) {
        Alert.alert('Lỗi', `Vui lòng chọn đơn vị cho biến thể ${i + 1}`);
        return false;
      }
      if (variant.standardCost <= 0) {
        Alert.alert('Lỗi', `Vui lòng nhập giá vốn hợp lệ cho biến thể ${i + 1}`);
        return false;
      }
    }
    
    return true;
  };
  
  const validateForm = () => {
    if (currentStep === 1) {
      return validateStep1();
    } else if (currentStep === 2) {
      return validateStep1() && validateStep2();
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons 
                name="package-variant-plus" 
                size={24} 
                color={COLORS.primary} 
              />
            </View>
            <View>
              <Text style={styles.title}>Tạo sản phẩm mới</Text>
              <Text style={styles.subtitle}>
                {currentStep === 1 ? 'Thông tin cơ bản' : 'Thiết lập biến thể'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>Bước {currentStep} / {totalSteps}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View 
              style={[styles.progressBar, { width: `${(currentStep / totalSteps) * 100}%` }]} 
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            <ScrollView 
              style={styles.content} 
              contentContainerStyle={styles.contentPadding}
              showsVerticalScrollIndicator={false}
            >
              {currentStep === 1 ? (
                <View style={styles.formContainer}>
                  {/* Basic Info */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
                      <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        Tên sản phẩm <Text style={styles.asterisk}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Nhập tên sản phẩm"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        Mô tả <Text style={styles.asterisk}>*</Text>
                      </Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        placeholder="Mô tả chi tiết về sản phẩm"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        Loại sản phẩm <Text style={styles.asterisk}>*</Text>
                      </Text>
                      <RNPickerSelect
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                        items={[
                          { label: 'Sản phẩm vật lý', value: 'PHYSICAL' },
                          { label: 'Sản phẩm số', value: 'DIGITAL' },
                          { label: 'Dịch vụ', value: 'SERVICE' },
                        ]}
                        value={formData.type}
                        placeholder={{ label: 'Chọn loại', value: null }}
                        style={{
                          inputIOS: styles.picker,
                          inputAndroid: styles.picker,
                          placeholder: { color: '#9CA3AF' }
                        }}
                      />
                    </View>
                  </View>

                  {/* Images */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="image-multiple" size={20} color={COLORS.primary} />
                      <Text style={styles.sectionTitle}>Hình ảnh</Text>
                    </View>

                    <View style={styles.imageGrid}>
                      {images.map((img, index) => (
                        <View key={index} style={styles.imageBox}>
                          <Image source={{ uri: img.url }} style={styles.image} />
                          
                          {img.isPrimary && (
                            <View style={styles.primaryTag}>
                              <MaterialCommunityIcons name="star" size={10} color="#FFF" />
                            </View>
                          )}
                          
                          <View style={styles.imageOverlay}>
                            {!img.isPrimary && (
                              <TouchableOpacity
                                style={styles.overlayBtn}
                                onPress={() => handleSetPrimaryImage(index)}
                              >
                                <MaterialCommunityIcons name="star-outline" size={14} color="#FFF" />
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              style={[styles.overlayBtn, styles.deleteOverlay]}
                              onPress={() => handleRemoveImage(index)}
                            >
                              <MaterialCommunityIcons name="delete-outline" size={14} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                      
                      <TouchableOpacity
                        style={styles.addImageBox}
                        onPress={handlePickImage}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <ActivityIndicator color={COLORS.primary} />
                        ) : (
                          <>
                            <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.primary} />
                            <Text style={styles.addImageText}>Thêm ảnh</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Classification */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="shape" size={20} color={COLORS.primary} />
                      <Text style={styles.sectionTitle}>Phân loại</Text>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Danh mục</Text>
                      <RNPickerSelect
                        onValueChange={(value) => setFormData({ ...formData, productCategoryId: value })}
                        items={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                        value={formData.productCategoryId}
                        placeholder={{ label: 'Chọn danh mục', value: null }}
                        style={{
                          inputIOS: styles.picker,
                          inputAndroid: styles.picker,
                          placeholder: { color: '#9CA3AF' }
                        }}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nhóm sản phẩm</Text>
                      <RNPickerSelect
                        onValueChange={(value) => setFormData({ ...formData, productGroupId: value })}
                        items={groups.map(group => ({ label: group.name, value: group.id }))}
                        value={formData.productGroupId}
                        placeholder={{ label: 'Chọn nhóm', value: null }}
                        style={{
                          inputIOS: styles.picker,
                          inputAndroid: styles.picker,
                          placeholder: { color: '#9CA3AF' }
                        }}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Thương hiệu</Text>
                      <RNPickerSelect
                        onValueChange={(value) => setFormData({ ...formData, brandId: value })}
                        items={brands.map(brand => ({ label: brand.name, value: brand.id }))}
                        value={formData.brandId}
                        placeholder={{ label: 'Chọn thương hiệu', value: null }}
                        style={{
                          inputIOS: styles.picker,
                          inputAndroid: styles.picker,
                          placeholder: { color: '#9CA3AF' }
                        }}
                      />
                    </View>
                  </View>

                  {/* Tags */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="tag-multiple" size={20} color={COLORS.primary} />
                      <Text style={styles.sectionTitle}>Tags</Text>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Từ khóa (phân cách bằng dấu phẩy)</Text>
                      <TextInput
                        style={styles.input}
                        value={tagsInput}
                        onChangeText={handleTagsChange}
                        placeholder="gaming, laptop, cao cấp"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>

                    {formData.tags.length > 0 && (
                      <View style={styles.tagsList}>
                        {formData.tags.map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagLabel}>#{tag}</Text>
                            <TouchableOpacity
                              onPress={() => {
                                const newTags = formData.tags.filter((_, i) => i !== index);
                                setFormData({ ...formData, tags: newTags });
                                setTagsInput(newTags.join(', '));
                              }}
                            >
                              <MaterialCommunityIcons name="close-circle" size={14} color={COLORS.primary} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                // Step 2: Variants
                <View style={styles.formContainer}>
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <MaterialCommunityIcons name="view-list" size={20} color={COLORS.primary} />
                      <Text style={styles.sectionTitle}>Biến thể sản phẩm</Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{variants.length}</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.addBtn} onPress={addVariant}>
                      <MaterialCommunityIcons name="plus-circle" size={20} color="#FFF" />
                      <Text style={styles.addBtnText}>Thêm biến thể</Text>
                    </TouchableOpacity>
                    
                    {variants.length === 0 ? (
                      <View style={styles.empty}>
                        <MaterialCommunityIcons name="package-variant" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>Chưa có biến thể</Text>
                        <Text style={styles.emptyDesc}>
                          Thêm các phiên bản khác nhau của sản phẩm
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.variantList}>
                        {variants.map((variant, index) => (
                          <View key={index} style={styles.variantBox}>
                            <View style={styles.variantHeader}>
                              <Text style={styles.variantNum}>#{index + 1}</Text>
                              <TouchableOpacity onPress={() => removeVariant(index)}>
                                <MaterialCommunityIcons name="delete" size={18} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                            
                            <View style={styles.row}>
                              <View style={styles.halfInput}>
                                <Text style={styles.smallLabel}>SKU *</Text>
                                <TextInput
                                  style={styles.smallInput}
                                  value={variant.sku}
                                  onChangeText={(text) => updateVariant(index, 'sku', text)}
                                  placeholder="SKU001"
                                  placeholderTextColor="#9CA3AF"
                                />
                              </View>
                              <View style={styles.halfInput}>
                                <Text style={styles.smallLabel}>Tên *</Text>
                                <TextInput
                                  style={styles.smallInput}
                                  value={variant.name}
                                  onChangeText={(text) => updateVariant(index, 'name', text)}
                                  placeholder="Tên biến thể"
                                  placeholderTextColor="#9CA3AF"
                                />
                              </View>
                            </View>
                            
                            <View style={styles.row}>
                              <View style={styles.halfInput}>
                                <Text style={styles.smallLabel}>Model</Text>
                                <TextInput
                                  style={styles.smallInput}
                                  value={variant.model || ''}
                                  onChangeText={(text) => updateVariant(index, 'model', text)}
                                  placeholder="Model"
                                  placeholderTextColor="#9CA3AF"
                                />
                              </View>
                              <View style={styles.halfInput}>
                                <Text style={styles.smallLabel}>Part Number</Text>
                                <TextInput
                                  style={styles.smallInput}
                                  value={variant.partNumber || ''}
                                  onChangeText={(text) => updateVariant(index, 'partNumber', text)}
                                  placeholder="Part #"
                                  placeholderTextColor="#9CA3AF"
                                />
                              </View>
                            </View>
                            
                            <View style={styles.row}>
                              <View style={styles.halfInput}>
                                <Text style={styles.smallLabel}>Đơn vị *</Text>
                                <RNPickerSelect
                                  onValueChange={(value) => updateVariant(index, 'unit', value)}
                                  items={PRODUCT_UNITS} 
                                  value={variant.unit}
                                  placeholder={{ label: 'Chọn', value: null }}
                                  style={{
                                    inputIOS: styles.unitPicker,
                                    inputAndroid: styles.unitPicker,
                                    placeholder: { color: '#9CA3AF'}
                                  }}
                                />
                              </View>
                              <View style={styles.halfInput}>
                                <Text style={styles.smallLabel}>Giá vốn (VND) *</Text>
                                <TextInput
                                  style={styles.smallInput}
                                  value={variant.standardCost ? variant.standardCost.toLocaleString('vi-VN') : ''}
                                  onChangeText={(text) => {
                                    const cost = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                                    updateVariant(index, 'standardCost', cost);
                                  }}
                                  placeholder="0"
                                  placeholderTextColor="#9CA3AF"
                                  keyboardType="numeric"
                                />
                              </View>
                            </View>
                            
                            <View style={styles.attrSection}>
                              <Text style={styles.smallLabel}>Thuộc tính sản phẩm</Text>
                              <Text style={styles.attrHint}>VD: Màu sắc = Đỏ, RAM = 16GB</Text>
                              
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <View key={key} style={styles.attrRow}>
                                  <View style={styles.attrInputContainer}>
                                    <Text style={styles.attrInputLabel}>Tên thuộc tính</Text>
                                    <TextInput
                                      style={styles.attrInput}
                                      value={key}
                                      onChangeText={(newKey) => {
                                        if (newKey !== key) {
                                          const newAttributes = { ...variant.attributes };
                                          delete newAttributes[key];
                                          if (newKey.trim()) {
                                            newAttributes[newKey] = value;
                                          }
                                          updateVariant(index, 'attributes', newAttributes);
                                        }
                                      }}
                                      placeholder="Màu sắc"
                                      placeholderTextColor="#9CA3AF"
                                    />
                                  </View>
                                  <View style={styles.equalContainer}>
                                    <Text style={styles.equal}>=</Text>
                                  </View>
                                  <View style={styles.attrInputContainer}>
                                    <Text style={styles.attrInputLabel}>Giá trị</Text>
                                    <TextInput
                                      style={styles.attrInput}
                                      value={String(value)}
                                      onChangeText={(newValue) => updateVariantAttribute(index, key, newValue)}
                                      placeholder="Đỏ"
                                      placeholderTextColor="#9CA3AF"
                                    />
                                  </View>
                                  <TouchableOpacity
                                    onPress={() => removeVariantAttribute(index, key)}
                                    style={styles.removeAttrBtn}
                                  >
                                    <MaterialCommunityIcons name="trash-can-outline" size={16} color="#EF4444" />
                                  </TouchableOpacity>
                                </View>
                              ))}
                              
                              <View style={styles.addAttrRow}>
                                <View style={styles.attrInputContainer}>
                                  <Text style={styles.attrInputLabel}>Thuộc tính mới</Text>
                                  <TextInput
                                    style={styles.attrInput}
                                    value={newAttributeKey[index] || ''}
                                    onChangeText={(text) => updateNewAttributeKey(index, text)}
                                    placeholder="VD: RAM"
                                    placeholderTextColor="#9CA3AF"
                                  />
                                </View>
                                <View style={styles.equalContainer}>
                                  <Text style={styles.equal}>=</Text>
                                </View>
                                <View style={styles.attrInputContainer}>
                                  <Text style={styles.attrInputLabel}>Giá trị</Text>
                                  <TextInput
                                    style={styles.attrInput}
                                    value={newAttributeValue[index] || ''}
                                    onChangeText={(text) => updateNewAttributeValue(index, text)}
                                    placeholder="VD: 16GB"
                                    placeholderTextColor="#9CA3AF"
                                  />
                                </View>
                                <TouchableOpacity
                                  onPress={() => addNewAttributeToVariant(index)}
                                  style={[
                                    styles.addAttrBtn,
                                    (!newAttributeKey[index]?.trim() || !newAttributeValue[index]?.trim()) && styles.disabledBtn
                                  ]}
                                  disabled={!newAttributeKey[index]?.trim() || !newAttributeValue[index]?.trim()}
                                >
                                  <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              {currentStep > 1 && (
                <TouchableOpacity style={styles.backBtn} onPress={handlePrevious}>
                  <MaterialCommunityIcons name="chevron-left" size={18} color={COLORS.primary} />
                  <Text style={styles.backText}>Quay lại</Text>
                </TouchableOpacity>
              )}
              
              <View style={{ flex: 1 }} />
              
              {currentStep < totalSteps ? (
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                  <Text style={styles.nextText}>Tiếp theo</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <ActivityIndicator size="small" color="#FFF" />
                      <Text style={styles.submitText}>Đang tạo...</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                      <Text style={styles.submitText}>Hoàn tất</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
      
      {/* Snackbar thông báo */}
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
        duration={snackbar.type === 'success' ? 1500 : 4000}
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
    minHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Progress
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
  },
  progressInfo: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },

  // Content
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
  },
  formContainer: {
    gap: 20,
  },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  // Input
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  asterisk: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 12,
    color: '#111827',
    backgroundColor: '#FAFAFA',
    minHeight: 36,
  },

  // Images
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageBox: {
    position: 'relative',
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  primaryTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 4,
  },
  overlayBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteOverlay: {
    backgroundColor: '#EF4444',
  },
  addImageBox: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: '#F8FAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },

  // Tags
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Variants
  badge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  variantList: {
    gap: 12,
  },
  variantBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  variantNum: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  halfInput: {
    flex: 1,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFF',
  },
  unitPicker: {
    color: '#111827',
    
  },
  attrSection: {
    marginTop: 8,
  },
  attrHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  attrRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addAttrRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
  },
  attrInputContainer: {
    flex: 1,
  },
  attrInputLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  attrInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#FFF',
    minHeight: 36,
  },
  equalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  equal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  removeAttrBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addAttrBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  disabledBtn: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  nextText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // Loading
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    width: "100%",
    textAlign: 'center',
  },
});