import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WarehouseList from './components/warehouse/WarehouseList';
import WarehouseDetail from './components/warehouse/WarehouseDetail';
import WarehouseCreate from './components/warehouse/WarehouseCreate';
import WarehouseUpdate from './components/warehouse/WarehouseUpdate';
import { warehouseService } from '../services/warehouseService';
import { Warehouse } from '../types/warehouse';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
};

export default function WarehouseScreen() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách kho hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await warehouseService.createWarehouse(data);
      setShowCreate(false);
      loadWarehouses();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo kho hàng');
    }
  };

  const handleUpdateWarehouse = async (data: any) => {
    try {
      await warehouseService.updateWarehouse(data);
      setShowUpdate(false);
      setShowDetail(false);
      setSelectedWarehouse(null);
      loadWarehouses();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật kho hàng');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa kho "${name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await warehouseService.deleteWarehouse(id);
              setShowDetail(false);
              setSelectedWarehouse(null);
              loadWarehouses();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa kho hàng');
            }
          },
        },
      ]
    );
  };

  const handleUpdate = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowUpdate(true);
  };

  const handleView = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDetail(true);
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
      <WarehouseList
        warehouses={warehouses}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onView={handleView}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>

      <WarehouseCreate
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />

      <WarehouseUpdate
        visible={showUpdate}
        warehouse={selectedWarehouse}
        onClose={() => setShowUpdate(false)}
        onSubmit={handleUpdateWarehouse}
      />

      <WarehouseDetail
        visible={showDetail}
        warehouse={selectedWarehouse}
        onClose={() => {
          setShowDetail(false);
          setSelectedWarehouse(null);
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
