import React, { useEffect, useState, useCallback } from 'react';
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
import { partnerService } from '../services/partnerService';
import { Supplier } from '../types/supplier';
import SupplierList from './components/supplier/SupplierList';
import SupplierCreate from './components/supplier/SupplierCreate';
import SupplierUpdate from './components/supplier/SupplierUpdate';
import SupplierDetail from './components/supplier/SupplierDetail';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  gray800: '#1F2937',
};

export default function SupplierScreen() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await partnerService.getSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      loadSuppliers();
      return;
    }

    setSearching(true);
    try {
      const data = await partnerService.searchSuppliers(text.trim());
      setSuppliers(data);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể tìm kiếm nhà cung cấp');
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchText);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, handleSearch]);

  const handleUpdate = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowUpdateModal(true);
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const handleSuccess = () => {
    loadSuppliers();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải nhà cung cấp...</Text>
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
            placeholder="Tìm kiếm nhà cung cấp..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={COLORS.gray600}
          />
          {(searching || (searchText && loading)) && (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.searchLoader} />
          )}
          {searchText ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchText('');
                loadSuppliers();
              }}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.gray600} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <SupplierList
        suppliers={suppliers}
        onUpdate={handleUpdate}
        onView={handleView}
        onRefresh={handleSuccess}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setShowCreateModal(true)}
      >
        <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Create Modal */}
      <SupplierCreate
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccess}
      />

      {/* Update Modal */}
      <SupplierUpdate
        visible={showUpdateModal}
        supplier={selectedSupplier}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedSupplier(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Detail Modal */}
      <SupplierDetail
        visible={showDetailModal}
        supplier={selectedSupplier}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSupplier(null);
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray800,
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
    shadowRadius: 3.84,
  },
});
