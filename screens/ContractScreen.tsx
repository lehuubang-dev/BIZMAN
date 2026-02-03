import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import { ContractList, ContractDetail, ContractCreate, ContractUpdate } from './components/contract';
import { contractService } from '../services/contractService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ContractListItem } from '../types/contract';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
};

export default function ContractScreen() {
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateContractId, setUpdateContractId] = useState<string | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  // Auto search when search text changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 1000); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [search]);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const data = await contractService.getContracts();
      setContracts(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (contractId: string) => {
    setSelectedContractId(contractId);
    setShowDetail(true);
  };

  const handleUpdate = (contractId: string) => {
    console.log('handleUpdate called with contractId:', contractId);
    setUpdateContractId(contractId);
    setShowUpdate(true);
    console.log('showUpdate set to true, updateContractId set to:', contractId);
  };

  const handleDelete = (contractId: string) => {
    Alert.alert('Xác nhận', 'Bạn có muốn xóa hợp đồng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await contractService.deleteContract(contractId);
            Alert.alert('Thành công', 'Đã xóa hợp đồng');
            await loadContracts();
          } catch (err) {
            Alert.alert('Lỗi', 'Xóa hợp đồng thất bại');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleCancel = (contractId: string) => {
    Alert.alert('Xác nhận', 'Bạn có muốn hủy hợp đồng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Hủy hợp đồng',
        onPress: async () => {
          try {
            setLoading(true);
            await contractService.cancelContract(contractId);
            Alert.alert('Thành công', 'Hợp đồng đã được hủy');
            await loadContracts();
          } catch (err) {
            Alert.alert('Lỗi', 'Hủy hợp đồng thất bại');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleActivate = (contractId: string) => {
    Alert.alert('Xác nhận', 'Kích hoạt hợp đồng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Kích hoạt',
        onPress: async () => {
          try {
            setLoading(true);
            await contractService.activateContract(contractId);
            Alert.alert('Thành công', 'Hợp đồng đã được kích hoạt');
            await loadContracts();
          } catch (err) {
            Alert.alert('Lỗi', 'Kích hoạt hợp đồng thất bại');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSearch = async () => {
    if (!search || search.trim() === '') {
      await loadContracts();
      return;
    }
    
    // Chỉ search nếu có ít nhất 2 ký tự để tránh quá nhiều API calls
    if (search.trim().length < 2) {
      return;
    }
    
    setLoading(true);
    try {
      const results = await contractService.searchContracts(search.trim(), 0, 20);
      setContracts(results);
    } catch (err) {
      // Chỉ hiển thị lỗi khi người dùng bấm icon search, không hiển thị khi auto search
      if (search.trim().length >= 2) {
        console.error('Search failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!search || search.trim() === '') {
      await loadContracts();
      return;
    }
    setLoading(true);
    try {
      const results = await contractService.searchContracts(search.trim(), 0, 20);
      setContracts(results);
    } catch (err) {
      Alert.alert('Lỗi', 'Tìm kiếm thất bại');
    } finally {
      setLoading(false);
    }
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
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.gray400} />
          <TextInput
            placeholder="Tìm hợp đồng..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={handleManualSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          )}
          {loading && search.length > 0 && (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
          )}
        </View>
      </View>
      <ContractList
        contracts={contracts}
        onView={handleView}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onCancel={handleCancel}
        onActivate={handleActivate}
      />

      {/* FAB for creating new contract */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreate(true)}
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
      </TouchableOpacity>

      {/* Modals */}
      <ContractDetail
        visible={showDetail}
        contractId={selectedContractId}
        onClose={() => {
          setShowDetail(false);
          setSelectedContractId(null);
          loadContracts();
        }}
      />

      <ContractCreate
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          setShowCreate(false);
          loadContracts();
        }}
      />

      <ContractUpdate
        visible={showUpdate}
        contractId={updateContractId}
        onClose={() => {
          setShowUpdate(false);
          setUpdateContractId(null);
        }}
        onSuccess={() => {
          setShowUpdate(false);
          setUpdateContractId(null);
          loadContracts();
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
  searchContainer: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.gray800,
    minHeight: 40,
    paddingVertical: 8,
    
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
