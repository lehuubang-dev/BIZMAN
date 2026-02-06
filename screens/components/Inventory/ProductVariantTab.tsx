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

interface ProductVariantTabProps {
  refreshTrigger?: number;
  searchKeyword?: string;
}

export const ProductVariantTab: React.FC<ProductVariantTabProps> = ({
  refreshTrigger,
  searchKeyword,
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>([]);

  const fetchVariants = async (keyword?: string) => {
    console.log(' Fetching all product variants...');
    
    setLoading(true);
    setError(null);
    try {
      let allVariants: any[] = [];
      
      if (keyword && keyword.trim()) {
        console.log('🔍 Searching variants with keyword:', keyword);
        allVariants = await productService.searchProductVariants(keyword);
      } else {
        console.log('📦 Getting all variants...');
        allVariants = await productService.getProductVariants();
      }
      
      console.log('📋 Fetched variants:', allVariants?.length, 'items');
      console.log('📋 Sample variant data:', allVariants?.[0]);
      
      // Transform data to match ProductVariant interface
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
      
      setVariants(transformedVariants);
      
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
  }, [refreshTrigger, searchKeyword]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariants(prev => {
      const isSelected = prev.some(v => v.id === variant.id);
      if (isSelected) {
        return prev.filter(v => v.id !== variant.id);
      } else {
        return [...prev, variant];
      }
    });
  };

  const renderVariantItem = ({ item }: { item: ProductVariant }) => {
    const isSelected = selectedVariants.some(v => v.id === item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.variantCard,
          isSelected && styles.variantCardSelected,
          !item.active && styles.variantCardInactive
        ]}
        onPress={() => handleSelectVariant(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.variantInfo}>
            <Text style={styles.variantName}>{item.name}</Text>
            {item.supplier?.name && (
              <Text style={styles.supplierName}>{item.supplier.name}</Text>
            )}
          </View>
          
          <View style={styles.cardActions}>
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

            {isSelected && (
              <View style={styles.selectedBadge}>
                <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
              </View>
            )}
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
          
        </View>

        {item.attributes && Object.keys(item.attributes).length > 0 && (
          <View style={styles.attributesSection}>
            <View style={styles.attributesGrid}>
              {Object.entries(item.attributes).slice(0, 3).map(([key, value]) => (
                <View key={key} style={styles.attributeChip}>
                  <Text style={styles.attributeText}>{key}: {value}</Text>
                </View>
              ))}
              {Object.keys(item.attributes).length > 3 && (
                <View style={styles.attributeChip}>
                  <Text style={styles.attributeText}>+{Object.keys(item.attributes).length - 3} khác</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
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
     

      {variants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="package-variant" size={64} color={COLORS.gray400} />
          <Text style={styles.emptyText}>
            {searchKeyword ? `Không tìm thấy biến thể với từ khóa "${searchKeyword}"` : 'Chưa có biến thể nào'}
          </Text>
          <Text style={styles.emptySubtext}>
            Biến thể sẽ hiển thị ở đây khi có dữ liệu từ API
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  selectedCounter: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
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
  listContent: {
    padding: 16,
  },
  variantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: 14,
    gap: 8,
  },
  variantCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primary + '05',
  },
  variantCardInactive: {
    opacity: 0.6,
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
    marginBottom: 2,
  },
  productName: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  supplierName: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 8,
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
  selectedBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  variantDetails: {
    gap: 6,
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
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attributeText: {
    fontSize: 12,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray600,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray500,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
});