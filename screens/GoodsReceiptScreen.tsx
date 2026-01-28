import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import GoodsReceiptList from './components/goodsReceipt/GoodsReceiptList';
import GoodsReceiptDetail from './components/goodsReceipt/GoodsReceiptDetail';
import GoodsReceiptCreate from './components/goodsReceipt/GoodsReceiptCreate';
import { goodsReceiptService } from '../services/goodsReceiptService';
import { GoodsReceiptListItem } from '../types/goodsReceipt';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
};

export default function GoodsReceiptScreen() {
  const [receipts, setReceipts] = useState<GoodsReceiptListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      console.log('Loading goods receipts...');
      const data = await goodsReceiptService.getGoodsReceipts();
      console.log('Loaded receipts count:', data.length);
      if (data.length > 0) {
        console.log('Newest receipt:', data[0]?.receiptCode, 'Status:', data[0]?.status);
        console.log('First 3 receipts:', data.slice(0, 3).map(r => ({ code: r.receiptCode, status: r.status, date: r.receiptDate })));
      }
      setReceipts(data);
    } catch (error) {
      console.error('Failed to load receipts:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phiếu nhập hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (receiptId: string) => {
    setSelectedReceiptId(receiptId);
    setShowDetail(true);
  };

  const handleEdit = (receiptId: string) => {
    setEditingReceiptId(receiptId);
    setShowCreate(true);
  };

  const handleApprove = async (receiptId: string, receiptCode: string) => {
    try {
      console.log('Approve receipt:', receiptCode, 'ID:', receiptId);
      await goodsReceiptService.changeGoodsReceiptStatus(receiptId);
      Alert.alert('Thành công', `Duyệt phiếu ${receiptCode} thành công`);
      await loadReceipts();
    } catch (error) {
      console.error('Error approving receipt:', error);
      Alert.alert('Lỗi', 'Không thể duyệt phiếu nhập hàng');
    }
  };

  const handleCreate = async () => {
    console.log('handleCreate called - refreshing receipt list...');
    setShowCreate(false);
    setEditingReceiptId(null);
    await loadReceipts();
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
      <GoodsReceiptList
        receipts={receipts}
        onView={handleView}
        onEdit={handleEdit}
        onApprove={handleApprove}
        onCreate={() => {
          setEditingReceiptId(null);
          setShowCreate(true);
        }}
      />

      <GoodsReceiptDetail
        visible={showDetail}
        receiptId={selectedReceiptId}
        onClose={() => {
          setShowDetail(false);
          setSelectedReceiptId(null);
        }}
        onEdit={(receiptId: string) => {
          setShowDetail(false);
          handleEdit(receiptId);
        }}
        onApprove={(receiptId: string, receiptCode: string) => {
          setShowDetail(false);
          handleApprove(receiptId, receiptCode);
        }}
      />

      <GoodsReceiptCreate
        visible={showCreate}
        receiptId={editingReceiptId}
        onClose={() => {
          setShowCreate(false);
          setEditingReceiptId(null);
        }}
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
