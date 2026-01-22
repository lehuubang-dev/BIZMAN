import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  FlatList,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Warehouse, WarehouseProduct } from '../../../types/warehouse';
import { warehouseService } from '../../../services/warehouseService';
import GoodsDetail from './GoodsDetail';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

interface WarehouseDetailProps {
  visible: boolean;
  warehouse: Warehouse | null;
  onClose: () => void;
}

export default function WarehouseDetail({ visible, warehouse, onClose }: WarehouseDetailProps) {
  const [products, setProducts] = useState<WarehouseProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showGoodsDetail, setShowGoodsDetail] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (visible && warehouse) {
      setSearchQuery('');
      loadProducts();
    }
  }, [visible, warehouse]);

  const loadProducts = async (filter?: string) => {
    if (!warehouse) return;
    
    setLoading(true);
    try {
      let data;
      if (filter && filter.trim()) {
        data = await warehouseService.searchWarehouseProducts(warehouse.id, filter.trim());
      } else {
        data = await warehouseService.getWarehouseProducts(warehouse.id);
      }
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounce (500ms)
    const timeout = setTimeout(() => {
      loadProducts(text);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    loadProducts();
  };

  const handleProductPress = (productId: string) => {
    setSelectedProductId(productId);
    setShowGoodsDetail(true);
  };

  if (!warehouse) return null;

  const getTypeLabel = (type: string) => {
    return type === 'MAIN' ? 'Kho chính' : 'Kho tạm';
  };

  const getTypeColor = (type: string) => {
    return type === 'MAIN' ? COLORS.primary : COLORS.warning;
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString('vi-VN');
  };

  const renderProductItem = ({ item }: { item: WarehouseProduct }) => {
    const primaryImage = item.images.find(img => img.isPrimary);
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.7}
      >
        {primaryImage && (
          <Image 
            source={{ uri: `http://192.168.5.109:8080${primaryImage.imageUrl}` }}
            style={styles.productImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productSku}>SKU: {item.sku}</Text>
          
          <View style={styles.productRow}>
            <View style={styles.productBadge}>
              <MaterialCommunityIcons name="package-variant" size={12} color={COLORS.gray600} />
              <Text style={styles.badgeText}>SL: {item.quantity} {item.unit}</Text>
            </View>
            <View style={styles.productBadge}>
              <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.primary} />
              <Text style={styles.badgeText}>{item.location}</Text>
            </View>
          </View>

          <Text style={styles.productPrice}>{formatCurrency(item.sellPrice)}</Text>

          {item.expiredDate && (
            <View style={styles.expiryRow}>
              <MaterialCommunityIcons name="calendar-alert" size={12} color={COLORS.warning} />
              <Text style={styles.expiryText}>
                HSD: {new Date(item.expiredDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
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
            <Text style={styles.headerTitle}>Chi tiết kho hàng</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Warehouse Info */}
            <View style={styles.infoCard}>
              <View style={[styles.iconCircle, { borderColor: getTypeColor(warehouse.type) }]}>
                <MaterialCommunityIcons 
                  name={warehouse.type === 'MAIN' ? 'warehouse' : 'archive'}
                  size={32} 
                  color={getTypeColor(warehouse.type)}
                />
              </View>

              <Text style={styles.warehouseName}>{warehouse.name}</Text>

              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(warehouse.type) + '15' }]}>
                <Text style={[styles.typeText, { color: getTypeColor(warehouse.type) }]}>
                  {getTypeLabel(warehouse.type)}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="information" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Thông tin</Text>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Địa chỉ</Text>
                  <Text style={styles.infoValue}>{warehouse.address}</Text>
                </View>

                {warehouse.description && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Mô tả</Text>
                    <Text style={styles.infoValue}>{warehouse.description}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Products List */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="package-variant-closed" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>
                  Danh sách hàng hóa ({products.length})
                </Text>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                  <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray400} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm theo tên, SKU..."
                    placeholderTextColor={COLORS.gray400}
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                      <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.gray400} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : products.length > 0 ? (
                <FlatList
                  data={products}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  renderItem={renderProductItem}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              ) : (
                <View style={styles.emptyProducts}>
                  <MaterialCommunityIcons name="package-variant" size={32} color={COLORS.gray400} />
                  <Text style={styles.emptyText}>Kho chưa có hàng hóa</Text>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footerCard}>
              <View style={styles.footerItem}>
                <MaterialCommunityIcons name="clock-plus-outline" size={14} color={COLORS.gray400} />
                <Text style={styles.footerLabel}>Ngày tạo:</Text>
                <Text style={styles.footerValue}>
                  {new Date(warehouse.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <MaterialCommunityIcons name="clock-edit-outline" size={14} color={COLORS.gray400} />
                <Text style={styles.footerLabel}>Cập nhật:</Text>
                <Text style={styles.footerValue}>
                  {new Date(warehouse.updatedAt).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <GoodsDetail
        visible={showGoodsDetail}
        productId={selectedProductId}
        warehouseId={warehouse?.id || null}
        onClose={() => {
          setShowGoodsDetail(false);
          setSelectedProductId(null);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '94%',
    backgroundColor: COLORS.gray50,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  closeButton: {
    padding: 2,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warehouseName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
    textAlign: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  infoItem: {
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '600',
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  productCard: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  productImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
    lineHeight: 18,
  },
  productSku: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 6,
  },
  productRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  productBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 4,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    fontSize: 10,
    color: COLORS.warning,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 12,
  },
  emptyProducts: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.gray600,
    width: '100%',
    textAlign: 'center',
  },
  footerCard: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  footerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    marginRight: 4,
    width: 60,
  },
  footerValue: {
    fontSize: 11,
    color: COLORS.gray800,
    fontWeight: '600',
  },
  footerDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 12,
  },
  searchContainer: {
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: COLORS.gray800,
  },
  clearButton: {
    padding: 4,
  },
});
