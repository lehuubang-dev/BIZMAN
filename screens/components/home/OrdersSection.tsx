import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, ShoppingCart, ArrowRightLeft, ChevronRight } from 'lucide-react-native';

export interface OrderItem {
  label: string;
  value: number;
}

export interface Order {
  title: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  items: OrderItem[];
}

export const orders: Order[] = [
  {
    title: 'Đơn đặt hàng',
    icon: FileText,
    iconColor: '#2563EB',
    bgColor: '#F0F9FF',
    borderColor: '#BFDBFE',
    badgeBg: '#3B82F6',
    items: [
      { label: 'Quá hạn', value: 0 },
      { label: 'Chưa thực hiện', value: 2 },
      { label: 'Đang thực hiện', value: 5 },
    ],
  },
  {
    title: 'Đơn mua hàng',
    icon: ShoppingCart,
    iconColor: '#D97706',
    bgColor: '#FFFBF0',
    borderColor: '#FED7AA',
    badgeBg: '#F59E0B',
    items: [
      { label: 'Quá hạn', value: 1 },
      { label: 'Chưa thực hiện', value: 8 },
      { label: 'Đang thực hiện', value: 2 },
    ],
  },
  {
    title: 'Điều chuyển',
    icon: ArrowRightLeft,
    iconColor: '#7C3AED',
    bgColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    badgeBg: '#A855F7',
    items: [
      { label: 'Quá hạn', value: 4 },
      { label: 'Chưa thực hiện', value: 8 },
    ],
  },
];

export const OrderCard = ({ order }: { order: Order }) => {
  const Icon = order.icon;
  return (
    <View style={[styles.orderCard, { backgroundColor: order.bgColor, borderColor: order.borderColor, borderWidth: 1 }]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderTitleContainer}>
          <Icon width={22} height={22} color={order.iconColor} strokeWidth={2} />
          <Text style={styles.orderTitle}>{order.title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: order.badgeBg }]}>
          <Text style={styles.badgeText}>{order.items.length}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item, itemIdx) => (
          <TouchableOpacity
            key={itemIdx}
            style={[
              styles.orderItem,
              itemIdx !== order.items.length - 1 && styles.orderItemBorder,
            ]}
          >
            <Text style={styles.orderItemLabel}>{item.label}</Text>
            <View style={styles.orderItemRight}>
              <View style={styles.valueBox}>
                <Text style={styles.orderItemValue}>{item.value}</Text>
              </View>
              <ChevronRight width={18} height={18} color="#D1D5DB" strokeWidth={2} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const OrdersSection = ({ orders: ordersList }: { orders: Order[] }) => (
  <View style={styles.ordersSection}>
    <Text style={styles.ordersSectionTitle}>Danh sách đơn hàng</Text>
    {ordersList.map((order, idx) => (
      <OrderCard key={idx} order={order} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  ordersSection: {
    paddingHorizontal: 0,
    paddingTop: 20,
  },
  ordersSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  orderCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderItemLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  orderItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderItemValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
});
