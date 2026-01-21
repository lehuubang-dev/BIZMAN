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
import { partnerService } from '../../../services/partnerService';
import { Supplier } from '../../../types/supplier';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
  error: '#EF4444',
  success: '#10B981',
  amber: '#F59E0B',
  red600: '#DC2626',
};

interface SupplierListProps {
  suppliers: Supplier[];
  onUpdate: (supplier: Supplier) => void;
  onView: (supplier: Supplier) => void;
  onRefresh: () => void;
}

export default function SupplierList({ suppliers, onUpdate, onView, onRefresh }: SupplierListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleToggleActive = async (supplier: Supplier) => {
    setTogglingId(supplier.id);
    try {
      if (supplier.active) {
        await partnerService.unactivateSupplier(supplier.id);
      } else {
        await partnerService.activateSupplier(supplier.id);
      }
      onRefresh();
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể thay đổi trạng thái');
    } finally {
      setTogglingId(null);
    }
  };

  const renderSupplierItem = ({ item }: { item: Supplier }) => {
    const isExpanded = expandedId === item.id;
    const isToggling = togglingId === item.id;

    // Debug: Log contact info
    console.log('Supplier:', item.name);
    console.log('Phone:', item.phoneNumber);
    console.log('Email:', item.email);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.main}
          activeOpacity={0.7}
          onPress={() => handleToggleExpand(item.id)}
        >
          <View style={styles.leftContent}>
            <View style={[
              styles.iconContainer,
              item.active ? styles.iconActiveContainer : styles.iconInactiveContainer
            ]}>
              <MaterialCommunityIcons 
                name={item.supplierType === 'COMPANY' ? 'office-building' : 'account'} 
                size={20} 
                color={item.active ? COLORS.primary : COLORS.error}
              />
            </View>
            <View style={styles.content}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <View style={[
                  styles.statusDot,
                  item.active ? styles.activeDot : styles.inactiveDot
                ]} />
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoValue}>{item.code}</Text>
                </View>
                <View style={styles.typeBadge}>
                  <MaterialCommunityIcons 
                    name={item.supplierType === 'COMPANY' ? 'domain' : 'account-outline'} 
                    size={11} 
                    color={COLORS.gray600} 
                  />
                  <Text style={styles.typeText}>
                    {item.supplierType === 'COMPANY' ? 'Công ty' : 'Cá nhân'}
                  </Text>
                </View>
              </View>

              <View style={styles.contactRow}>
                {item.phoneNumber && (
                  <View style={styles.contactItem}>
                    <MaterialCommunityIcons name="phone" size={11} color={COLORS.primary} />
                    <Text style={styles.contactText}>{item.phoneNumber}</Text>
                  </View>
                )}
                {item.email && (
                  <View style={styles.contactItem}>
                    <MaterialCommunityIcons name="email" size={11} color={COLORS.primary} />
                    <Text style={styles.contactText}>{item.email}</Text>
                  </View>
                )}
              </View>

              {item.address ? (
                <View style={styles.addressRow}>
                  <MaterialCommunityIcons name="map-marker" size={11} color={COLORS.gray400} />
                  <Text style={styles.addressText} numberOfLines={2}>
                    {item.address}
                  </Text>
                </View>
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

        {isExpanded && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onUpdate(item)}
              disabled={isToggling}
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>Cập nhật</Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleActive(item)}
              disabled={isToggling}
            >
              <MaterialCommunityIcons 
                name={item.active ? 'pause-circle-outline' : 'play-circle-outline'} 
                size={18} 
                color={item.active ? COLORS.error : COLORS.success} 
              />
              <Text style={[styles.actionText, { color: item.active ? COLORS.error : COLORS.success }]}>
                {item.active ? 'Tạm ngừng' : 'Kích hoạt'}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onView(item)}
              disabled={isToggling}
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
      data={suppliers}
      keyExtractor={(item) => item.id}
      renderItem={renderSupplierItem}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="store-off-outline" size={48} color={COLORS.gray400} />
          <Text style={styles.emptyText}>Chưa có nhà cung cấp nào</Text>
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
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconActiveContainer: {
    backgroundColor: COLORS.gray50,
  },
  iconInactiveContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
    lineHeight: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: COLORS.success,
  },
  inactiveDot: {
    backgroundColor: COLORS.red600,
    borderRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  infoBadge: {
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  infoValue: {
    fontSize: 11,
    color: COLORS.gray800,
    fontWeight: '600',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  contactText: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.gray600,
    lineHeight: 15,
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