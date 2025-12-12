import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Truck, CheckCircle } from 'lucide-react-native';

export interface PendingOrder {
  label: string;
  value: number;
  color: string;
  textColor: string;
  icon: any;
}

export const pendingOrders: PendingOrder[] = [
  { label: 'Chờ vận chuyển', value: 9, color: '#CFFAFE', textColor: '#164E63', icon: Truck },
  { label: 'Chờ xác nhận', value: 18, color: '#FEE2E2', textColor: '#7F1D1D', icon: CheckCircle },
];

export const PendingCard = ({ order }: { order: PendingOrder }) => {
  const Icon = order.icon;
  return (
    <View style={[styles.pendingCard, { backgroundColor: order.color }]}>
      <View style={styles.pendingLeft}>
        <Icon width={20} height={20} color={order.textColor} strokeWidth={2} />
        <Text style={[styles.pendingLabel, { color: order.textColor }]}>
          {order.label}
        </Text>
      </View>
      <Text style={[styles.pendingValue, { color: order.textColor }]}>
        {order.value}
      </Text>
    </View>
  );
};

export const PendingOrdersGrid = ({ orders }: { orders: PendingOrder[] }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Trạng thái đơn</Text>
    <View style={styles.pendingGrid}>
      {orders.map((order, idx) => (
        <PendingCard key={idx} order={order} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  pendingGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  pendingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  pendingValue: {
    fontSize: 22,
    fontWeight: '700',
  },
});
