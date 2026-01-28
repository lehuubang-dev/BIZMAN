import React, { useEffect, useState } from 'react';
import { View, FlatList, ScrollView, TouchableOpacity, Text, StyleSheet, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, formatPrice } from './constants';
import { productService } from '../../../services/productService';
import { authService } from '../../../services/authService';

export interface Product {
  id: string;
  name: string;
  unit: string;
  type: string;
  sellPrice: number;
  active: boolean;
  imageUrl?: string | null;
}

interface ProductListProps {
  selectedItems: Product[];
  onSelectProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  refreshTrigger?: number;
  searchKeyword?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
  selectedItems,
  onSelectProduct,
  onUpdateProduct,
  refreshTrigger,
  searchKeyword,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProducts = async (keyword?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getToken();
      if (!token) {
        setError('Bạn cần đăng nhập để xem sản phẩm (403). ');
        return;
      }
      
      // Use search API if keyword is provided, otherwise get all products
      let allProducts;
      if (keyword && keyword.trim()) {
        console.log('Searching products with keyword:', keyword);
        allProducts = await productService.searchProducts(keyword);
      } else {
        allProducts = await productService.getProducts();
      }
      
      const mapped: Product[] = allProducts.map((p: any) => {
        const primaryImage = p.images?.find((img: any) => img.isPrimary)?.imageUrl;
        return {
          id: p.id,
          name: p.name,
          unit: p.unit,
          type: p.type,
          sellPrice: Math.round(p.sellPrice),
          active: p.active,
          imageUrl: primaryImage || null,
        };
      });
      setProducts(mapped);
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

  // Combined effect for refresh and search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(searchKeyword);
    }, searchKeyword ? 300 : 0); // Debounce only when searching

    return () => clearTimeout(timeoutId);
  }, [refreshTrigger, searchKeyword]);

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
    const configs: Record<string, { color: string; icon: string }> = {
      PRODUCT: { color: '#10B981', icon: 'package-variant' },
      SERVICE: { color: '#2196F3', icon: 'hand-heart' },
      MATERIAL: { color: '#F59E0B', icon: 'flask' },
    };
    return configs[type] || { color: '#6B7280', icon: 'cube' };
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isExpanded = expandedId === item.id;
    const isSelected = selectedItems.some(p => p.id === item.id);
    const typeConfig = getTypeConfig(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          isSelected && styles.productCardSelected,
          !item.active && styles.productCardInactive
        ]}
        onPress={() => handleToggleExpanded(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {/* Image Section */}
          <View style={styles.imageSection}>
            <View style={styles.imageWrapper}>
              {item.imageUrl ? (
                <Image 
                  source={{ uri: item.imageUrl }}
                  style={styles.productImage}
                  defaultSource={require('../../../assets/default_image.svg')}
                />
              ) : (
                <Image 
                  source={require('../../../assets/default_image.svg')}
                  style={styles.productImage}
                />
              )}
              {/* Status dot */}
              <View style={[
                styles.statusDot,
                item.active ? styles.statusDotActive : styles.statusDotInactive
              ]} />
              {/* Selection badge */}
              {isSelected && (
                <View style={styles.selectionBadge}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />
                </View>
              )}
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            
            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '15' }]}>
                <MaterialCommunityIcons 
                  name={typeConfig.icon as any}
                  size={12} 
                  color={typeConfig.color} 
                />
                <Text style={[styles.typeText, { color: typeConfig.color }]}>
                  {item.type}
                </Text>
              </View>
              <View style={styles.unitBadge}>
                <MaterialCommunityIcons name="package-variant" size={12} color={COLORS.gray600} />
                <Text style={styles.unitText}>{item.unit}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <MaterialCommunityIcons name="cash" size={16} color={COLORS.primary} />
              <Text style={styles.price}>{item.sellPrice.toLocaleString('vi-VN')}</Text>
            </View>
          </View>

          {/* Expand Icon */}
          <View style={styles.expandIcon}>
            <MaterialCommunityIcons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={COLORS.gray400} 
            />
          </View>
        </View>

        {/* Actions */}
        {isExpanded && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => onSelectProduct(item)}
              style={[styles.actionBtn, styles.viewBtn]}
            >
              <MaterialCommunityIcons name="eye-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>Chi tiết</Text>
            </TouchableOpacity>

            {onUpdateProduct && (
              <TouchableOpacity
                onPress={() => onUpdateProduct(item)}
                style={[styles.actionBtn, styles.updateBtn]}
              >
                <MaterialCommunityIcons name="pencil-outline" size={18} color="#F59E0B" />
                <Text style={[styles.actionText, { color: '#F59E0B' }]}>Cập nhật</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => handleToggleActive(item)}
              style={[styles.actionBtn, item.active ? styles.deactivateBtn : styles.activateBtn]}
              disabled={actionLoadingId === item.id}
            >
              <MaterialCommunityIcons
                name={item.active ? 'pause-circle-outline' : 'play-circle-outline'}
                size={18}
                color={item.active ? '#DC2626' : '#16A34A'}
              />
              <Text style={[styles.actionText, { color: item.active ? '#DC2626' : '#16A34A' }]}>
                {item.active ? 'Tạm ngừng' : 'Kích hoạt'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="loading" size={40} color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách sản phẩm...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.primary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts()}>
          <MaterialCommunityIcons name="refresh" size={18} color={COLORS.white} />
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.listContainer}>
        <FlatList
          data={products}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="package-variant-closed" size={64} color={COLORS.gray400} />
              <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
            </View>
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 20,
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  listContainer: {
    padding: 12,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  productCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primary + '05',
  },
  productCardInactive: {
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imageSection: {
    marginRight: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 70,
    height: 70,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotInactive: {
    backgroundColor: '#DC2626',
  },
  selectionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  unitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  expandIcon: {
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
  },
  viewBtn: {
    backgroundColor: COLORS.primary + '10',
  },
  updateBtn: {
    backgroundColor: '#FEF3C7',
  },
  activateBtn: {
    backgroundColor: '#ECFDF5',
  },
  deactivateBtn: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },
});