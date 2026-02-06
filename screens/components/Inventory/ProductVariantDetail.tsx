import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { productService } from '../../../services/productService';
import { ProductVariant } from '../../../types/product';

interface ProductVariantDetailProps {
  variantId: string;
  onClose: () => void;
}

export default function ProductVariantDetail({ variantId, onClose }: ProductVariantDetailProps) {
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductVariantById(variantId);
        if (data) {
          setVariant(data);
        } else {
          setError('Không thể tải thông tin biến thể sản phẩm');
        }
      } catch (err: any) {
        console.error('Error in ProductVariantDetail:', err);
        setError(err?.message || 'Lỗi khi tải biến thể sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [variantId]);

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

  const renderAttributes = () => {
    if (!variant?.attributes || Object.keys(variant.attributes).length === 0) {
      return null;
    }

    return (
      <View style={styles.attributesBox}>
        <View style={styles.attributesHeader}>
          <MaterialCommunityIcons name="tag-multiple" size={14} color="#374151" />
          <Text style={styles.attributesTitle}>Thuộc tính</Text>
        </View>
        <View style={styles.attributesList}>
          {Object.entries(variant.attributes).map(([key, value], index) => (
            <View key={index} style={styles.attributeItem}>
              <Text style={styles.attributeKey}>{key}:</Text>
              <Text style={styles.attributeValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons 
                name="cube-outline" 
                size={24} 
                color={COLORS.primary} 
              />
            </View>
            <Text style={styles.title}>Chi tiết biến thể</Text>
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
              productService.getProductVariantById(variantId)
                .then(data => {
                  if (data) {
                    setVariant(data);
                  } else {
                    setError('Không thể tải thông tin biến thể sản phẩm');
                  }
                })
                .catch(err => {
                  setError(err?.message || 'Lỗi khi tải biến thể sản phẩm');
                })
                .finally(() => setLoading(false));
            }}>
              <MaterialCommunityIcons name="refresh" size={18} color="#FFF" />
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : !variant ? (
          <View style={styles.centerContent}>
            <MaterialCommunityIcons name="cube-off" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Không tìm thấy biến thể</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Product Variant Name & Status */}
            <View style={styles.nameSection}>
              <Text style={styles.productName}>{variant.name}</Text>
              <View style={[styles.statusBadge, variant.active ? styles.statusActive : styles.statusInactive]}>
                <View style={[styles.statusDot, variant.active ? styles.dotActive : styles.dotInactive]} />
                <Text style={[styles.statusText, variant.active ? styles.statusTextActive : styles.statusTextInactive]}>
                  {variant.active ? 'Hoạt động' : 'Ngừng'}
                </Text>
              </View>
            </View>

            {/* Variant Info Cards */}
            <View style={styles.quickInfoGrid}>
              <View style={styles.quickInfoCard}>
                <View style={styles.quickInfoIcon}>
                  <MaterialCommunityIcons name="barcode" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.quickInfoContent}>
                  <Text style={styles.quickInfoLabel}>SKU</Text>
                  <Text style={styles.quickInfoValue}>{variant.sku}</Text>
                </View>
              </View>

              <View style={styles.quickInfoCard}>
                <View style={styles.quickInfoIcon}>
                  <MaterialCommunityIcons name="scale-balance" size={16} color="#059669" />
                </View>
                <View style={styles.quickInfoContent}>
                  <Text style={styles.quickInfoLabel}>Đơn vị</Text>
                  <Text style={styles.quickInfoValue}>{variant.unit || 'Chưa xác định'}</Text>
                </View>
              </View>
            </View>

            {/* Model & Part Number */}
            {(variant.model || variant.partNumber) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="information" size={20} color="#6B7280" />
                  <Text style={styles.sectionTitle}>Thông tin kỹ thuật</Text>
                </View>

                <View style={styles.infoList}>
                  {variant.model && (
                    <View style={styles.infoItem}>
                      <View style={styles.infoLeft}>
                        <View style={styles.infoIconBox}>
                          <MaterialCommunityIcons name="format-list-numbered" size={14} color="#374151" />
                        </View>
                        <View style={styles.infoTextBox}>
                          <Text style={styles.infoLabel}>Model</Text>
                          <Text style={styles.infoValue}>{variant.model}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  {variant.partNumber && (
                    <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
                      <View style={styles.infoLeft}>
                        <View style={styles.infoIconBox}>
                          <MaterialCommunityIcons name="puzzle" size={14} color="#374151" />
                        </View>
                        <View style={styles.infoTextBox}>
                          <Text style={styles.infoLabel}>Part Number</Text>
                          <Text style={styles.infoValue}>{variant.partNumber}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Cost Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="cash-multiple" size={20} color="#059669" />
                <Text style={styles.sectionTitle}>Thông tin giá</Text>
              </View>

              <View style={styles.priceInfoGrid}>
                <View style={styles.priceCard}>
                  <View style={styles.priceHeader}>
                    <MaterialCommunityIcons name="tag" size={16} color="#059669" />
                    <Text style={styles.priceLabel}>Giá chuẩn</Text>
                  </View>
                  <Text style={styles.priceValue}>{formatCurrency(variant.standardCost)}</Text>
                </View>

                {variant.lastPurchaseCost && variant.lastPurchaseCost !== variant.standardCost && (
                  <View style={styles.priceCard}>
                    <View style={styles.priceHeader}>
                      <MaterialCommunityIcons name="shopping" size={16} color="#F59E0B" />
                      <Text style={styles.priceLabel}>Giá mua cuối</Text>
                    </View>
                    <Text style={styles.priceValue}>{formatCurrency(variant.lastPurchaseCost)}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Attributes */}
            {renderAttributes()}

            {/* Product Information */}
            {variant.product && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="package-variant" size={20} color="#3B82F6" />
                  <Text style={styles.sectionTitle}>Sản phẩm gốc</Text>
                </View>

                <View style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <View style={styles.productNameSection}>
                      <Text style={styles.productCardName}>{variant.product.name}</Text>
                      <Text style={styles.productCode}>({variant.product.code})</Text>
                    </View>
                    
                    {variant.product.type && (
                      <View style={[styles.typeChip, { backgroundColor: getTypeConfig(variant.product.type).color + '20' }]}>
                        <MaterialCommunityIcons 
                          name={getTypeConfig(variant.product.type).icon as any}
                          size={12} 
                          color={getTypeConfig(variant.product.type).color} 
                        />
                        <Text style={[styles.typeText, { color: getTypeConfig(variant.product.type).color }]}>
                          {getTypeConfig(variant.product.type).label}
                        </Text>
                      </View>
                    )}
                  </View>

                  {variant.product.description && (
                    <Text style={styles.productDescription}>{variant.product.description}</Text>
                  )}

                  {/* Product Classification */}
                  {(variant.product.productCategory || variant.product.productGroup || variant.product.brand) && (
                    <View style={styles.classificationSection}>
                      {variant.product.productCategory && (
                        <View style={styles.classificationItem}>
                          <MaterialCommunityIcons name="folder" size={14} color="#F59E0B" />
                          <Text style={styles.classificationText}>{variant.product.productCategory.name}</Text>
                        </View>
                      )}
                      
                      {variant.product.productGroup && (
                        <View style={styles.classificationItem}>
                          <MaterialCommunityIcons name="group" size={14} color="#8B5CF6" />
                          <Text style={styles.classificationText}>{variant.product.productGroup.name}</Text>
                        </View>
                      )}
                      
                      {variant.product.brand && (
                        <View style={styles.classificationItem}>
                          <MaterialCommunityIcons name="star" size={14} color="#EF4444" />
                          <Text style={styles.classificationText}>{variant.product.brand.name}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Product Tags */}
                  {variant.product.tags && variant.product.tags.length > 0 && (
                    <View style={styles.tagsSection}>
                      <Text style={styles.tagsTitle}>Tags:</Text>
                      <View style={styles.tagsList}>
                        {variant.product.tags.map(tag => (
                          <View key={tag.id} style={styles.tag}>
                            <MaterialCommunityIcons name="tag" size={10} color={COLORS.primary} />
                            <Text style={styles.tagText}>{tag.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Supplier Information */}
            {variant.supplier && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="truck" size={20} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>Nhà cung cấp</Text>
                </View>

                <View style={styles.supplierCard}>
                  <View style={styles.supplierHeader}>
                    <View style={styles.supplierInfo}>
                      <Text style={styles.supplierName}>{variant.supplier.name}</Text>
                      <Text style={styles.supplierCode}>({variant.supplier.code})</Text>
                    </View>
                    <View style={[styles.statusBadge, variant.supplier.active ? styles.statusActive : styles.statusInactive]}>
                      <View style={[styles.statusDot, variant.supplier.active ? styles.dotActive : styles.dotInactive]} />
                      <Text style={[styles.statusText, variant.supplier.active ? styles.statusTextActive : styles.statusTextInactive]}>
                        {variant.supplier.active ? 'Hoạt động' : 'Ngừng'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.supplierDetails}>
                    {variant.supplier.address && (
                      <View style={styles.supplierDetailItem}>
                        <MaterialCommunityIcons name="map-marker" size={14} color="#6B7280" />
                        <Text style={styles.supplierDetailText}>{variant.supplier.address}</Text>
                      </View>
                    )}
                    
                    {variant.supplier.phoneNumber && (
                      <View style={styles.supplierDetailItem}>
                        <MaterialCommunityIcons name="phone" size={14} color="#6B7280" />
                        <Text style={styles.supplierDetailText}>{variant.supplier.phoneNumber}</Text>
                      </View>
                    )}
                    
                    {variant.supplier.email && (
                      <View style={styles.supplierDetailItem}>
                        <MaterialCommunityIcons name="email" size={14} color="#6B7280" />
                        <Text style={styles.supplierDetailText}>{variant.supplier.email}</Text>
                      </View>
                    )}
                  </View>

                  {variant.supplier.paymentTermDays && (
                    <View style={styles.paymentTerms}>
                      <MaterialCommunityIcons name="calendar-clock" size={14} color="#059669" />
                      <Text style={styles.paymentTermsText}>
                        Thời hạn thanh toán: {variant.supplier.paymentTermDays} ngày
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Documents */}
            {variant.documents && variant.documents.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="file-document-multiple" size={20} color="#6B7280" />
                  <Text style={styles.sectionTitle}>Tài liệu</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{variant.documents.length}</Text>
                  </View>
                </View>

                <View style={styles.documentsList}>
                  {variant.documents.map(doc => (
                    <View key={doc.id} style={styles.documentItem}>
                      <View style={styles.documentIcon}>
                        <MaterialCommunityIcons name="file" size={16} color="#3B82F6" />
                      </View>
                      <View style={styles.documentInfo}>
                        <Text style={styles.documentName}>{doc.fileName}</Text>
                        <Text style={styles.documentDate}>
                          Tải lên: {formatDate(doc.uploadedAt || doc.createdAt)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* System Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="information-outline" size={20} color="#6B7280" />
                <Text style={styles.sectionTitle}>Thông tin hệ thống</Text>
              </View>

              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <View style={styles.infoLeft}>
                    <View style={styles.infoIconBox}>
                      <MaterialCommunityIcons name="clock-plus" size={14} color="#374151" />
                    </View>
                    <View style={styles.infoTextBox}>
                      <Text style={styles.infoLabel}>Ngày tạo</Text>
                      <Text style={styles.infoValue}>{formatDate(variant.createdAt)}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
                  <View style={styles.infoLeft}>
                    <View style={styles.infoIconBox}>
                      <MaterialCommunityIcons name="clock-edit" size={14} color="#374151" />
                    </View>
                    <View style={styles.infoTextBox}>
                      <Text style={styles.infoLabel}>Cập nhật cuối</Text>
                      <Text style={styles.infoValue}>{formatDate(variant.updatedAt)}</Text>
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

  // Price Info
  priceInfoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  priceCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '800',
  },

  // Attributes
  attributesBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
  },
  attributesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  attributesTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
  },
  attributesList: {
    gap: 4,
  },
  attributeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attributeKey: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    minWidth: 80,
  },
  attributeValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },

  // Product Card
  productCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  productNameSection: {
    flex: 1,
  },
  productCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  productCode: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  productDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  classificationSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  classificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  classificationText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  tagsSection: {
    marginTop: 8,
  },
  tagsTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Supplier Card
  supplierCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  supplierCode: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  supplierDetails: {
    gap: 8,
    marginBottom: 12,
  },
  supplierDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supplierDetailText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  paymentTerms: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentTermsText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },

  // Documents
  documentsList: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  documentIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 11,
    color: '#6B7280',
  },
});
