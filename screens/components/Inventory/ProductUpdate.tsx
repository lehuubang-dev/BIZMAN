import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import * as ImagePicker from "expo-image-picker";
import { productService } from "../../../services/productService";
import { COLORS } from "../../../constants/colors";
import Snackbar from "../common/Snackbar";

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

interface ImageItem {
  url: string;
  isPrimary: boolean;
}

const PRODUCT_UNITS = [
  { label: "Cái", value: "cái" },
  { label: "Chiếc", value: "chiếc" },
  { label: "Bộ", value: "bộ" },
  { label: "Kg", value: "kg" },
  { label: "Gam", value: "gam" },
  { label: "Lít", value: "lít" },
  { label: "Mét", value: "mét" },
  { label: "Thùng", value: "thùng" },
  { label: "Hộp", value: "hộp" },
];

export default function ProductUpdate({
  productId,
  onClose,
  onSuccess,
}: ProductUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [images, setImages] = useState<ImageItem[]>([]);

  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState({
    id: productId,
    productCategoryId: "",
    productGroupId: "",
    brandId: "",
    tags: [] as string[],
    name: "",
    description: "",
    type: "PHYSICAL",
    unit: "cái",
    model: "",
    partNumber: "",
    serialNumber: "",
    costPrice: 0,
    sellPrice: 0,
    minStock: 0,
  });

  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
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
        const existingImages =
          product.images?.map((img) => ({
            url: img.imageUrl,
            isPrimary: img.isPrimary,
          })) || [];
        setImages(existingImages);

        const existingTags = product.tags?.map((t: any) => t.name) || [];
        setFormData({
          id: product.id,
          productCategoryId: product.productCategory?.id || "",
          productGroupId: product.productGroup?.id || "",
          brandId: product.brand?.id || "",
          tags: existingTags,
          name: product.name || "",
          description: product.description || "",
          type: product.type || "PHYSICAL",
          unit: product.unit || "cái",
          model: (product as any).model || "",
          partNumber: (product as any).partNumber || "",
          serialNumber: (product as any).serialNumber || "",
          costPrice: product.costPrice || 0,
          sellPrice: product.sellPrice || 0,
          minStock: product.minStock || 0,
        });

        setTagsInput(existingTags.join(", "));
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Không thể tải dữ liệu");
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
      Alert.alert("Lỗi", error?.message || "Không thể chọn ảnh");
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploadingImage(true);
    try {
      const file = {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
      };

      const imageUrl = await productService.uploadImage(file);

      setImages((prev) => [
        ...prev,
        { url: imageUrl, isPrimary: prev.length === 0 },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể tải ảnh lên");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    setImages(newImages);
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    );
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên sản phẩm");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls = images.map((img) => img.url);

      const payload = {
        id: formData.id,
        ...(formData.productCategoryId && {
          productCategoryId: formData.productCategoryId,
        }),
        ...(formData.productGroupId && {
          productGroupId: formData.productGroupId,
        }),
        ...(formData.brandId && { brandId: formData.brandId }),
        tags: formData.tags,
        images: imageUrls,
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        unit: formData.unit,
        model: formData.model?.trim() || undefined,
        partNumber: formData.partNumber?.trim() || undefined,
        serialNumber: formData.serialNumber?.trim() || undefined,
        costPrice: Number(formData.costPrice),
        sellPrice: Number(formData.sellPrice),
        minStock: Number(formData.minStock),
      };

      await productService.updateProduct(payload);

      setSnackbar({
        visible: true,
        message: "Cập nhật thành công!",
        type: "success",
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      let errorMessage = "Không thể cập nhật sản phẩm";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        visible: true,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagsChange = (text: string) => {
    setTagsInput(text);
    const tags = text
      .split(",")
      .map((t: string) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View>
              <Text style={styles.title}>Cập nhật sản phẩm</Text>
              <Text style={styles.subtitle}>Chỉnh sửa thông tin sản phẩm</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
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
              <View style={styles.formContainer}>
                {/* Basic Info */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="information"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Tên sản phẩm <Text style={styles.asterisk}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={(text) =>
                        setFormData({ ...formData, name: text })
                      }
                      placeholder="Nhập tên sản phẩm"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mô tả</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={formData.description}
                      onChangeText={(text) =>
                        setFormData({ ...formData, description: text })
                      }
                      placeholder="Mô tả chi tiết về sản phẩm"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Loại sản phẩm</Text>
                    <RNPickerSelect
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                      items={[
                        { label: "Sản phẩm vật lý", value: "PHYSICAL" },
                        { label: "Sản phẩm số", value: "DIGITAL" },
                        { label: "Dịch vụ", value: "SERVICE" },
                      ]}
                      value={formData.type}
                      style={{
                        inputIOS: styles.picker,
                        inputAndroid: styles.picker,
                      }}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Đơn vị</Text>
                    <RNPickerSelect
                      onValueChange={(value) =>
                        setFormData({ ...formData, unit: value })
                      }
                      items={PRODUCT_UNITS}
                      value={formData.unit}
                      style={{
                        inputIOS: styles.picker,
                        inputAndroid: styles.picker,
                      }}
                    />
                  </View>
                </View>

                {/* Images */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="image-multiple"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.sectionTitle}>Hình ảnh</Text>
                  </View>

                  <View style={styles.imageGrid}>
                    {images.map((img, index) => (
                      <View key={index} style={styles.imageBox}>
                        <Image source={{ uri: img.url }} style={styles.image} />

                        {img.isPrimary && (
                          <View style={styles.primaryTag}>
                            <MaterialCommunityIcons
                              name="star"
                              size={10}
                              color="#FFF"
                            />
                          </View>
                        )}

                        <View style={styles.imageOverlay}>
                          {!img.isPrimary && (
                            <TouchableOpacity
                              style={styles.overlayBtn}
                              onPress={() => handleSetPrimaryImage(index)}
                            >
                              <MaterialCommunityIcons
                                name="star-outline"
                                size={14}
                                color="#FFF"
                              />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[styles.overlayBtn, styles.deleteOverlay]}
                            onPress={() => handleRemoveImage(index)}
                          >
                            <MaterialCommunityIcons
                              name="delete-outline"
                              size={14}
                              color="#FFF"
                            />
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
                          <MaterialCommunityIcons
                            name="camera-plus"
                            size={32}
                            color={COLORS.primary}
                          />
                          <Text style={styles.addImageText}>Thêm ảnh</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Classification */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="shape"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.sectionTitle}>Phân loại</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Danh mục</Text>
                    <RNPickerSelect
                      onValueChange={(value) =>
                        setFormData({ ...formData, productCategoryId: value })
                      }
                      items={categories.map((cat) => ({
                        label: cat.name,
                        value: cat.id,
                      }))}
                      value={formData.productCategoryId}
                      placeholder={{ label: "Chọn danh mục", value: null }}
                      style={{
                        inputIOS: styles.picker,
                        inputAndroid: styles.picker,
                        placeholder: { color: "#9CA3AF" },
                      }}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nhóm sản phẩm</Text>
                    <RNPickerSelect
                      onValueChange={(value) =>
                        setFormData({ ...formData, productGroupId: value })
                      }
                      items={groups.map((group) => ({
                        label: group.name,
                        value: group.id,
                      }))}
                      value={formData.productGroupId}
                      placeholder={{ label: "Chọn nhóm", value: null }}
                      style={{
                        inputIOS: styles.picker,
                        inputAndroid: styles.picker,
                        placeholder: { color: "#9CA3AF" },
                      }}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Thương hiệu</Text>
                    <RNPickerSelect
                      onValueChange={(value) =>
                        setFormData({ ...formData, brandId: value })
                      }
                      items={brands.map((brand) => ({
                        label: brand.name,
                        value: brand.id,
                      }))}
                      value={formData.brandId}
                      placeholder={{ label: "Chọn thương hiệu", value: null }}
                      style={{
                        inputIOS: styles.picker,
                        inputAndroid: styles.picker,
                        placeholder: { color: "#9CA3AF" },
                      }}
                    />
                  </View>
                </View>

                {/* Tags */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="tag-multiple"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.sectionTitle}>Tags</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Từ khóa (phân cách bằng dấu phẩy)
                    </Text>
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
                              const newTags = formData.tags.filter(
                                (_, i) => i !== index,
                              );
                              setFormData({ ...formData, tags: newTags });
                              setTagsInput(newTags.join(", "));
                            }}
                          >
                            <MaterialCommunityIcons
                              name="close-circle"
                              size={14}
                              color={COLORS.primary}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.submitText}>Đang cập nhật...</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color="#FFF"
                    />
                    <Text style={styles.submitText}>Cập nhật</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar((prev) => ({ ...prev, visible: false }))}
        duration={snackbar.type === "success" ? 1500 : 4000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "95%",
    minHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  // Input
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  asterisk: {
    color: "#EF4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    height: 90,
    paddingTop: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#E5E7EB",

    paddingHorizontal: 14,
    paddingVertical: 1,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },

  // Images
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageBox: {
    position: "relative",
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  primaryTag: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  imageOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    gap: 4,
  },
  overlayBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteOverlay: {
    backgroundColor: "#EF4444",
  },
  addImageBox: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    backgroundColor: "#F8FAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 4,
  },

  // Tags
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Footer
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FAFAFA",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },

  // Loading
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
});
