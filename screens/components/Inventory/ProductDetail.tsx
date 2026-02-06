import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productService } from '../../../services/productService';
import { Product } from '../../../types/product';
import { COLORS } from '../../../constants/colors';

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { color: string; label: string; icon: string }> = {
      PHYSICAL: { color: '#10B981', label: 'Sản phẩm vật lý', icon: 'package-variant' },
      DIGITAL: { color: '#3B82F6', label: 'Sản phẩm số', icon: 'cloud-download' },
      SERVICE: { color: '#F59E0B', label: 'Dịch vụ', icon: 'hand-heart' },
    };
    return configs[type] || { color: '#6B7280', label: type, icon: 'cube' };
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons 
                name="package-variant" 
                size={24} 
                color={COLORS.primary} 
              />
            </View>
            <Text style={styles.title}>Chi tiết sản phẩm</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => {
              setError(null);
              setLoading(true);
              productService.getProductDetail(productId).then(data => {
                if (data) setProduct(data);
                else setError('Không thể tải thông tin sản phẩm');
              }).catch(err => {
                setError(err?.message || 'Lỗi');
              }).finally(() => {
                setLoading(false);
              });
            }}>
              <MaterialCommunityIcons name="refresh" size={18} color="#FFF" />
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : !product ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="package-variant-closed" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Product Name & Status */}
            <View style={styles.nameSection}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={[styles.statusBadge, product.active ? styles.statusActive : styles.statusInactive]}>
                <View style={[styles.statusDot, product.active ? styles.dotActive : styles.dotInactive]} />
                <Text style={[styles.statusText, product.active ? styles.statusTextActive : styles.statusTextInactive]}>
                  {product.active ? 'Hoạt động' : 'Tạm ngừng'}
                </Text>
              </View>
            </View>

            {/* Description */}
            {product.description && (
              <View style={styles.descSection}>
                <Text style={styles.description}>{product.description}</Text>
              </View>
            )}

            {/* Quick Info Cards */}
            <View style={styles.quickInfoGrid}>
              <View style={styles.quickInfoCard}>
                <View style={styles.quickInfoIcon}>
                  <MaterialCommunityIcons name="barcode" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.quickInfoContent}>
                  <Text style={styles.quickInfoLabel}>Mã sản phẩm</Text>
                  <Text style={styles.quickInfoValue}>{product.code}</Text>
                </View>
              </View>

              <View style={styles.quickInfoCard}>
                <View style={[styles.quickInfoIcon, { backgroundColor: getTypeConfig(product.type).color + '15' }]}>
                  <MaterialCommunityIcons 
                    name={getTypeConfig(product.type).icon as any} 
                    size={20} 
                    color={getTypeConfig(product.type).color} 
                  />
                </View>
                <View style={styles.quickInfoContent}>
                  <Text style={styles.quickInfoLabel}>Loại</Text>
                  <Text style={styles.quickInfoValue}>{getTypeConfig(product.type).label}</Text>
                </View>
              </View>
            </View>

            {/* Images */}
            {product.images && product.images.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="image-multiple" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Hình ảnh</Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imageRow}
                >
                  {product.images.map((image, index) => (
                    <View key={image.id || index} style={styles.imageBox}>
                      <Image
                        source={{ uri: `http://192.168.1.2:8080${image.imageUrl}` }}
                        style={styles.image}
                      />
                      {image.isPrimary && (
                        <View style={styles.primaryBadge}>
                          <MaterialCommunityIcons name="star" size={10} color="#FFF" />
                          <Text style={styles.primaryText}>Chính</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Classification */}
            {(product.productCategory || product.productGroup || product.brand) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="shape" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Phân loại</Text>
                </View>

                <View style={styles.infoList}>
                  {product.productCategory && (
                    <View style={styles.infoItem}>
                      <View style={styles.infoLeft}>
                        <View style={styles.infoIconBox}>
                          <MaterialCommunityIcons name="folder" size={16} color="#3B82F6" />
                        </View>
                        <View style={styles.infoTextBox}>
                          <Text style={styles.infoLabel}>Danh mục</Text>
                          <Text style={styles.infoValue}>{product.productCategory.name}</Text>
                          {typeof product.productCategory.profitMargin === 'number' && (
                            <Text style={styles.infoExtra}>Lợi nhuận: {product.productCategory.profitMargin}%</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  )}

                  {product.productGroup && (
                    <View style={styles.infoItem}>
                      <View style={styles.infoLeft}>
                        <View style={styles.infoIconBox}>
                          <MaterialCommunityIcons name="group" size={16} color="#8B5CF6" />
                        </View>
                        <View style={styles.infoTextBox}>
                          <Text style={styles.infoLabel}>Nhóm sản phẩm</Text>
                          <Text style={styles.infoValue}>{product.productGroup.name}</Text>
                          <Text style={styles.infoExtra}>Loại: {product.productGroup.jobType}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {product.brand && (
                    <View style={styles.infoItem}>
                      <View style={styles.infoLeft}>
                        <View style={styles.infoIconBox}>
                          <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
                        </View>
                        <View style={styles.infoTextBox}>
                          <Text style={styles.infoLabel}>Thương hiệu</Text>
                          <Text style={styles.infoValue}>{product.brand.name}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="tag-multiple" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Tags</Text>
                </View>
                <View style={styles.tagsList}>
                  {product.tags.map((tag) => (
                    <View key={tag.id} style={styles.tag}>
                      <MaterialCommunityIcons name="label" size={12} color={COLORS.primary} />
                      <Text style={styles.tagText}>{tag.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="tune-variant" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Biến thể</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{product.variants.length}</Text>
                  </View>
                </View>

                <View style={styles.variantsList}>
                  {product.variants.map((variant) => (
                    <View key={variant.id} style={styles.variantCard}>
                      <View style={styles.variantHeader}>
                        <View style={styles.variantLeft}>
                          <Text style={styles.variantName}>{variant.name}</Text>
                          <Text style={styles.variantSku}>SKU: {variant.sku}</Text>
                        </View>
                        <View style={[
                          styles.variantStatusBadge, 
                          variant.active ? styles.variantStatusActive : styles.variantStatusInactive
                        ]}>
                          <View style={[
                            styles.variantStatusDot,
                            variant.active ? styles.dotActive : styles.dotInactive
                          ]} />
                        </View>
                      </View>

                      <View style={styles.variantBody}>
                        {variant.model && (
                          <View style={styles.variantRow}>
                            <MaterialCommunityIcons name="cube-outline" size={14} color="#6B7280" />
                            <Text style={styles.variantRowText}>Model: {variant.model}</Text>
                          </View>
                        )}
                        
                        {variant.partNumber && (
                          <View style={styles.variantRow}>
                            <MaterialCommunityIcons name="identifier" size={14} color="#6B7280" />
                            <Text style={styles.variantRowText}>Part: {variant.partNumber}</Text>
                          </View>
                        )}
                        
                        <View style={styles.variantRow}>
                          <MaterialCommunityIcons name="package-variant" size={14} color="#6B7280" />
                          <Text style={styles.variantRowText}>Đơn vị: {variant.unit}</Text>
                        </View>

                        <View style={styles.priceRow}>
                          <View style={styles.priceBox}>
                            <MaterialCommunityIcons name="cash" size={16} color="#059669" />
                            <View>
                              <Text style={styles.priceLabel}>Giá chuẩn</Text>
                              <Text style={styles.priceValue}>{formatCurrency(variant.standardCost)}</Text>
                            </View>
                          </View>
                          
                          {variant.lastPurchaseCost && (
                            <View style={styles.priceBox}>
                              <MaterialCommunityIcons name="cart" size={16} color="#3B82F6" />
                              <View>
                                <Text style={styles.priceLabel}>Mua cuối</Text>
                                <Text style={styles.priceValue}>{formatCurrency(variant.lastPurchaseCost)}</Text>
                              </View>
                            </View>
                          )}
                        </View>

                        {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                          <View style={styles.attributesBox}>
                            <View style={styles.attributesHeader}>
                              <MaterialCommunityIcons name="cog" size={14} color="#8B5CF6" />
                              <Text style={styles.attributesTitle}>Thuộc tính</Text>
                            </View>
                            <View style={styles.attributesList}>
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <View key={key} style={styles.attributeItem}>
                                  <Text style={styles.attributeKey}>{key}:</Text>
                                  <Text style={styles.attributeValue}>{String(value)}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* System Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Thông tin hệ thống</Text>
              </View>

              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <View style={styles.infoLeft}>
                    <View style={styles.infoIconBox}>
                      <MaterialCommunityIcons name="calendar-plus" size={16} color="#10B981" />
                    </View>
                    <View style={styles.infoTextBox}>
                      <Text style={styles.infoLabel}>Ngày tạo</Text>
                      <Text style={styles.infoValue}>{formatDate(product.createdAt)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <View style={styles.infoLeft}>
                    <View style={styles.infoIconBox}>
                      <MaterialCommunityIcons name="calendar-edit" size={16} color="#F59E0B" />
                    </View>
                    <View style={styles.infoTextBox}>
                      <Text style={styles.infoLabel}>Cập nhật</Text>
                      <Text style={styles.infoValue}>{formatDate(product.updatedAt)}</Text>
                    </View>
                  </View>
                </View>

                
              </View>
            </View>

            <View style={{ height: 20 }} />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content States
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 16,
  },

  // Content
  content: {
    flex: 1,
    padding: 20,
  },

  // Name Section
  nameSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  productName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 30,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: '#16A34A',
  },
  dotInactive: {
    backgroundColor: '#DC2626',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#16A34A',
  },
  statusTextInactive: {
    color: '#DC2626',
  },

  // Description
  descSection: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Quick Info
  quickInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickInfoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quickInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickInfoContent: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Images
  imageRow: {
    gap: 10,
  },
  imageBox: {
    position: 'relative',
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  primaryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  primaryText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '700',
  },

  // Info List
  infoList: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  infoExtra: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },

  // Tags
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Variants
  variantsList: {
    gap: 12,
  },
  variantCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  variantLeft: {
    flex: 1,
  },
  variantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  variantSku: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  variantStatusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantStatusActive: {
    backgroundColor: '#DCFCE7',
  },
  variantStatusInactive: {
    backgroundColor: '#FEE2E2',
  },
  variantStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  variantBody: {
    padding: 14,
    gap: 10,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  variantRowText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  priceBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
  },
  attributesBox: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
  },
  attributesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  attributesTitle: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
  },
  attributesList: {
    gap: 4,
  },
  attributeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attributeKey: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  attributeValue: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
});