import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productService } from '../../../services/productService';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
  error: '#EF4444',
  amber: '#F59E0B',
};

export interface Brand {
  id: string;
  name: string;
  description: string;
}

interface BrandListProps {
  brands: Brand[];
  onUpdate: (brand: Brand) => void;
  onDelete: () => void;
}

export default function BrandList({ brands, onUpdate, onDelete }: BrandListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (brand: Brand) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa thương hiệu "${brand.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(brand.id);
            try {
              await productService.deleteBrand(brand.id);
              setExpandedId(null);
              onDelete();
            } catch (error: any) {
              Alert.alert('Lỗi', error?.message || 'Không thể xóa thương hiệu');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const renderBrandItem = ({ item }: { item: Brand }) => {
    const isExpanded = expandedId === item.id;
    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.brandCard}>
        <TouchableOpacity
          style={styles.brandMain}
          activeOpacity={0.7}
          onPress={() => handleToggle(item.id)}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="shape" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.brandContent}>
            <Text style={styles.brandName}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.brandDescription} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray400}
          />
        </TouchableOpacity>

        {/* Action Buttons */}
        {isExpanded && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.updateButton]}
              onPress={() => onUpdate(item)}
              disabled={isDeleting}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={COLORS.amber} />
              <Text style={styles.actionText}>Cập nhật</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
              disabled={isDeleting}
            >
              <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
              <Text style={[styles.actionText, { color: COLORS.error }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={brands}
      keyExtractor={(item) => item.id}
      renderItem={renderBrandItem}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="folder-open" size={64} color={COLORS.gray400} />
          <Text style={styles.emptyText}>Chưa có thương hiệu nào</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  brandCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  brandMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandContent: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  brandDescription: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  updateButton: {
    backgroundColor: '#FEF3C7',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.amber,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.gray600,
  },
});
