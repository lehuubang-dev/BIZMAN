import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MenuContainer, menuItems } from './components/home/MenuSection';
import { CompactStatsGrid, statsIn, statsOut } from './components/home/StatsSection';
import { SummaryGrid, ActionButtonNhapXuat, ActionButtonTransfer } from './components/home/ActionSection';
import { PendingOrdersGrid, pendingOrders } from './components/home/PendingSection';
import { OrdersSection, orders } from './components/home/OrdersSection';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('nhap');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Menu */}
      <MenuContainer activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content based on active tab */}
      {(activeTab === 'nhap' || activeTab === 'xuat') && (
        <>
          {/* Compact Stats Grid */}
          <CompactStatsGrid stats={activeTab === 'nhap' ? statsIn : statsOut} />

          {/* Status Summary Cards */}
          <SummaryGrid totalCount={27} overdueCount={3} />

          {/* Action Buttons */}
          <ActionButtonNhapXuat isImport={activeTab === 'nhap'} onPress={() => {}} />
        </>
      )}

      {activeTab === 'dieuchuyen' && (
        <>
          {/* Pending Orders for Điều chuyển */}
          <PendingOrdersGrid orders={pendingOrders} />

          {/* Action Button */}
          <ActionButtonTransfer onPress={() => {}} />
        </>
      )}

      {/* Orders Section - Always show */}
      <OrdersSection orders={orders} />

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  footer: {
    height: 20,
  },
});