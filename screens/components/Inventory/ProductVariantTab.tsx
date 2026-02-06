import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productService } from '../../../services/productService';
import { ProductVariant, ProductDocument, ProductSupplier } from '../../../types/product';
import { COLORS } from '../../../constants/colors';
import ProductVariantCreate from './ProductVariantCreate';
import ProductVariantUpdate from './ProductVariantUpdate';
import ProductVariantDetail from './ProductVariantDetail';

interface ProductVariantTabProps {
  refreshTrigger?: number;
  searchKeyword?: string;
  productId?: string;
  selectedSuppliers?: string[]; // Thêm prop mới
}

export const ProductVariantTab: React.FC<ProductVariantTabProps> = ({
  refreshTrigger,
  searchKeyword,
  productId,
  selectedSuppliers = [], // Thêm prop mới với default value
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchVariants = async (keyword?: string, supplierIds?: string[]) => {
    console.log('🔍 Fetching product variants with params:', { keyword, supplierIds });
    
    setLoading(true);
    setError(null);
    try {
      let allVariants: any[] = [];
      
      if (supplierIds && supplierIds.length > 0) {
        console.log('🏢 Filtering by suppliers:', supplierIds);
        // Nếu có filter supplier, lấy từ tất cả suppliers được chọn
        const variantPromises = supplierIds.map(supplierId => 
          productService.getProductVariantsBySupplierId(supplierId)
        );
        const variantArrays = await Promise.all(variantPromises);
        allVariants = variantArrays.flat();
        
        // Nếu còn có keyword thì filter thêm
        if (keyword && keyword.trim()) {
          console.log('🔍 + Filtering by keyword after supplier filter:', keyword);
          const searchStr = keyword.toLowerCase().trim();
          allVariants = allVariants.filter((variant: any) => {
            const searchFields = [
              variant?.name?.toLowerCase() || '',
              variant?.sku?.toLowerCase() || '',
              variant?.model?.toLowerCase() || '',
              variant?.partNumber?.toLowerCase() || '',
              variant?.product?.name?.toLowerCase() || '',
              variant?.product?.code?.toLowerCase() || ''
            ];
            return searchFields.some(field => field.includes(searchStr));
          });
        }
      } else if (keyword && keyword.trim()) {
        console.log('🔍 Searching variants with keyword:', keyword);
        allVariants = await productService.searchProductVariants(keyword);
      } else {
        console.log('📦 Getting all variants...');
        allVariants = await productService.getProductVariants();
      }
      
      console.log('📋 Fetched variants:', allVariants?.length, 'items');
      
      const transformedVariants: ProductVariant[] = (allVariants || []).map((variant: any) => ({
        id: variant.id,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
        sku: variant.sku,
        name: variant.name,
        model: variant.model || '',
        partNumber: variant.partNumber || '',
        attributes: variant.attributes || {},
        unit: variant.unit,
        standardCost: variant.standardCost || 0,
        lastPurchaseCost: variant.lastPurchaseCost || 0,
        active: variant.active,
        product: variant.product,
        documents: variant.documents || [],
        supplier: variant.supplier || null,
      }));
      
      // Sắp xếp theo thời gian cập nhật mới nhất lên đầu
      const sortedVariants = transformedVariants.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA; // Mới nhất lên đầu
      });
      
      setVariants(sortedVariants);
      
    } catch (e: any) {
      console.error('Error fetching variants:', e);
      setError(e?.message || 'Không thể tải danh sách biến thể');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVariants(searchKeyword, selectedSuppliers);
    }, searchKeyword ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [refreshTrigger, searchKeyword, refreshCounter, selectedSuppliers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleToggleExpanded = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleViewDetail = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    setShowDetailModal(true);
    setExpandedId(null);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setShowUpdateModal(true);
    setExpandedId(null);
  };

  const handleCreateVariant = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setRefreshCounter(prev => prev + 1);
    setShowCreateModal(false);
  };

  const handleUpdateSuccess = () => {
    setRefreshCounter(prev => prev + 1);
    setShowUpdateModal(false);
    setSelectedVariant(null);
  };

  const renderVariantItem = ({ item }: { item: ProductVariant }) => {
    const isExpanded = expandedId === item.id;
    
    return (
      <View style={[styles.card, !item.active && styles.cardInactive]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleToggleExpanded(item.id)}
          activeOpacity={0.7}
        >
          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Name & SKU */}
            <View style={styles.nameSection}>
              <View style={styles.nameRow}>
                <Text style={styles.variantName} numberOfLines={2}>{item.name}</Text>
              </View>
              
              <View style={styles.skuRow}>
                <MaterialCommunityIcons name="barcode-scan" size={14} color="#6B7280" />
                <Text style={styles.skuText}>{item.sku}</Text>
              </View>
            </View>

            {/* Product & Supplier Info */}
            <View style={styles.infoSection}>
              {item.product?.name && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="package-variant" size={14} color="#3B82F6" />
                  <Text style={styles.infoText} numberOfLines={1}>{item.product.name}</Text>
                </View>
              )}

              {item.supplier?.name && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="store" size={14} color="#F59E0B" />
                  <Text style={styles.infoText} numberOfLines={1}>{item.supplier.name}</Text>
                </View>
              )}
              
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="package-variant-closed" size={14} color="#6B7280" />
                <Text style={styles.infoText}>Đơn vị: {item.unit}</Text>
              </View>
            </View>

            {/* Attributes chips */}
            {item.attributes && Object.keys(item.attributes).length > 0 && (
              <View style={styles.attributesSection}>
                <View style={styles.attributesHeader}>
                  <MaterialCommunityIcons name="cog-outline" size={14} color="#8B5CF6" />
                  <Text style={styles.attributesLabel}>Thuộc tính</Text>
                </View>
                <View style={styles.attributesGrid}>
                  {Object.entries(item.attributes).slice(0, 3).map(([key, value]) => (
                    <View key={key} style={styles.attributeChip}>
                      <MaterialCommunityIcons name="check-circle" size={12} color="#8B5CF6" />
                      <Text style={styles.attributeKey}>{key}:</Text>
                      <Text style={styles.attributeValue}>{value}</Text>
                    </View>
                  ))}
                  {Object.keys(item.attributes).length > 3 && (
                    <View style={styles.attributeChip}>
                      <MaterialCommunityIcons name="dots-horizontal" size={12} color="#8B5CF6" />
                      <Text style={styles.attributeValue}>+{Object.keys(item.attributes).length - 3}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Price at bottom */}
            <View style={styles.priceSection}>
              <View style={styles.priceBox}>
                <MaterialCommunityIcons name="cash" size={16} color="#059669" />
                <View style={styles.priceContent}>
                  <Text style={styles.priceValue}>
                    {(item.standardCost || 0).toLocaleString('vi-VN')}
                  </Text>
                </View>
              </View>
              
              <MaterialCommunityIcons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9CA3AF" 
              />
            </View>
          </View>

          {/* Actions - Top Right */}
          <View style={styles.actionsTopRight}>
            <View style={[styles.statusDot, item.active ? styles.dotActive : styles.dotInactive]} />
            
            {isExpanded && (
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={() => handleViewDetail(item)}
                >
                  <MaterialCommunityIcons name="eye" size={18} color="#3B82F6" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={() => handleEditVariant(item)}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color="#F59E0B" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchVariants(searchKeyword, selectedSuppliers)}>
          <MaterialCommunityIcons name="refresh" size={18} color="#FFF" />
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="tune-variant" size={24} color={COLORS.primary} />
          <View>
            <Text style={styles.headerTitle}>Biến thể sản phẩm</Text>
            <Text style={styles.headerSubtitle}>{variants.length} biến thể</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleCreateVariant}>
          <MaterialCommunityIcons name="plus-circle" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Thêm</Text>
        </TouchableOpacity>
      </View> */}

      {/* List */}
      {variants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="package-variant" size={72} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            {searchKeyword ? 'Không tìm thấy biến thể' : 'Chưa có biến thể'}
          </Text>
          <Text style={styles.emptyDesc}>
            {searchKeyword 
              ? `Không có kết quả cho "${searchKeyword}"`
              : 'Tạo biến thể đầu tiên của bạn'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={variants}
          keyExtractor={(item) => item.id}
          renderItem={renderVariantItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <ProductVariantCreate
          productId={productId || ''}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showUpdateModal && selectedVariant && (
        <ProductVariantUpdate
          variant={selectedVariant}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedVariant(null);
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {showDetailModal && selectedVariantId && (
        <ProductVariantDetail
          variantId={selectedVariantId}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedVariantId(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // Center States
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    width: '100%',  
    textAlign: 'center',
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

  // List
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },

  // Main Content
  mainContent: {
    flex: 1,
    gap: 10,
  },
  nameSection: {
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  variantName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  skuText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  
  // Info Section
  infoSection: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Attributes Section
  attributesSection: {
    gap: 6,
  },
  attributesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  attributesLabel: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  attributeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  attributeKey: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
  },
  attributeValue: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '700',
  },

  // Price Section (at bottom)
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: -0.3,
  },
  priceCurrency: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Actions - Top Right
  actionsTopRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dotActive: {
    backgroundColor: '#10B981',
  },
  dotInactive: {
    backgroundColor: '#EF4444',
  },
  quickActions: {
    gap: 8,
    marginTop: 4,
  },
  quickActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});