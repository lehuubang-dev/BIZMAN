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
import { ProductVariant } from '../../../types/product';
import { COLORS } from '../../../constants/colors';

interface ProductVariantListProps {
  productId: string;
  refreshTrigger?: number;
  searchKeyword?: string;
  onEditVariant?: (variant: ProductVariant) => void;
  onCreateVariant?: () => void;
  productVariants?: ProductVariant[]; // Thêm prop này để truyền variants từ product detail
}

export const ProductVariantList: React.FC<ProductVariantListProps> = ({
  productId,
  refreshTrigger,
  searchKeyword,
  onEditVariant,
  onCreateVariant,
  productVariants,
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVariants = async (keyword?: string) => {
    console.log(' Fetching variants for productId:', productId);
    
    // Nếu có productVariants được truyền và không có search keyword
    if (productVariants && (!keyword || !keyword.trim())) {
      console.log('📋 Using provided product variants:', productVariants);
      setVariants(productVariants);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      let filteredVariants: ProductVariant[] = [];
      
      if (keyword && keyword.trim()) {
        console.log('🔍 Searching variants with keyword:', keyword);
        const variants = await productService.searchProductVariants(keyword);
        console.log('📦 Search results:', variants);
        
        // productService.searchProductVariants() bây giờ đã trả về array trực tiếp
        console.log('📋 Processed search variants:', variants);
        
        // Filter by product ID - kiểm tra variant.product.id
        filteredVariants = (variants || []).filter((variant: any) => {
          const variantProductId = variant.product?.id;
          console.log('🔍 Checking search variant:', variant.name, 'with productId:', variantProductId);
          return variantProductId === productId;
        });
      } else {
        console.log('📦 Getting all variants and filtering by productId...');
        const allVariants = await productService.getProductVariants();
        console.log('📋 All variants response:', allVariants);
        
        // productService.getProductVariants() bây giờ đã trả về array trực tiếp
        console.log('📋 Processed all variants array:', allVariants?.length, 'items');
        
        // Filter by product ID
        filteredVariants = (allVariants || []).filter((variant: any) => {
          const variantProductId = variant.product?.id;
          console.log(`🔍 Comparing variant "${variant.name}" productId: ${variantProductId} with target: ${productId}`);
          return variantProductId === productId;
        });
      }
      
      console.log('✅ Final filtered variants:', filteredVariants.length, 'items found');
      console.log('📋 Filtered variants data:', filteredVariants);
      setVariants(filteredVariants);
      
      // Nếu không tìm thấy variants, thử gọi lại với product detail
      if (filteredVariants.length === 0 && !keyword) {
        console.log('No variants found, might need to refresh product data');
      }
      
    } catch (e: any) {
      console.error('Error fetching variants:', e);
      setError(e?.message || 'Không thể tải danh sách biến thể');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVariants(searchKeyword);
    }, searchKeyword ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [refreshTrigger, searchKeyword, productId, productVariants]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderVariantItem = ({ item }: { item: ProductVariant }) => {
    return (
      <View style={styles.variantCard}>
        <View style={styles.cardHeader}>
          <View style={styles.variantInfo}>
            <Text style={styles.variantName}>{item.name}</Text>
            <Text style={styles.variantSku}>SKU: {item.sku}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            item.active ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.active ? styles.activeText : styles.inactiveText
            ]}>
              {item.active ? 'Hoạt động' : 'Tạm ngưng'}
            </Text>
          </View>
        </View>

        <View style={styles.variantDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="cube-outline" size={16} color={COLORS.gray600} />
            <Text style={styles.detailText}>{item.unit}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="cash" size={16} color={COLORS.primary} />
            <Text style={[styles.detailText, { color: COLORS.primary, fontWeight: '700' }]}>
              {formatCurrency(item.standardCost)}
            </Text>
          </View>
          
          {item.model && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="tag-outline" size={16} color={COLORS.gray600} />
              <Text style={styles.detailText}>Model: {item.model}</Text>
            </View>
          )}
          
          {item.partNumber && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="barcode" size={16} color={COLORS.gray600} />
              <Text style={styles.detailText}>PN: {item.partNumber}</Text>
            </View>
          )}
          
          {item.lastPurchaseCost && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="history" size={16} color={COLORS.gray600} />
              <Text style={styles.detailText}>Giá mua cuối: {formatCurrency(item.lastPurchaseCost)}</Text>
            </View>
          )}
        </View>

        {item.attributes && Object.keys(item.attributes).length > 0 && (
          <View style={styles.attributesSection}>
            <Text style={styles.attributesTitle}>Thuộc tính:</Text>
            <View style={styles.attributesGrid}>
              {Object.entries(item.attributes).map(([key, value]) => (
                <View key={key} style={styles.attributeChip}>
                  <Text style={styles.attributeText}>{key}: {value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEditVariant?.(item)}
          >
            <MaterialCommunityIcons name="pencil" size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>Sửa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải biến thể...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.primary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchVariants(searchKeyword)}>
          <MaterialCommunityIcons name="refresh" size={16} color={COLORS.white} />
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biến thể sản phẩm ({variants.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onCreateVariant}
        >
          <MaterialCommunityIcons name="plus" size={20} color={COLORS.white} />
          <Text style={styles.addButtonText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      {variants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="package-variant" size={48} color={COLORS.gray400} />
          <Text style={styles.emptyText}>
            {searchKeyword ? `Không tìm thấy biến thể với từ khóa "${searchKeyword}"` : 'Chưa có biến thể nào'}
          </Text>
          {!searchKeyword && (
            <Text style={styles.emptySubtext}>
              Tạo biến thể đầu tiên cho sản phẩm này
            </Text>
          )}
          <Text style={styles.debugText}>
            🔍 ProductID: {productId} | Found: {variants.length} variants
          </Text>
          <Text style={styles.debugText}>
            💡 Kiểm tra console để xem chi tiết API responses
          </Text>
        </View>
      ) : (
        <FlatList
          data={variants}
          keyExtractor={(item) => item.id}
          renderItem={renderVariantItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
  variantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  variantInfo: {
    flex: 1,
  },
  variantName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  variantSku: {
    fontSize: 13,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
  },
  inactiveBadge: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#16A34A',
  },
  inactiveText: {
    color: '#DC2626',
  },
  variantDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  attributesSection: {
    gap: 8,
  },
  attributesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attributeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attributeText: {
    fontSize: 12,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  separator: {
    height: 12,
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
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '400',
    textAlign: 'center',
  },
  debugText: {
    marginTop: 12,
    fontSize: 10,
    color: COLORS.gray400,
    fontWeight: '400',
    textAlign: 'center',
  },
});