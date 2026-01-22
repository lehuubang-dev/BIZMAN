import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  RevenueCard, 
  MenuGrid 
} from './components/home';
import CategoryScreen from './CategoryScreen';
import BrandScreen from './BrandScreen';
import GroupScreen from './GroupScreen';
import SupplierScreen from './SupplierScreen';
import CashFlowScreen from './CashFlowScreen';
import WarehouseScreen from './WarehouseScreen';
import ImportGoodScreen from './ImportGoodScreen';
import ContractScreen from './ContractScreen';
import { MenuItem as MenuItemType } from '../types';

const { width } = Dimensions.get('window');
const PADDING = 12;

const COLORS = {
  white: '#FFFFFF',
};

const menuItems: MenuItemType[] = [
  {
    id: 1,
    label: 'Bán hàng',
    iconName: 'plus-circle',
    bgColor: '#E0E7FF',
    iconColor: '#6366F1',
  },
  {
    id: 2,
    label: 'Tồn kho',
    iconName: 'alert-circle',
    bgColor: '#F3E8FF',
    iconColor: '#D946EF',
  },
  {
    id: 3,
    label: 'Nhập hàng',
    iconName: 'package-variant',
    bgColor: '#DCFCE7',
    iconColor: '#22C55E',
  },
  {
    id: 4,
    label: 'Kho hàng',
    iconName: 'home-city',
    bgColor: '#A7F3D0',
    iconColor: '#10B981',
  },
  {
    id: 5,
    label: 'Kế khai\nthuế',
    iconName: 'file-document',
    bgColor: '#FEF08A',
    iconColor: '#CA8A04',
  },
  {
    id: 6,
    label: 'Số kế toán',
    iconName: 'chart-bar',
    bgColor: '#FECACA',
    iconColor: '#DC2626',
  },
  {
    id: 7,
    label: 'Đối trả\nhàng hóa',
    iconName: 'redo',
    bgColor: '#FFDDCC',
    iconColor: '#EA580C',
  },
  {
    id: 8,
    label: 'Hướng dẫn',
    iconName: 'robot-happy',
    bgColor: '#A5F3FC',
    iconColor: '#0891B2',
  },
  {
    id: 9,
    label: 'Hợp đồng',
    iconName: 'file-document-edit',
    bgColor: '#E0E7FF',
    iconColor: '#6366F1',
  },
  {
    id: 10,
    label: 'Ghi nhận thu chi',
    iconName: 'cash-multiple',
    bgColor: '#DCFCE7',
    iconColor: '#22C55E',
  },
  {
    id: 11,
    label: 'Danh mục',
    iconName: 'format-list-bulleted',
    bgColor: '#FEF08A',
    iconColor: '#CA8A04',
  },
  {
    id: 12,
    label: 'Thương hiệu',
    iconName: 'store',
    bgColor: '#F3E8FF',
    iconColor: '#D946EF',
  },
  {
    id: 13,
    label: 'Nhóm hàng hóa',
    iconName: 'group',
    bgColor: '#A5F3FC',
    iconColor: '#0891B2',
  },
   {
  id: 14,
  label: 'Nhà cung cấp',
  iconName: 'handshake-outline',
  bgColor: '#E0F2FE',
  iconColor: '#0284C7',
}
];

// Main HomeScreen Component
export default function HomeScreen() {
  const [showCategory, setShowCategory] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [showSupplier, setShowSupplier] = useState(false);
  const [showCashFlow, setShowCashFlow] = useState(false);
  const [showWarehouse, setShowWarehouse] = useState(false);
  const [showImportGood, setShowImportGood] = useState(false);
  const [showContract, setShowContract] = useState(false);

  if (showContract) {
    return (
      <View style={styles.container}>
        <View style={styles.backHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowContract(false)}
          >
            <MaterialCommunityIcons name="close" size={26} color="#2196F3" />
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>Hợp đồng</Text>
        </View>
        <ContractScreen />
      </View>
    );
  }

  if (showWarehouse) {
    return (
      <View style={styles.container}>
        <View style={styles.backHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowWarehouse(false)}
          >
            <MaterialCommunityIcons name="close" size={26} color="#2196F3" />
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>Kho hàng</Text>
        </View>
        <WarehouseScreen />
      </View>
    );
  }

  if (showImportGood) {
    return (
      <View style={styles.container}>
        <View style={styles.backHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowImportGood(false)}
          >
            <MaterialCommunityIcons name="close" size={26} color="#2196F3" />
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>Nhập hàng</Text>
        </View>
        <ImportGoodScreen />
      </View>
    );
  }

  if (showCashFlow) {
    return (
      <View style={styles.container}>
        <View style={styles.backHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowCashFlow(false)}
          >
            <MaterialCommunityIcons name="close" size={26} color="#2196F3" />
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>Ghi nhận thu chi</Text>
        </View>
        <CashFlowScreen />
      </View>
    );
  }

  if (showSupplier) {
    return (
      <View style={styles.container}>
        <View style={styles.backHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowSupplier(false)}
          >
            <MaterialCommunityIcons name="close" size={26} color="#2196F3" />
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>Nhà cung cấp</Text>
        </View>
        <SupplierScreen />
      </View>
    );
  }

  if (showGroup) {
    return (
      <View style={styles.container}>
        <View style={styles.backHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowGroup(false)}
          >
            <MaterialCommunityIcons name="close" size={26} color="#2196F3" />
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>Nhóm hàng hóa</Text>
        </View>
        <GroupScreen />
      </View>
    );
  }

  if (showBrand) {
    return (
      <View style={styles.container}>
        <View style={styles.backHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowBrand(false)}
          >
            <MaterialCommunityIcons name="close" size={26} color="#2196F3" />
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>Thương hiệu</Text>
        </View>
        <BrandScreen />
      </View>
    );
  }

  if (showCategory) {
    return (
      <View style={styles.container}>
        <View style={styles.backHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowCategory(false)}
          >
            <MaterialCommunityIcons name="close" size={26} color="#2196F3" />
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>Danh mục</Text>
        </View>
        <CategoryScreen />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <RevenueCard />
        <MenuGrid 
          items={menuItems} 
          onCategoryPress={() => setShowCategory(true)}
          onBrandPress={() => setShowBrand(true)}
          onGroupPress={() => setShowGroup(true)}
          onSupplierPress={() => setShowSupplier(true)}
          onCashFlowPress={() => setShowCashFlow(true)}
          onWarehousePress={() => setShowWarehouse(true)}
          onImportGoodPress={() => setShowImportGood(true)}
          onContractPress={() => setShowContract(true)}
        />
      </View>
    </ScrollView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    paddingHorizontal: PADDING,
    paddingVertical: 12,
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    paddingRight: 31,
  },
});