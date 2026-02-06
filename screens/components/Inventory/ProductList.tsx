import React, { useEffect, useState } from 'react';
import { View, FlatList, ScrollView, TouchableOpacity, Text, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { productService } from '../../../services/productService';
import { authService } from '../../../services/authService';
import ProductDetail from './ProductDetail';

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  type: string;
  active: boolean;
  imageUrl?: string | null;
  categoryName?: string;
  profitMargin?: number;
  brandName?: string;
  tags?: Array<{ id: string; name: string }>;
  variants?: Array<{
    id: string;
    sku: string;
    name: string;
    model?: string;
    unit: string;
    standardCost: number;
    attributes?: Record<string, any>;
  }>;
  unit?: string;
  sellPrice?: number;
  createdAt?: string; // Thêm trường createdAt
}

interface ProductListProps {
  selectedItems: Product[];
  onSelectProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onViewDetail?: (productId: string) => void;
  refreshTrigger?: number;
  searchKeyword?: string;
  filterTags?: string[];
}

export const ProductList: React.FC<ProductListProps> = ({
  selectedItems,
  onSelectProduct,
  onUpdateProduct,
  onViewDetail,
  refreshTrigger,
  searchKeyword,
  filterTags,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProducts = async (keyword?: string, tags?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getToken();
      if (!token) {
        setError('Bạn cần đăng nhập để xem sản phẩm (403).');
        return;
      }
      
      let allProducts;
      if (tags && tags.length > 0) {
        allProducts = await productService.getProductsByTags(tags);
      } else if (keyword && keyword.trim()) {
        allProducts = await productService.searchProducts(keyword);
      } else {
        allProducts = await productService.getProducts();
      }
      
      const mapped: Product[] = allProducts.map((p: any) => {
        const primaryImage = p.images?.find((img: any) => img.isPrimary)?.imageUrl;
        const firstVariant = p.variants?.[0];
        
        return {
          id: p.id,
          code: p.code,
          name: p.name,
          description: p.description,
          type: p.type,
          active: p.active,
          imageUrl: primaryImage || null,
          categoryName: p.productCategory?.name,
          profitMargin: p.productCategory?.profitMargin,
          brandName: p.brand?.name,
          tags: p.tags || [],
          variants: p.variants || [],
          unit: firstVariant?.unit || 'Chiếc',
          sellPrice: firstVariant?.standardCost || 0,
          createdAt: p.createdAt, // Thêm thời gian tạo
        };
      });
      
      // Sắp xếp theo thời gian tạo - sản phẩm mới nhất lên đầu
      const sortedProducts = mapped.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0; // Giữ nguyên thứ tự nếu không có createdAt
      });
      
      setProducts(sortedProducts);
    } catch (e: any) {
      if (e?.status === 403) {
        setError('Không có quyền truy cập (403). Vui lòng đăng nhập lại.');
      } else {
        setError(e?.message || 'Không thể tải danh sách sản phẩm');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(searchKeyword, filterTags);
    }, searchKeyword ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [refreshTrigger, searchKeyword, filterTags]);

  const handleToggleExpanded = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleToggleActive = async (item: Product) => {
    try {
      setActionLoadingId(item.id);
      if (item.active) {
        await productService.deactivateProduct(item.id);
      } else {
        await productService.activateProduct(item.id);
      }
      setProducts(prev => prev.map(p => (p.id === item.id ? { ...p, active: !item.active } : p)));
      setExpandedId(null);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Không thể cập nhật trạng thái sản phẩm');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { color: string; icon: string; label: string }> = {
      PHYSICAL: { color: '#10B981', icon: 'package-variant', label: 'Vật lý' },
      DIGITAL: { color: '#3B82F6', icon: 'cloud-download', label: 'Số' },
      SERVICE: { color: '#F59E0B', icon: 'hand-heart', label: 'Dịch vụ' },
      // Backward compatibility
      PRODUCT: { color: '#10B981', icon: 'package-variant', label: 'Sản phẩm' },
      MATERIAL: { color: '#F59E0B', icon: 'flask', label: 'Nguyên liệu' },
    };
    return configs[type] || { color: '#6B7280', icon: 'cube', label: type };
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isExpanded = expandedId === item.id;
    const isSelected = selectedItems.some(p => p.id === item.id);
    const typeConfig = getTypeConfig(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          !item.active && styles.cardInactive
        ]}
        onPress={() => handleToggleExpanded(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardMain}>
          {/* Image with overlay badges */}
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image 
                source={{ uri: item.imageUrl }}
                style={styles.image}
                defaultSource={require('../../../assets/default_image.svg')}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="image-outline" size={32} color="#D1D5DB" />
              </View>
            )}
            
            {/* Status indicator */}
            <View style={[styles.statusBadge, item.active ? styles.statusActive : styles.statusInactive]}>
              <View style={styles.statusDot} />
            </View>

            {/* Selection checkmark */}
            {isSelected && (
              <View style={styles.checkmark}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Header: Name only */}
            <View style={styles.header}>
              <View style={styles.nameSection}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                
                {/* Compact metadata row */}
                <View style={styles.metaRow}>
                  <View style={[styles.typeChip, { backgroundColor: typeConfig.color + '15' }]}>
                    <MaterialCommunityIcons name={typeConfig.icon as any} size={11} color={typeConfig.color} />
                    <Text style={[styles.typeLabel, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                  </View>
                  
                  {item.variants && item.variants.length > 1 && (
                    <View style={styles.variantChip}>
                      <MaterialCommunityIcons name="tune-variant" size={11} color="#8B5CF6" />
                      <Text style={styles.variantLabel}>{item.variants.length}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Expand indicator moved to header */}
              <View style={styles.expandIndicator}>
                <MaterialCommunityIcons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={18} 
                  color="#9CA3AF" 
                />
              </View>
            </View>

            {/* Tags & Category in one compact row */}
            <View style={styles.infoRow}>
              {item.brandName && (
                <View style={styles.infoBadge}>
                  <MaterialCommunityIcons name="star" size={10} color="#F59E0B" />
                  <Text style={styles.infoText}>{item.brandName}</Text>
                </View>
              )}
              
              {item.categoryName && (
                <View style={styles.infoBadge}>
                  <MaterialCommunityIcons name="tag" size={10} color="#6B7280" />
                  <Text style={styles.infoText}>{item.categoryName}</Text>
                </View>
              )}

              {item.tags && item.tags.length > 0 && (
                <View style={styles.infoBadge}>
                  <MaterialCommunityIcons name="label" size={10} color="#8B5CF6" />
                  <Text style={styles.infoText}>
                    {item.tags[0].name}
                    {item.tags.length > 1 && ` +${item.tags.length - 1}`}
                  </Text>
                </View>
              )}
            </View>

            {/* Price section moved to bottom */}
            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <MaterialCommunityIcons name="cash" size={16} color="#059669" />
                <Text style={styles.price}>
                  {(item.sellPrice || 0).toLocaleString('vi-VN')}
                </Text>
              </View>
             
            </View>
          </View>
        </View>

        {/* Expanded actions */}
        {isExpanded && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onSelectProduct(item)}
              style={[styles.actionButton, styles.actionView]}
            >
              <MaterialCommunityIcons name="eye" size={16} color="#3B82F6" />
              <Text style={styles.actionTextView}>Chi tiết</Text>
            </TouchableOpacity>

            {onUpdateProduct && (
              <TouchableOpacity
                onPress={() => onUpdateProduct(item)}
                style={[styles.actionButton, styles.actionEdit]}
              >
                <MaterialCommunityIcons name="pencil" size={16} color="#F59E0B" />
                <Text style={styles.actionTextEdit}>Sửa</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => handleToggleActive(item)}
              style={[styles.actionButton, item.active ? styles.actionDeactivate : styles.actionActivate]}
              disabled={actionLoadingId === item.id}
            >
              {actionLoadingId === item.id ? (
                <ActivityIndicator size="small" color={item.active ? '#DC2626' : '#10B981'} />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={item.active ? 'pause' : 'play'}
                    size={16}
                    color={item.active ? '#DC2626' : '#10B981'}
                  />
                  <Text style={item.active ? styles.actionTextDeactivate : styles.actionTextActivate}>
                    {item.active ? 'Tắt' : 'Bật'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
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
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts()}>
          <MaterialCommunityIcons name="refresh" size={18} color="#FFF" />
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <FlatList
        data={products}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant-closed" size={72} color="#D1D5DB" />
            <Text style={styles.emptyText}>Chưa có sản phẩm</Text>
          </View>
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
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
  cardSelected: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  cardInactive: {
    opacity: 0.5,
  },
  cardMain: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#10B981',
  },
  statusInactive: {
    backgroundColor: '#EF4444',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  checkmark: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameSection: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#F5F3FF',
    borderRadius: 6,
  },
  variantLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  priceSection: {
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: -0.3,
  },
  skuText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 2,
  },
  currency: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  expandIndicator: {
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  actionView: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  actionTextView: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  actionEdit: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  actionTextEdit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  actionActivate: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  actionTextActivate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  actionDeactivate: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionTextDeactivate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});