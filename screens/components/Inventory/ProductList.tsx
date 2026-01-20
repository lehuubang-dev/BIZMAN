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
  imageUrl?: string | number;
}

interface ProductListProps {
  selectedItems: Product[];
  onSelectProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  refreshTrigger?: number;
}

export const ProductList: React.FC<ProductListProps> = ({
  selectedItems,
  onSelectProduct,
  onUpdateProduct,
  refreshTrigger,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getToken();
      if (!token) {
        setError('Bạn cần đăng nhập để xem sản phẩm (403). ');
        return;
      }
      // Use productService to fetch and format products for display
      const displayProducts = await productService.getProductsForDisplay();
      const mapped: Product[] = displayProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        type: p.type,
        sellPrice: Math.round(p.sellPrice),
        active: p.active,
        imageUrl: p.image || require('../../../assets/default_image.svg'),
      }));
      setProducts(mapped);
    } catch (e: any) {
      // Handle ApiError from interceptor
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
    fetchProducts();
  }, [refreshTrigger]);

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

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItemCard}
      onPress={() => handleToggleExpanded(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.productItemContent}>
        <View style={styles.productImageContainer}>
          <View style={styles.productImageBox}>
            {item.imageUrl ? (
              <Image 
                source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl} 
                style={styles.productImage} 
              />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <MaterialCommunityIcons name="image-off" size={24} color={COLORS.gray400} />
              </View>
            )}
          </View>
          {/* Active/Inactive badge on image */}
          <View style={[styles.imageStatusBadge, item.active ? styles.imageStatusActive : styles.imageStatusInactive]}>
            <MaterialCommunityIcons 
              name={item.active ? "check" : "close"} 
              size={12} 
              color={COLORS.white} 
            />
          </View>
        </View>

        <View style={styles.productDetailsBox}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.productMetaContainer}>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="package-variant" size={14} color={COLORS.gray600} />
              <Text style={styles.productMeta}>{item.unit}</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="tag" size={14} color={COLORS.gray600} />
              <Text style={styles.productMeta}>{item.type}</Text>
            </View>
          </View>
        </View>

        <View style={styles.productPriceBox}>
          <Text style={styles.productPrice}>{item.sellPrice.toLocaleString('vi-VN')}</Text>
          {selectedItems.some(p => p.id === item.id) && (
            <View style={styles.checkmark}>
              <MaterialCommunityIcons
                name="check"
                size={18}
                color={COLORS.white}
              />
            </View>
          )}
        </View>
      </View>
      {/* Menu thao tác */}
      {expandedId === item.id && (
        <View style={styles.actionsBar}>
          <TouchableOpacity
            onPress={() => handleToggleActive(item)}
            style={[styles.actionButton, item.active ? styles.deactivateBtn : styles.activateBtn]}
            disabled={actionLoadingId === item.id}
          >
            <MaterialCommunityIcons
              name={item.active ? 'close-circle-outline' : 'check-circle-outline'}
              size={18}
              color={item.active ? '#DC2626' : '#16A34A'}
            />
            <Text style={[styles.actionText, { color: item.active ? '#DC2626' : '#16A34A' }]}>
              {item.active ? 'Ngừng kích hoạt' : 'Kích hoạt'}
            </Text>
          </TouchableOpacity>
          {onUpdateProduct && (
            <TouchableOpacity
              onPress={() => onUpdateProduct(item)}
              style={[styles.actionButton, styles.updateBtn]}
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color="#F59E0B" />
              <Text style={[styles.actionText, { color: '#F59E0B' }]}>Cập nhật</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onSelectProduct(item)}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons name="information-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.actionText, { color: COLORS.primary }]}>Xem</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải danh sách sản phẩm... </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 8,
          }}
          onPress={fetchProducts}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.productsSection}>
        <FlatList
          data={products}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  productsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productItemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    overflow: 'hidden',
  },
  productItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  productImageContainer: {
    position: 'relative',
    marginRight: 14,
  },
  productImageBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStatusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  imageStatusActive: {
    backgroundColor: '#16A34A',
  },
  imageStatusInactive: {
    backgroundColor: '#DC2626',
  },
  productDetailsBox: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 6,
  },
  productMetaContainer: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  productMeta: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  productPriceBox: {
    alignItems: 'flex-end',
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  activateBtn: {
    backgroundColor: '#ECFDF5',
  },
  deactivateBtn: {
    backgroundColor: '#FEF2F2',
  },
  updateBtn: {
    backgroundColor: '#FEF3C7',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
