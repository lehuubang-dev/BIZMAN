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
import { Warehouse } from '../../../types/warehouse';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

interface WarehouseListProps {
  warehouses: Warehouse[];
  onUpdate: (warehouse: Warehouse) => void;
  onView: (warehouse: Warehouse) => void;
  onDelete: (id: string, name: string) => void;
}

export default function WarehouseList({ warehouses, onUpdate, onView, onDelete }: WarehouseListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'MAIN':
        return { label: 'Kho chính', color: COLORS.primary, icon: 'warehouse' };
      case 'TEMP':
        return { label: 'Kho tạm', color: COLORS.warning, icon: 'archive' };
      default:
        return { label: type, color: COLORS.gray600, icon: 'package-variant' };
    }
  };

  const renderWarehouseItem = ({ item }: { item: Warehouse }) => {
    const typeConfig = getTypeConfig(item.type);
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.main}
          activeOpacity={0.7}
          onPress={() => handleToggleExpand(item.id)}
        >
          <View style={styles.leftContent}>
            <View style={[styles.iconContainer, { backgroundColor: typeConfig.color + '15' }]}>
              <MaterialCommunityIcons 
                name={typeConfig.icon as any}
                size={24} 
                color={typeConfig.color}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              
              <View style={styles.typeBadge}>
                <MaterialCommunityIcons 
                  name={typeConfig.icon as any}
                  size={11} 
                  color={typeConfig.color}
                />
                <Text style={[styles.typeText, { color: typeConfig.color }]}>
                  {typeConfig.label}
                </Text>
              </View>

              <View style={styles.addressRow}>
                <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.gray600} />
                <Text style={styles.addressText} numberOfLines={2}>
                  {item.address}
                </Text>
              </View>

              {item.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>

          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray400}
            style={styles.chevron}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onUpdate(item)}
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>Cập nhật</Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(item.id, item.name)}
            >
              <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.error} />
              <Text style={[styles.actionText, { color: COLORS.error }]}>Xóa</Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onView(item)}
            >
              <MaterialCommunityIcons name="eye-outline" size={18} color={COLORS.gray600} />
              <Text style={[styles.actionText, { color: COLORS.gray600 }]}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={warehouses}
      keyExtractor={(item) => item.id}
      renderItem={renderWarehouseItem}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="warehouse" size={48} color={COLORS.gray400} />
          <Text style={styles.emptyText}>Chưa có kho hàng nào</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    overflow: 'hidden',
  },
  main: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 6,
    lineHeight: 20,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginBottom: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 16,
  },
  description: {
    fontSize: 11,
    color: COLORS.gray600,
    fontStyle: 'italic',
  },
  chevron: {
    marginLeft: 8,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    backgroundColor: COLORS.white,
  },
  actionDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
});
