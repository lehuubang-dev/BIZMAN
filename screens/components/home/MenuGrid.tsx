import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MenuItem as MenuItemType } from '../../../types';

const { width } = Dimensions.get('window');
const PADDING = 12;
const GAP = 20;
const CONTAINER_WIDTH = width - PADDING * 5;
const ITEM_WIDTH = (CONTAINER_WIDTH - GAP * 2) / 3;

const COLORS = {
  gray800: '#1F2937',
};

interface MenuItemProps {
  item: MenuItemType;
  onCategoryPress?: () => void;
  onBrandPress?: () => void;
  onGroupPress?: () => void;
  onSupplierPress?: () => void;
  onCashFlowPress?: () => void;
  onWarehousePress?: () => void;
  onImportGoodPress?: () => void;
  onContractPress?: () => void;
}

// MenuItem Component
const MenuItem = ({ item, onCategoryPress, onBrandPress, onGroupPress, onSupplierPress, onCashFlowPress, onWarehousePress, onImportGoodPress, onContractPress }: MenuItemProps) => {
  const handlePress = () => {
    if (item.label === 'Danh mục' && onCategoryPress) {
      onCategoryPress();
    } else if (item.label === 'Thương hiệu' && onBrandPress) {
      onBrandPress();
    } else if (item.label === 'Nhóm hàng hóa' && onGroupPress) {
      onGroupPress();
    } else if (item.label === 'Nhà cung cấp' && onSupplierPress) {
      onSupplierPress();
    } else if (item.label === 'Ghi nhận thu chi' && onCashFlowPress) {
      onCashFlowPress();
    } else if (item.label === 'Kho hàng' && onWarehousePress) {
      onWarehousePress();
    } else if (item.label === 'Nhập hàng' && onImportGoodPress) {
      onImportGoodPress();
    } else if (item.label === 'Hợp đồng' && onContractPress) {
      onContractPress();
    }
    // Add more handlers here for other menu items
  };

  return (
    <View style={{ width: ITEM_WIDTH, alignItems: 'center' }}>
      <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={handlePress}>
        <View style={[styles.menuIconContainer, { backgroundColor: item.bgColor }]}>
          <MaterialCommunityIcons 
            name={item.iconName}
            size={32} 
            color={item.iconColor} 
          />
        </View>
        <Text style={styles.menuLabel}>{item.label}</Text>
      </TouchableOpacity>
    </View>
  );
};

interface MenuGridProps {
  items: MenuItemType[];
  onCategoryPress?: () => void;
  onBrandPress?: () => void;
  onGroupPress?: () => void;
  onSupplierPress?: () => void;
  onCashFlowPress?: () => void;
  onWarehousePress?: () => void;
  onImportGoodPress?: () => void;
  onContractPress?: () => void;
}

// MenuGrid Component
export const MenuGrid = ({ items, onCategoryPress, onBrandPress, onGroupPress, onSupplierPress, onCashFlowPress, onWarehousePress, onImportGoodPress, onContractPress }: MenuGridProps) => {
  const ITEMS_PER_PAGE = 9;
  const pageCount = Math.ceil(items.length / ITEMS_PER_PAGE);
  const pages = [];

  for (let i = 0; i < pageCount; i++) {
    const startIndex = i * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, items.length);
    pages.push(items.slice(startIndex, endIndex));
  }

  if (pageCount === 1) {
    // Single page - no scrolling needed
    return (
      <View style={styles.menuGridContainer}>
        <View style={styles.menuGrid}>
          {items.map((item) => (
            <MenuItem key={item.id} item={item} onCategoryPress={onCategoryPress} onBrandPress={onBrandPress} onGroupPress={onGroupPress} onSupplierPress={onSupplierPress} onCashFlowPress={onCashFlowPress} onWarehousePress={onWarehousePress} onImportGoodPress={onImportGoodPress} onContractPress={onContractPress} />
          ))}
        </View>
      </View>
    );
  }

  // Multiple pages - enable horizontal scrolling
  return (
    <View style={styles.menuGridContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {pages.map((pageItems, pageIndex) => (
          <View key={pageIndex} style={[styles.menuGrid, { width: width - PADDING * 4 }]}>
            {pageItems.map((item) => (
              <MenuItem key={item.id} item={item} onCategoryPress={onCategoryPress} onBrandPress={onBrandPress} onGroupPress={onGroupPress} onSupplierPress={onSupplierPress} onCashFlowPress={onCashFlowPress} onWarehousePress={onWarehousePress} onImportGoodPress={onImportGoodPress} onContractPress={onContractPress} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  menuGridContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: PADDING,
    marginBottom: 20,
  },
  scrollView: {
    flexGrow: 0,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    justifyContent: 'flex-start',
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray800,
    textAlign: 'center',
    lineHeight: 14,
  },
});
