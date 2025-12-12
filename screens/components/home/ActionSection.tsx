import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Package, ArrowRightLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface SummaryStat {
  totalCount: number;
  overdueCount: number;
}

export const SummaryGrid = ({ totalCount, overdueCount }: SummaryStat) => (
  <View style={styles.section}>
    <View style={styles.summaryGrid}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryNumber}>{totalCount}</Text>
        <Text style={styles.summaryLabel}>Tổng cộng</Text>
      </View>
      <View style={[styles.summaryCard, styles.summaryCardAlt]}>
        <Text style={[styles.summaryNumber, styles.summaryNumberAlt]}>{overdueCount}</Text>
        <Text style={[styles.summaryLabel, styles.summaryLabelAlt]}>Quá hạn</Text>
      </View>
    </View>
  </View>
);

export const ActionButtonNhapXuat = ({ isImport, onPress }: { isImport: boolean; onPress: () => void }) => (
  <View style={styles.section}>
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Package width={20} height={20} color="#FFFFFF" strokeWidth={2} />
      <Text style={styles.actionButtonText}>Tạo đơn {isImport ? 'nhập' : 'xuất'}</Text>
    </TouchableOpacity>
  </View>
);

export const ActionButtonTransfer = ({ onPress }: { onPress: () => void }) => (
  <View style={styles.section}>
    <TouchableOpacity style={[styles.actionButton, styles.actionButtonPurple]} onPress={onPress}>
      <ArrowRightLeft width={20} height={20} color="#FFFFFF" strokeWidth={2} />
      <Text style={styles.actionButtonText}>Tạo phiếu điều chuyển</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryCardAlt: {
    backgroundColor: '#EF4444',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryNumberAlt: {
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryLabelAlt: {
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonPurple: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
