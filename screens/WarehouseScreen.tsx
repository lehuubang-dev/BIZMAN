import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WarehouseList from './components/warehouse/WarehouseList';
import WarehouseDetail from './components/warehouse/WarehouseDetail';
import WarehouseCreate from './components/warehouse/WarehouseCreate';
import WarehouseUpdate from './components/warehouse/WarehouseUpdate';
import DialogNotification from './components/common/DialogNotification';
import { warehouseService } from '../services/warehouseService';
import { Warehouse } from '../types/warehouse';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  gray800: '#1F2937',
};

export default function WarehouseScreen() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  
  // Dialog notification state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<'success' | 'error' | 'confirm'>('success');
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  
  // Ref to store pending delete action
  const pendingDeleteActionRef = useRef<(() => Promise<void>) | null>(null);


  useEffect(() => {
    loadWarehouses();
  }, []);

  // Helper function to show dialog notification
  const showDialog = (type: 'success' | 'error', title: string, message: string) => {
    setDialogType(type);
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const loadWarehouses = async () => {
    console.log('loadWarehouses called');
    setLoading(true);
    try {
      const data = await warehouseService.getWarehouses();
      console.log('Loaded warehouses:', data.length, 'items');
      // Sort warehouses by creation date (newest first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setWarehouses(sortedData);
    } catch (error) {
      console.error('Load warehouses error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách kho hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (text: string) => {
    console.log('handleSearch called with text:', text);
    
    // If search text is empty, reload all warehouses
    if (!text.trim()) {
      console.log('Empty search text, loading all warehouses');
      await loadWarehouses();
      return;
    }

    console.log('Starting search for:', text.trim());
    setSearching(true);
    try {
      const data = await warehouseService.searchWarehouses(text.trim());
      console.log('Search results received:', data);
      console.log('Setting warehouses to:', data.length, 'items');
      // Sort search results by creation date (newest first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setWarehouses(sortedData);
    } catch (err: any) {
      console.error('Search error:', err);
      showDialog('error', 'Lỗi', err?.message || 'Không thể tìm kiếm kho hàng');
      // On search error, fallback to showing all warehouses
      console.log('Search failed, loading all warehouses as fallback');
      await loadWarehouses();
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce search with improved logic
  useEffect(() => {
    console.log('useEffect triggered, searchText:', searchText);
    
    const timeoutId = setTimeout(() => {
      console.log('Debounce timeout triggered for searchText:', searchText);
      handleSearch(searchText);
    }, 800); // Increased to 800ms to reduce API calls

    return () => {
      console.log('Clearing timeout for searchText:', searchText);
      clearTimeout(timeoutId);
    };
  }, [searchText, handleSearch]);

  const handleCreate = async (data: any) => {
    try {
      await warehouseService.createWarehouse(data);
      setShowCreate(false);
      // Clear search and reload all warehouses to ensure proper sorting
      setSearchText('');
      await loadWarehouses();
    } catch (error) {
      console.error('Create warehouse error:', error);
      showDialog('error', 'Lỗi', 'Không thể tạo kho hàng');
    }
  };

  const handleUpdateWarehouse = async (data: any) => {
    try {
      await warehouseService.updateWarehouse(data);
      setShowUpdate(false);
      setShowDetail(false);
      setSelectedWarehouse(null);
      
      // Refresh current view (search or all warehouses) to ensure proper sorting
      if (searchText.trim()) {
        await handleSearch(searchText);
      } else {
        await loadWarehouses();
      }
    } catch (error) {
      console.error('Update warehouse error:', error);
      showDialog('error', 'Lỗi', 'Không thể cập nhật kho hàng');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    // Show confirmation dialog
    setDialogType('confirm');
    setDialogTitle('Xác nhận xóa');
    setDialogMessage(`Bạn có chắc muốn xóa kho "${name}"?`);
    setDialogVisible(true);
    
    // Store delete action for confirmation
    const confirmDelete = async () => {
      try {
        await warehouseService.deleteWarehouse(id);
        setShowDetail(false);
        setSelectedWarehouse(null);
        
        // Refresh current view (search or all warehouses)
        if (searchText.trim()) {
          await handleSearch(searchText);
        } else {
          await loadWarehouses();
        }
      } catch (error) {
        console.error('Delete warehouse error:', error);
        showDialog('error', 'Lỗi', 'Không thể xóa kho hàng');
      }
    };
    
    // Store the delete function for use in dialog actions
    pendingDeleteActionRef.current = confirmDelete;
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
        <Text style={styles.loadingText}>Đang tải kho hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={COLORS.gray600}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm kho hàng..."
            value={searchText}
            onChangeText={(text) => {
              console.log('TextInput onChange:', text);
              setSearchText(text);
            }}
            placeholderTextColor={COLORS.gray600}
          />
          {(searching || (searchText && loading)) && (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.searchLoader} />
          )}
          {searchText ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                console.log('Clear button pressed');
                setSearchText('');
                // This will trigger useEffect to search with empty string, which calls loadWarehouses()
              }}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.gray600} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

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

      <DialogNotification
        visible={dialogVisible}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        actions={
          dialogType === 'confirm' 
            ? [
                {
                  text: 'Hủy',
                  style: 'cancel',
                  onPress: () => {
                    setDialogVisible(false);
                    pendingDeleteActionRef.current = null;
                  }
                },
                {
                  text: 'Xóa',
                  style: 'destructive',
                  onPress: () => {
                    setDialogVisible(false);
                    const deleteAction = pendingDeleteActionRef.current;
                    if (deleteAction) {
                      deleteAction();
                      pendingDeleteActionRef.current = null;
                    }
                  }
                }
              ]
            : [
                {
                  text: 'Đóng',
                  style: 'default',
                  onPress: () => setDialogVisible(false)
                }
              ]
        }
        onDismiss={() => {
          setDialogVisible(false);
          pendingDeleteActionRef.current = null;
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray800,
    paddingVertical: 0,
  },
  searchLoader: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
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
