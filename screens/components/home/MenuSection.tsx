import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Package, Truck, ArrowRightLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  color: string;
}

export interface MenuCardProps {
  item: MenuItem;
  isActive: boolean;
  onPress: () => void;
}

export const menuItems: MenuItem[] = [
  { id: 'nhap', label: 'Nhập kho', icon: Package, color: '#10B981' },
  { id: 'xuat', label: 'Xuất kho', icon: Truck, color: '#F59E0B' },
  { id: 'dieuchuyen', label: 'Điều chuyển', icon: ArrowRightLeft, color: '#8B5CF6' },
];

export const MenuCard = ({ item, isActive, onPress }: MenuCardProps) => {
  const Icon = item.icon;
  return (
    <TouchableOpacity
      style={[
        styles.menuCard,
        isActive && [styles.menuCardActive],
      ]}
      onPress={onPress}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
        <Icon width={28} height={28} color="#FFFFFF" strokeWidth={2} />
      </View>
      <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};

export const MenuContainer = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (id: string) => void }) => (
  <View style={styles.menuContainer}>
    <View style={styles.menuBackground}>
      {menuItems.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          isActive={activeTab === item.id}
          onPress={() => onTabChange(item.id)}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  menuContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuBackground: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  menuCardActive: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  menuLabelActive: {
    color: '#111827',
    fontWeight: '700',
  },
});
