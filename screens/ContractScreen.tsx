import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ContractList, ContractDetail } from './components/contract';
import { contractService } from '../services/contractService';
import { ContractListItem } from '../types/contract';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
};

export default function ContractScreen() {
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ContractList
        contracts={contracts}
        onView={handleView}
      />

      <ContractDetail
        visible={showDetail}
        contractId={selectedContractId}
        onClose={() => {
          setShowDetail(false);
          setSelectedContractId(null);
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
});
