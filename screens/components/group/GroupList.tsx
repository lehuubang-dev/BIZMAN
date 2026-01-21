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

export interface Group {
  id: string;
  groupId: string;
  name: string;
  description: string;
  jobType: string;
  gtgttax: number;
  tncnntax: number;
}

interface GroupListProps {
  groups: Group[];
  onUpdate: (group: Group) => void;
  onDelete: () => void;
}

export default function GroupList({ groups, onUpdate, onDelete }: GroupListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (group: Group) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa nhóm "${group.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(group.id);
            try {
              await productService.deleteGroup(group.id);
              setExpandedId(null);
              onDelete();
            } catch (error: any) {
              Alert.alert('Lỗi', error?.message || 'Không thể xóa nhóm hàng hóa');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const renderGroupItem = ({ item }: { item: Group }) => {
    const isExpanded = expandedId === item.id;
    const isDeleting = deletingId === item.id;
    return (
      <View style={styles.groupCard}>
        <TouchableOpacity
          style={styles.groupMain}
          activeOpacity={0.7}
          onPress={() => handleToggle(item.id)}
        >
          <View style={styles.leftContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="package-variant" size={40} color={COLORS.primary} />
            </View>
            <View style={styles.groupContent}>
              <Text style={styles.groupName}>{item.name}</Text>
              
              <View style={styles.infoRow}>
                {item.jobType && (
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoValue}>{item.jobType}</Text>
                  </View>
                )}
              </View>

              <View style={styles.taxRow}>
                <View style={styles.taxItem}>
                  <Text style={styles.taxLabel}>GTGT</Text>
                  <Text style={styles.taxValue}>{(item.gtgttax ).toFixed(0)}%</Text>
                </View>
                <View style={styles.taxDivider} />
                <View style={styles.taxItem}>
                  <Text style={styles.taxLabel}>TNCN</Text>
                  <Text style={styles.taxValue}>{(item.tncnntax).toFixed(0)}%</Text>
                </View>
              </View>

              {item.description ? (
                <Text style={styles.groupDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
          </View>

          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray400}
            style={styles.chevron}
          />
        </TouchableOpacity>
        {/* Menu thao tác */}
        {isExpanded && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.updateButton]}
              onPress={() => onUpdate(item)}
              disabled={isDeleting}
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>Cập nhật</Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
              disabled={isDeleting}
            >
              <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.error} />
              <Text style={[styles.actionText, { color: COLORS.error }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id}
      renderItem={renderGroupItem}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="package-variant-closed" size={48} color={COLORS.gray400} />
          <Text style={styles.emptyText}>Chưa có nhóm hàng hóa nào</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 12,
  },
  groupCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    overflow: 'hidden',
  },
  groupMain: {
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
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  groupContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 6,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 11,
    color: COLORS.gray800,
    fontWeight: '600',
  },
  taxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  taxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taxLabel: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  taxValue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  taxDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.gray200,
  },
  groupDescription: {
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 16,
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
  },
  updateButton: {
    backgroundColor: COLORS.white,
  },
  deleteButton: {
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