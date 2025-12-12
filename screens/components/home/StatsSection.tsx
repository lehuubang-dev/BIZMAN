import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export interface CompactStat {
  label: string;
  value: number;
  color: string;
  textColor: string;
  shortLabel: string;
}

export const statsIn: CompactStat[] = [
  { label: 'Quá hạn', value: 3, color: '#FED7AA', textColor: '#92400E', shortLabel: 'Quá hạn' },
  { label: 'Chờ nhận hàng', value: 14, color: '#BBEF63', textColor: '#166534', shortLabel: 'Nhận hàng' },
  { label: 'Chờ kiểm đếm', value: 8, color: '#BFDBFE', textColor: '#1E40AF', shortLabel: 'Kiểm đếm' },
  { label: 'Chờ nhập hàng', value: 2, color: '#FBCFE8', textColor: '#831843', shortLabel: 'Nhập hàng' },
];

export const statsOut: CompactStat[] = [
  { label: 'Quá hạn', value: 3, color: '#FED7AA', textColor: '#92400E', shortLabel: 'Quá hạn' },
  { label: 'Chờ lấy hàng', value: 4, color: '#BBEF63', textColor: '#166534', shortLabel: 'Lấy hàng' },
  { label: 'Chờ đóng gói', value: 12, color: '#BFDBFE', textColor: '#1E40AF', shortLabel: 'Đóng gói' },
  { label: 'Chờ xuất hàng', value: 18, color: '#FBCFE8', textColor: '#831843', shortLabel: 'Xuất hàng' },
  { label: 'Chờ vận chuyển', value: 5, color: '#C7D2FE', textColor: '#3730A3', shortLabel: 'Vận chuyển' },
  { label: 'Chờ xác nhận', value: 20, color: '#A7F3D0', textColor: '#065F46', shortLabel: 'Xác nhận' },
];

export const CompactStatCard = ({ stat }: { stat: CompactStat }) => (
  <View style={[styles.compactCard, { backgroundColor: stat.color }]}>
    <Text style={[styles.compactValue, { color: stat.textColor }]}>
      {stat.value}
    </Text>
    <Text style={[styles.compactLabel, { color: stat.textColor }]} numberOfLines={2}>
      {stat.shortLabel}
    </Text>
  </View>
);

export const CompactStatsGrid = ({ stats }: { stats: CompactStat[] }) => (
  <View style={styles.section}>
    <View style={styles.compactGrid}>
      {stats.map((stat, idx) => (
        <CompactStatCard key={idx} stat={stat} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compactCard: {
    width: (width - 52) / 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
});
