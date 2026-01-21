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
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={22} color={COLORS.gray800} />
          </TouchableOpacity>
          <Text style={styles.title}>Chi tiết sản phẩm</Text>
        </View>

        {loading ? (
          <View style={styles.center}> 
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
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
              style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: COLORS.primary, borderRadius: 8 }}
            >
              <Text style={{ color: COLORS.white, fontWeight: '700' }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : !product ? (
          <View style={styles.center}>
            <Text>Không tìm thấy sản phẩm</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Images */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
              {(product.images || []).map(img => (
                <Image key={img.id} source={{ uri: img.imageUrl }} style={styles.image} />
              ))}
            </ScrollView>

            {/* Basic info */}
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.desc}>{product.description}</Text>

            {/* Meta grid */}
            <View style={styles.grid}>
              <View style={styles.row}><Text style={styles.label}>Mã sản phẩm:</Text><Text style={styles.value}>{product.productCode}</Text></View>
              <View style={styles.row}><Text style={styles.label}>SKU:</Text><Text style={styles.value}>{product.sku}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Danh mục:</Text><Text style={styles.value}>{product.productCategory?.name}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Nhóm:</Text><Text style={styles.value}>{product.productGroup?.name}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Thương hiệu:</Text><Text style={styles.value}>{product.brand?.name}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Loại:</Text><Text style={styles.value}>{product.type}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Đơn vị:</Text><Text style={styles.value}>{product.unit}</Text></View>
              {product.model ? <View style={styles.row}><Text style={styles.label}>Model:</Text><Text style={styles.value}>{product.model}</Text></View> : null}
              {product.partNumber ? <View style={styles.row}><Text style={styles.label}>Part Number:</Text><Text style={styles.value}>{product.partNumber}</Text></View> : null}
              {product.serialNumber ? <View style={styles.row}><Text style={styles.label}>Serial Number:</Text><Text style={styles.value}>{product.serialNumber}</Text></View> : null}
              <View style={styles.row}><Text style={styles.label}>Tồn tối thiểu:</Text><Text style={styles.value}>{product.minStock}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Giá vốn:</Text><Text style={styles.value}>{Math.round(product.costPrice).toLocaleString('vi-VN')}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Giá bán:</Text><Text style={[styles.value, { color: COLORS.primary, fontWeight: '700' }]}>{Math.round(product.sellPrice).toLocaleString('vi-VN')}</Text></View>
              <View style={styles.row}>
                <Text style={styles.label}>Trạng thái:</Text>
                <View style={[styles.statusChip, product.active ? styles.statusActive : styles.statusInactive]}>
                  <MaterialCommunityIcons name={product.active ? 'check' : 'close'} size={14} color={COLORS.white} />
                  <Text style={styles.statusText}>{product.active ? 'Hoạt động' : 'Ngừng'}</Text>
                </View>
              </View>
            </View>

            {/* Tags */}
            {product.tags?.length ? (
              <View style={styles.tagsRow}>
                {product.tags.map(tag => (
                  <View key={tag.id} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag.name}</Text>
                  </View>
                ))}
              </View>
            ) : null}
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
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    width: '94%',
    maxHeight: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  closeBtn: {
    padding: 6,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gray800,
  },
  center: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  imagesRow: {
    flexGrow: 0,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: COLORS.gray100,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray800,
  },
  desc: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    color: COLORS.gray800,
    fontWeight: '700',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusActive: {
    backgroundColor: '#16A34A',
  },
  statusInactive: {
    backgroundColor: '#DC2626',
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '700',
  },
});
