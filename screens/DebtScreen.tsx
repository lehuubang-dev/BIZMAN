import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PurchaseDebtList from './components/debt/PurchaseDebtList';
import PurchaseDebtDetail from './components/debt/PurchaseDebtDetail';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  gray800: '#1F2937',
};

type TabType = 'purchase' | 'sales';

export default function DebtScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('purchase');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);

  const handleViewDetail = (debtId: string) => {
    setSelectedDebtId(debtId);
    setShowDetail(true);
  };

  const renderTabButton = (tab: TabType, label: string, icon: string) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => setActiveTab(tab)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={isActive ? COLORS.primary : COLORS.gray600}
        />
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabContainer}>
        {renderTabButton('purchase', 'Nhập hàng', 'package-down')}
        {renderTabButton('sales', 'Xuất hàng', 'package-up')}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'purchase' ? (
          <PurchaseDebtList onViewDetail={handleViewDetail} />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-up" size={48} color={COLORS.gray600} />
            <Text style={styles.emptyText}>Chức năng xuất hàng đang phát triển</Text>
          </View>
        )}
      </View>

      {/* Detail Modal */}
      <PurchaseDebtDetail
        visible={showDetail}
        debtId={selectedDebtId}
        onClose={() => {
          setShowDetail(false);
          setSelectedDebtId(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
});
