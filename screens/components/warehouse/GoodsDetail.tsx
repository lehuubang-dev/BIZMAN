import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WarehouseStockItem } from "../../../types/warehouse";
import { warehouseService } from "../../../services/warehouseService";

const { width } = Dimensions.get("window");

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
  warning: "#F59E0B",
  error: "#EF4444",
  purple: "#8B5CF6",
  indigo: "#6366F1",
};

interface GoodsDetailProps {
  visible: boolean;
  batchId: string | null;
  warehouseId: string | null;
  onClose: () => void;
}

export default function GoodsDetail({
  visible,
  batchId,
  warehouseId,
  onClose,
}: GoodsDetailProps) {
  const [product, setProduct] = useState<WarehouseStockItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (visible && batchId && warehouseId) {
      loadProductDetail();
    }
  }, [visible, batchId, warehouseId]);

  const loadProductDetail = async () => {
    if (!batchId || !warehouseId) return;

    setLoading(true);
    try {
      const data = await warehouseService.getProductWarehouseById(
        batchId,
        warehouseId,
      );
      setProduct(data);
      setSelectedImageIndex(0);
    } catch (error) {
      console.error("Error loading product detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!product && !loading) return null;

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString("vi-VN");
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      SERVICE: "Dịch vụ",
      PRODUCT: "Sản phẩm",
      MATERIAL: "Nguyên liệu",
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SERVICE: COLORS.primary,
      PRODUCT: COLORS.success,
      MATERIAL: COLORS.warning,
    };
    return colors[type] || COLORS.gray600;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chi tiết hàng hóa</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.gray600}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : product ? (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Image Gallery */}
              {product.productBatch.productVariant.product.images && product.productBatch.productVariant.product.images.length > 0 && (
                <View style={styles.imageSection}>
                  <Image
                    source={{
                      uri: `http://192.168.1.2:8080${product.productBatch.productVariant.product.images[selectedImageIndex].imageUrl}`,
                    }}
                    style={styles.mainImage}
                    resizeMode="cover"
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.thumbnailContainer}
                    contentContainerStyle={styles.thumbnailContent}
                  >
                    {product.productBatch.productVariant.product.images.map((img, index) => (
                      <TouchableOpacity
                        key={img.id}
                        onPress={() => setSelectedImageIndex(index)}
                        style={[
                          styles.thumbnail,
                          selectedImageIndex === index &&
                            styles.thumbnailSelected,
                        ]}
                      >
                        <Image
                          source={{
                            uri: `http://192.168.1.2:8080${img.imageUrl}`,
                          }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Product Name & Type */}
              <View style={styles.titleCard}>
                <Text style={styles.productName}>{product.productBatch.productVariant.name}</Text>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getTypeColor(product.productBatch.productVariant.product.type) + "15" },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: getTypeColor(product.productBatch.productVariant.product.type) },
                    ]}
                  >
                    {getTypeLabel(product.productBatch.productVariant.product.type)}
                  </Text>
                </View>
              </View>

              {/* Price Section */}
              <View style={styles.priceContainer}>
                <View style={styles.priceRow}>
                  <View style={styles.priceCard}>
                    <View style={styles.priceHeader}>
                      <View
                        style={[
                          styles.priceDot,
                          { backgroundColor: COLORS.primary },
                        ]}
                      />
                      <Text style={styles.priceTitle}>Giá vốn</Text>
                    </View>
                    <Text style={styles.priceAmount}>
                      {formatCurrency(product.productBatch.costPrice)}
                    </Text>
                    <View style={styles.priceFooter}>
                      <MaterialCommunityIcons
                        name="trending-down"
                        size={12}
                        color={COLORS.gray400}
                      />
                      <Text style={styles.priceNote}>Chi phí</Text>
                    </View>
                  </View>

                  <View style={styles.arrowContainer}>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color={COLORS.gray400}
                    />
                  </View>

                  {(() => {
                    const costPrice = product.productBatch.costPrice;
                    const profitMargin = product.productBatch.productVariant.product.productCategory.profitMargin;
                    const sellPrice = costPrice * (1 + profitMargin / 100);
                    const profit = sellPrice - costPrice;
                    const profitPercent = ((profit / costPrice) * 100).toFixed(1);

                    return (
                      <>
                        <View style={[styles.priceCard, styles.priceCardHighlight]}>
                          <View style={styles.priceHeader}>
                            <View
                              style={[
                                styles.priceDot,
                                { backgroundColor: COLORS.error },
                              ]}
                            />
                            <Text style={styles.priceTitle}>Giá bán</Text>
                          </View>
                          <Text
                            style={[styles.priceAmount, styles.priceAmountHighlight]}
                          >
                            {formatCurrency(sellPrice)}
                          </Text>
                          <View style={styles.priceFooter}>
                            <MaterialCommunityIcons
                              name="trending-up"
                              size={12}
                              color={COLORS.success}
                            />
                            <Text
                              style={[styles.priceNote, { color: COLORS.success }]}
                            >
                              +{formatCurrency(profit)}
                            </Text>
                          </View>
                        </View>
                      </>
                    );
                  })()}
                </View>

                {(() => {
                  const costPrice = product.productBatch.costPrice;
                  const profitMargin = product.productBatch.productVariant.product.productCategory.profitMargin;
                  
                  return (
                    <View style={styles.profitBanner}>
                      <View style={styles.profitContent}>
                        <MaterialCommunityIcons
                          name="chart-line"
                          size={16}
                          color={COLORS.success}
                        />
                        <Text style={styles.profitLabel}>Tỷ suất lợi nhuận</Text>
                      </View>
                      <Text style={styles.profitValue}>
                        {profitMargin}%
                      </Text>
                    </View>
                  );
                })()}
              </View>

              {/* Stock Info */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.cardTitle}>Thông tin kho</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoGridItem}>
                      <MaterialCommunityIcons
                        name="archive"
                        size={16}
                        color={COLORS.gray600}
                      />
                      <Text style={styles.infoGridLabel}>Số lượng</Text>
                      <Text style={styles.infoGridValue}>
                        {product.warehouseStock.quantityOnHand} {product.productBatch.productVariant.unit}
                      </Text>
                    </View>
                    <View style={styles.infoGridItem}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={16}
                        color={COLORS.success}
                      />
                      <Text style={styles.infoGridLabel}>Khả dụng</Text>
                      <Text style={styles.infoGridValue}>
                        {product.warehouseStock.quantityAvailable} {product.productBatch.productVariant.unit}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoGridItem}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={16}
                        color={COLORS.warning}
                      />
                      <Text style={styles.infoGridLabel}>Đặt trước</Text>
                      <Text style={styles.infoGridValue}>
                        {product.warehouseStock.quantityReserved} {product.productBatch.productVariant.unit}
                      </Text>
                    </View>
                    <View style={styles.infoGridItem}>
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.infoGridLabel}>Vị trí</Text>
                      <Text style={styles.infoGridValue}>
                        {product.warehouseStock.location}
                      </Text>
                    </View>
                    {/* <View style={styles.infoGridItem}>
                      <MaterialCommunityIcons
                        name="layers"
                        size={16}
                        color={COLORS.indigo}
                      />
                      <Text style={styles.infoGridLabel}>Batch Code</Text>
                      <Text style={styles.infoGridValue}>{product.productBatch.batchCode}</Text>
                    </View> */}
                  </View>
                </View>
              </View>

              {/* Product Details */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="information"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.cardTitle}>Chi tiết sản phẩm</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>SKU</Text>
                    <Text style={styles.detailValue}>{product.productBatch.productVariant.sku}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Model</Text>
                    <Text style={styles.detailValue}>{product.productBatch.productVariant.model}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Part Number</Text>
                    <Text style={styles.detailValue}>{product.productBatch.productVariant.partNumber}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Thuộc tính</Text>
                    <View style={styles.attributesContainer}>
                      {Object.entries(product.productBatch.productVariant.attributes || {}).map(([key, value]) => (
                        <Text key={key} style={styles.attributeItem}>
                          {key}: {value}
                        </Text>
                      ))}
                      {Object.keys(product.productBatch.productVariant.attributes || {}).length === 0 && (
                        <Text style={styles.attributeItem}>Không có</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Đơn vị</Text>
                    <Text style={styles.detailValue}>{product.productBatch.productVariant.unit}</Text>
                  </View>
                  {product.productBatch.expiryDate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Hạn sử dụng</Text>
                      <Text
                        style={[styles.detailValue, { color: COLORS.warning }]}
                      >
                        {new Date(product.productBatch.expiryDate).toLocaleDateString(
                          "vi-VN",
                        )}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Batch Information */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="cube-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.cardTitle}>Thông tin lô hàng</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mã lô</Text>
                    <Text style={styles.detailValue}>{product.productBatch.batchCode}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ngày sản xuất</Text>
                    <Text style={styles.detailValue}>
                      {new Date(product.productBatch.manufactureDate).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ngày nhận</Text>
                    <Text style={styles.detailValue}>
                      {new Date(product.productBatch.receivedDate).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>SL nhận</Text>
                    <Text style={styles.detailValue}>{product.productBatch.quantityReceived} {product.productBatch.productVariant.unit}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>SL còn lại</Text>
                    <Text style={styles.detailValue}>{product.productBatch.quantityRemaining} {product.productBatch.productVariant.unit}</Text>
                  </View>
                </View>
              </View>

              {/* Category, Group, Brand */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="shape"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.cardTitle}>Phân loại</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.categoryItem}>
                    <View style={styles.categoryIcon}>
                      <MaterialCommunityIcons
                        name="folder"
                        size={16}
                        color={COLORS.purple}
                      />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryLabel}>Danh mục</Text>
                      <Text style={styles.categoryValue}>
                        {product.productBatch.productVariant.product.productCategory.name}
                      </Text>
                      <Text style={styles.categoryDesc}>
                        {product.productBatch.productVariant.product.productCategory.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.categoryItem}>
                    <View style={styles.categoryIcon}>
                      <MaterialCommunityIcons
                        name="group"
                        size={16}
                        color={COLORS.indigo}
                      />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryLabel}>Nhóm sản phẩm</Text>
                      <Text style={styles.categoryValue}>
                        {product.productBatch.productVariant.product.productGroup.name}
                      </Text>
                      <Text style={styles.categoryDesc}>
                        {product.productBatch.productVariant.product.productGroup.description}
                      </Text>
                      <View style={styles.taxRow}>
                        <Text style={styles.taxText}>
                          GTGT: {product.productBatch.productVariant.product.productGroup.gtgttax}%
                        </Text>
                        <Text style={styles.taxText}>
                          TNCN: {product.productBatch.productVariant.product.productGroup.tncnntax}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.categoryItem}>
                    <View style={styles.categoryIcon}>
                      <MaterialCommunityIcons
                        name="tag"
                        size={16}
                        color={COLORS.success}
                      />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryLabel}>Thương hiệu</Text>
                      <Text style={styles.categoryValue}>
                        {product.productBatch.productVariant.product.brand.name}
                      </Text>
                      <Text style={styles.categoryDesc}>
                        {product.productBatch.productVariant.product.brand.description}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Tags */}
              {product.productBatch.productVariant.product.tags && product.productBatch.productVariant.product.tags.length > 0 && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons
                      name="tag-multiple"
                      size={18}
                      color={COLORS.primary}
                    />
                    <Text style={styles.cardTitle}>Nhãn</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.tagsContainer}>
                      {product.productBatch.productVariant.product.tags.map((tag) => (
                        <View key={tag.id} style={styles.tag}>
                          <Text style={styles.tagText}>{tag.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Warehouse Info */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="warehouse"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.cardTitle}>Kho hàng</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.warehouseName}>
                    {product.warehouseStock.warehouse.name}
                  </Text>
                  <Text style={styles.warehouseAddress}>
                    {product.warehouseStock.warehouse.address}
                  </Text>
                  <View
                    style={[
                      styles.warehouseTypeBadge,
                      {
                        backgroundColor:
                          product.warehouseStock.warehouse.type === "MAIN"
                            ? COLORS.primary + "15"
                            : COLORS.warning + "15",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.warehouseTypeText,
                        {
                          color:
                            product.warehouseStock.warehouse.type === "MAIN"
                              ? COLORS.primary
                              : COLORS.warning,
                        },
                      ]}
                    >
                      {product.warehouseStock.warehouse.type === "MAIN"
                        ? "Kho chính"
                        : "Kho tạm"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Documents */}
              {product.productBatch.productVariant.documents && product.productBatch.productVariant.documents.length > 0 && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons
                      name="file-document-multiple"
                      size={18}
                      color={COLORS.primary}
                    />
                    <Text style={styles.cardTitle}>Tài liệu</Text>
                  </View>
                  <View style={styles.cardContent}>
                    {product.productBatch.productVariant.documents.map((document, index) => (
                      <View key={document.id} style={[styles.documentItem, index === product.productBatch.productVariant.documents.length - 1 && { borderBottomWidth: 0 }]}>
                        <View style={styles.documentIcon}>
                          <MaterialCommunityIcons
                            name="file-pdf-box"
                            size={20}
                            color={COLORS.error}
                          />
                        </View>
                        <View style={styles.documentInfo}>
                          <Text style={styles.documentName}>{document.fileName}</Text>
                          <Text style={styles.documentDate}>
                            {new Date(document.uploadedAt).toLocaleDateString('vi-VN')}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Supplier Info */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="account-tie"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.cardTitle}>Nhà cung cấp</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.supplierHeader}>
                    <View style={styles.supplierIcon}>
                      <MaterialCommunityIcons
                        name="domain"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.supplierMainInfo}>
                      <Text style={styles.supplierName}>{product.productBatch.productVariant.supplier.name}</Text>
                      <Text style={styles.supplierCode}>Mã: {product.productBatch.productVariant.supplier.code}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.supplierDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Địa chỉ</Text>
                      <Text style={styles.detailValue}>{product.productBatch.productVariant.supplier.address}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Điện thoại</Text>
                      <Text style={styles.detailValue}>{product.productBatch.productVariant.supplier.phoneNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailValue}>{product.productBatch.productVariant.supplier.email}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mã số thuế</Text>
                      <Text style={styles.detailValue}>{product.productBatch.productVariant.supplier.taxCode}</Text>
                    </View>
                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.detailLabel}>Hạn thanh toán</Text>
                      <Text style={styles.detailValue}>{product.productBatch.productVariant.supplier.paymentTermDays} ngày</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Description */}
              {product.productBatch.productVariant.product.description && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons
                      name="text"
                      size={18}
                      color={COLORS.primary}
                    />
                    <Text style={styles.cardTitle}>Mô tả</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.descriptionText}>
                      {product.productBatch.productVariant.product.description}
                    </Text>
                  </View>
                </View>
              )}

              {/* Footer */}
              <View style={styles.footerCard}>
                <View style={styles.footerItem}>
                  <MaterialCommunityIcons
                    name="clock-plus-outline"
                    size={14}
                    color={COLORS.gray400}
                  />
                  <Text style={styles.footerLabel}>Ngày tạo:</Text>
                  <Text style={styles.footerValue}>
                    {new Date(product.productBatch.createdAt).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
                <View style={styles.footerDivider} />
                <View style={styles.footerItem}>
                  <MaterialCommunityIcons
                    name="clock-edit-outline"
                    size={14}
                    color={COLORS.gray400}
                  />
                  <Text style={styles.footerLabel}>Cập nhật:</Text>
                  <Text style={styles.footerValue}>
                    {new Date(product.productBatch.updatedAt).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "94%",
    backgroundColor: COLORS.gray50,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  closeButton: {
    padding: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: COLORS.white,
    paddingBottom: 16,
    marginBottom: 12,
  },
  mainImage: {
    width: width,
    height: width * 0.8,
    backgroundColor: COLORS.gray100,
  },
  thumbnailContainer: {
    marginTop: 12,
  },
  thumbnailContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  thumbnailSelected: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  titleCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  productName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.gray800,
    marginBottom: 12,
    lineHeight: 28,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  priceItem: {
    flex: 1,
    alignItems: "center",
  },
  priceDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 6,
    width: "100%",
    textAlign: "center",
  },
  costPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  sellPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.error,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  infoGridItem: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 4,
  },
  infoGridLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    textAlign: "center",
    width: "100%",
  },
  infoGridValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.gray800,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.gray600,
    width: "40%",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray800,
  },
  categoryItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray50,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 3,
  },
  categoryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.gray800,
    marginBottom: 2,
  },
  categoryDesc: {
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 16,
  },
  taxRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  taxText: {
    fontSize: 11,
    color: COLORS.indigo,
    fontWeight: "600",
    backgroundColor: COLORS.indigo + "15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  warehouseName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray800,
    marginBottom: 6,
  },
  warehouseAddress: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
    marginBottom: 10,
  },
  warehouseTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  warehouseTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.gray800,
    lineHeight: 20,
  },
  footerCard: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  footerItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    width: 60,
  },
  footerValue: {
    fontSize: 11,
    color: COLORS.gray800,
    fontWeight: "600",
  },
  footerDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 12,
  },
  priceContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  priceCard: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  priceCardHighlight: {
    backgroundColor: COLORS.error + "08",
    borderColor: COLORS.error + "30",
  },
  priceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  priceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priceTitle: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.gray800,
    marginBottom: 8,
  },
  priceAmountHighlight: {
    fontSize: 20,
    color: COLORS.error,
  },
  priceFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceNote: {
    fontSize: 11,
    color: COLORS.gray400,
    fontWeight: "500",
  },
  arrowContainer: {
    paddingHorizontal: 8,
  },
  profitBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.success + "10",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  profitContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profitLabel: {
    fontSize: 13,
    color: COLORS.gray800,
    fontWeight: "600",
  },
  profitValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.success,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray800,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  supplierHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  supplierIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  supplierMainInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray800,
    marginBottom: 4,
  },
  supplierCode: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  supplierDetails: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  stockDetails: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  attributesContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  attributeItem: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray800,
    marginBottom: 2,
  },
  warehouseDesc: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
    marginBottom: 15,
  },
});
