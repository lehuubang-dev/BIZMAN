import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productService } from '../../../services/productService';
import { Product } from '../../../types/product';
import { COLORS } from './constants';

interface ProductDetailProps {
  productId: string;
  onClose: () => void;
}

export default function ProductDetail({ productId, onClose }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductDetail(productId);
        if (data) {
          setProduct(data);
        } else {
          setError('Không thể tải thông tin sản phẩm');
        }
      } catch (err: any) {
        console.error('Error in ProductDetail:', err);
        setError(err?.message || 'Lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Chi tiết sản phẩm</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}> 
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#DC2626" />
            <Text style={{ color: '#DC2626', marginVertical: 12, fontSize: 14, fontWeight: '600' }}>{error}</Text>
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setLoading(true);
                productService.getProductDetail(productId).then(data => {
                  if (data) setProduct(data);
                  else setError('Không thể tải thông tin sản phẩm');
                  setLoading(false);
                }).catch(err => {
                  setError(err?.message || 'Lỗi');
                  setLoading(false);
                });
              }}
              style={styles.retryBtn}
            >
              <MaterialCommunityIcons name="refresh" size={18} color={COLORS.white} />
              <Text style={{ color: COLORS.white, fontWeight: '700', marginLeft: 6 }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : !product ? (
          <View style={styles.center}>
            <MaterialCommunityIcons name="package-variant" size={48} color={COLORS.gray400} />
            <Text style={{ marginTop: 12, fontSize: 14, color: COLORS.gray600, fontWeight: '600' }}>Không tìm thấy sản phẩm</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Images Carousel */}
            {(product.images && product.images.length > 0) ? (
              <View style={styles.imagesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
                  {product.images.map((img, idx) => (
                    <Image 
                      key={img.id || idx} 
                      source={{ uri: img.imageUrl }} 
                      style={styles.image} 
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Basic Info - Improved */}
            <View style={styles.basicInfoSection}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.desc}>{product.description}</Text>
            </View>

            {/* Product Code - Prominent */}
            {/* <View style={styles.codeSection}>
              <View style={styles.codeContent}>
                <MaterialCommunityIcons name="barcode-scan" size={20} color={COLORS.primary} />
                <View style={styles.codeText}>
                  <Text style={styles.codeLabel}>Mã sản phẩm</Text>
                  <Text style={styles.codeValue}>{product.productCode}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray400} />
            </View> */}

            {/* Price Section */}
            <View style={styles.priceSection}>
              <View style={styles.priceItem}>
                <View style={styles.priceIcon}>
                  <MaterialCommunityIcons name="cash" size={20} color={COLORS.white} />
                </View>
                <View style={styles.priceContent}>
                  <Text style={styles.priceLabel}>Giá vốn</Text>
                  <Text style={[styles.priceValue, { color: '#8B5CF6' }]}>{Math.round(product.costPrice).toLocaleString('vi-VN')}</Text>
                </View>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceItem}>
                <View style={[styles.priceIcon, { backgroundColor: COLORS.primary }]}>
                  <MaterialCommunityIcons name="tag-multiple" size={20} color={COLORS.white} />
                </View>
                <View style={styles.priceContent}>
                  <Text style={styles.priceLabel}>Giá bán</Text>
                  <Text style={[styles.priceValue, { color: COLORS.primary }]}>{Math.round(product.sellPrice).toLocaleString('vi-VN')}</Text>
                </View>
              </View>
            </View>

            {/* Meta Information Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
              <View style={styles.grid}>
                <View style={styles.gridRow}>
                  <View style={styles.gridItem}>
                    <View style={styles.gridItemHeader}>
                      <View style={styles.gridIcon}>
                        <MaterialCommunityIcons name="tag-outline" size={14} color={COLORS.primary} />
                      </View>
                      <Text style={styles.gridLabel}>SKU</Text>
                    </View>
                    <Text style={styles.gridValue}>{product.sku}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <View style={styles.gridItemHeader}>
                      <View style={styles.gridIcon}>
                        <MaterialCommunityIcons name="folder-outline" size={14} color={COLORS.primary} />
                      </View>
                      <Text style={styles.gridLabel}>Danh mục</Text>
                    </View>
                    <Text style={styles.gridValue}>{product.productCategory?.name || '--'}</Text>
                  </View>
                </View>

                <View style={styles.gridRow}>
                  <View style={styles.gridItem}>
                    <View style={styles.gridItemHeader}>
                      <View style={styles.gridIcon}>
                        <MaterialCommunityIcons name="layers-outline" size={14} color={COLORS.primary} />
                      </View>
                      <Text style={styles.gridLabel}>Nhóm</Text>
                    </View>
                    <Text style={styles.gridValue}>{product.productGroup?.name || '--'}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <View style={styles.gridItemHeader}>
                      <View style={styles.gridIcon}>
                        <MaterialCommunityIcons name="briefcase-outline" size={14} color={COLORS.primary} />
                      </View>
                      <Text style={styles.gridLabel}>Thương hiệu</Text>
                    </View>
                    <Text style={styles.gridValue}>{product.brand?.name || '--'}</Text>
                  </View>
                </View>

                <View style={styles.gridRow}>
                  <View style={styles.gridItem}>
                    <View style={styles.gridItemHeader}>
                      <View style={styles.gridIcon}>
                        <MaterialCommunityIcons name="tools" size={14} color={COLORS.primary} />
                      </View>
                      <Text style={styles.gridLabel}>Loại</Text>
                    </View>
                    <Text style={styles.gridValue}>{product.type || '--'}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <View style={styles.gridItemHeader}>
                      <View style={styles.gridIcon}>
                        <MaterialCommunityIcons name="ruler" size={14} color={COLORS.primary} />
                      </View>
                      <Text style={styles.gridLabel}>Đơn vị</Text>
                    </View>
                    <Text style={styles.gridValue}>{product.unit || '--'}</Text>
                  </View>
                </View>

                <View style={styles.gridRow}>
                  <View style={styles.gridItem}>
                    <View style={styles.gridItemHeader}>
                      <View style={styles.gridIcon}>
                        <MaterialCommunityIcons name="package-variant-closed" size={14} color={COLORS.primary} />
                      </View>
                      <Text style={styles.gridLabel}>Tồn tối thiểu</Text>
                    </View>
                    <Text style={styles.gridValue}>{product.minStock}</Text>
                  </View>
                  <View style={styles.gridItem} />
                </View>
              </View>
            </View>

            {/* Optional Fields */}
            {(product.model || product.partNumber || product.serialNumber) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
                <View style={styles.detailGrid}>
                  {product.model && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <MaterialCommunityIcons name="format-list-bulleted" size={14} color={COLORS.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Model</Text>
                        <Text style={styles.detailValue}>{product.model}</Text>
                      </View>
                    </View>
                  )}
                  {product.partNumber && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <MaterialCommunityIcons name="puzzle" size={14} color={COLORS.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Part Number</Text>
                        <Text style={styles.detailValue}>{product.partNumber}</Text>
                      </View>
                    </View>
                  )}
                  {product.serialNumber && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <MaterialCommunityIcons name="identifier" size={14} color={COLORS.primary} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Serial Number</Text>
                        <Text style={styles.detailValue}>{product.serialNumber}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Status - Unique Design */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trạng thái</Text>
              <View style={[styles.statusContainer, product.active ? styles.statusContainerActive : styles.statusContainerInactive]}>
                <View style={[styles.statusDot, product.active ? styles.dotActive : styles.dotInactive]} />
                <View style={styles.statusContent}>
                  <Text style={styles.statusTitle}>{product.active ? 'Hoạt động' : 'Ngừng hoạt động'}</Text>
                  <Text style={styles.statusSubtitle}>{product.active ? 'Sản phẩm đang được bán' : 'Sản phẩm tạm ngừng'}</Text>
                </View>
                <MaterialCommunityIcons 
                  name={product.active ? 'check-circle-outline' : 'close-circle-outline'} 
                  size={28} 
                  color={product.active ? '#16A34A' : '#DC2626'} 
                />
              </View>
            </View>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thẻ</Text>
                <View style={styles.tagsRow}>
                  {product.tags.map(tag => (
                    <View key={tag.id} style={styles.tagChip}>
                      <MaterialCommunityIcons name="label" size={12} color={COLORS.primary} />
                      <Text style={styles.tagText}>{tag.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  center: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginTop: 12,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  imagesContainer: {
    marginBottom: 4,
  },
  imagesRow: {
    flexGrow: 0,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#f3f4f6',
  },
  basicInfoSection: {
    gap: 8,
    paddingBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 28,
  },
  desc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontWeight: '500',
  },
  codeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  codeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  codeText: {
    gap: 2,
  },
  codeLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  codeValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '800',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  priceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  priceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceContent: {
    gap: 2,
  },
  priceLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  priceDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#e5e7eb',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  grid: {
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  gridItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  gridIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  gridValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  detailGrid: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
    gap: 3,
  },
  detailLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  statusContainerActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  statusContainerInactive: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotActive: {
    backgroundColor: '#16A34A',
  },
  dotInactive: {
    backgroundColor: '#DC2626',
  },
  statusContent: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
});