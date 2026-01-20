import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#5B5FFF',
  white: '#FFFFFF',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  orange: '#EA580C',
  gray800: '#1F2937',
};

// MonthSelector Component
const MonthSelector = () => (
  <TouchableOpacity style={styles.monthSelector}>
    <MaterialCommunityIcons name="calendar" size={20} color={COLORS.gray600} />
    <Text style={styles.monthText}>Doanh thu tháng này (01/2026)</Text>
    <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.gray600} />
  </TouchableOpacity>
);

// RevenueCard Component
const RevenueCardContent = () => (
  <View style={styles.revenueCard}>
    <Text style={styles.revenueLabel}>0 Đơn hàng</Text>
    
    <Text style={styles.revenueAmount}>0</Text>
    
    <View style={styles.revenueTaxRow}>
      <Text style={styles.revenueText}>Thuế ước tính: </Text>
      <Text style={styles.revenueTaxAmount}>0</Text>
    </View>

    <View style={styles.robotIconPosition}>
      <View style={styles.robotCircle}>
        <MaterialCommunityIcons name="trending-up" size={28} color={COLORS.primary} />
      </View>
    </View>
  </View>
);

// PromoBanner Component
const PromoBanner = () => (
  <TouchableOpacity style={styles.promoBanner} activeOpacity={0.8}>
    <View style={styles.promoLeft}>
      <Text style={styles.promoIcon}>🎁</Text>
      <View style={styles.promoTextContainer}>
        <Text style={styles.promoTitle}>Tăng miễn phí bộ giải pháp</Text>
        <Text style={styles.promoDescription}>Bán hàng - Kế khai thuế - Số kế toán</Text>
      </View>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
  </TouchableOpacity>
);

// PromoIndicators Component
const PromoIndicators = () => (
  <View style={styles.indicators}>
    <View style={styles.indicatorActive} />
    <View style={styles.indicatorInactive} />
  </View>
);

// Main RevenueCard Export (combines all components)
export const RevenueCard = () => (
  <>
    <MonthSelector />
    <RevenueCardContent />
    <PromoBanner />
    <PromoIndicators />
  </>
);

const styles = StyleSheet.create({
  // MonthSelector styles
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  monthText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  
  // RevenueCard styles
  revenueCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    minHeight: 160,
  },
  revenueLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  revenueTaxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revenueText: {
    fontSize: 13,
    color: COLORS.gray800,
    fontWeight: '500',
  },
  revenueTaxAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.orange,
  },
  robotIconPosition: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  robotCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  // PromoBanner styles
  promoBanner: {
    backgroundColor: '#FBD9E5',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
    marginBottom: 12,
  },
  promoLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoIcon: {
    fontSize: 28,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  promoDescription: {
    fontSize: 11,
    color: COLORS.gray800,
  },

  // PromoIndicators styles
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  indicatorActive: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  indicatorInactive: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray200,
  },
});
