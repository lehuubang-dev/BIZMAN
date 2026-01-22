import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ImportGoodList, ImportGoodDetail, ImportGoodCreate } from './components/importGood';
import { purchaseOrderService } from '../services/purchaseOrderService';
import { PurchaseOrderListItem } from '../types/purchaseOrder';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
};

export default function ImportGoodScreen() {
  const [orders, setOrders] = useState<PurchaseOrderListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await purchaseOrderService.getPurchaseOrders();
      setOrders(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn nhập hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetail(true);
  };

  const handleApprove = async (orderId: string, orderNumber?: string) => {
  if (approving) return;

  try {
    setApproving(true);
    console.log('Approve order:', orderNumber);
    await purchaseOrderService.approvePurchaseOrder(orderId);
    loadOrders();
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể duyệt đơn nhập hàng');
  } finally {
    setApproving(false);
  }
};

  const handleCreate = async () => {
    setShowCreate(false);
    await loadOrders();
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImportGoodList
        orders={orders}
        onView={handleView}
        onApprove={handleApprove}
        onCreate={() => setShowCreate(true)}
      />

      <ImportGoodDetail
        visible={showDetail}
        orderId={selectedOrderId}
        onClose={() => {
          setShowDetail(false);
          setSelectedOrderId(null);
        }}
        onApprove={(orderId, orderNumber) => {
          setShowDetail(false);
          handleApprove(orderId, orderNumber);
        }}
      />

      <ImportGoodCreate
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={handleCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
  },
});
