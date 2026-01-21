import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productService } from '../services/productService';
import GroupList, { Group } from './components/group/GroupList';
import GroupCreate from './components/group/GroupCreate';
import GroupUpdate from './components/group/GroupUpdate';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray600: '#4B5563',
};

export default function GroupScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await productService.getProductGroups();
      setGroups(data);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể tải nhóm hàng hóa');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (group: Group) => {
    setSelectedGroup(group);
    setShowUpdateModal(true);
  };

  const handleSuccess = () => {
    loadGroups();
  };

  const handleDelete = () => {
    loadGroups();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải nhóm hàng hóa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GroupList
        groups={groups}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
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
      <GroupCreate
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccess}
      />

      {/* Update Modal */}
      <GroupUpdate
        visible={showUpdateModal}
        group={selectedGroup}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedGroup(null);
        }}
        onSuccess={handleSuccess}
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
    color: COLORS.gray600,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
