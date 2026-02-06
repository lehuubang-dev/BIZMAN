import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
  success: '#10B981',
  error: '#EF4444',
};

interface BasicInfoTabProps {
  form: any;
  setForm: (form: any) => void;
  suppliers: any[];
}

export default function BasicInfoTab({ form, setForm, suppliers }: BasicInfoTabProps) {
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);

  const selectedSupplier = suppliers.find(s => s.id === form.supplierId);

  const handleSupplierSelect = (supplier: any) => {
    setForm((prev: any) => ({ ...prev, supplierId: supplier.id }));
    setShowSupplierPicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="file-document-edit-outline" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tiêu đề hợp đồng *</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(text) => setForm((prev: any) => ({ ...prev, title: text }))}
            placeholder="Nhập tiêu đề hợp đồng"
            placeholderTextColor={COLORS.gray400}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số hợp đồng *</Text>
          <TextInput
            style={styles.input}
            value={form.contractNumber}
            onChangeText={(text) => setForm((prev: any) => ({ ...prev, contractNumber: text }))}
            placeholder="Nhập số hợp đồng"
            placeholderTextColor={COLORS.gray400}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(text) => setForm((prev: any) => ({ ...prev, description: text }))}
            placeholder="Nhập mô tả hợp đồng"
            placeholderTextColor={COLORS.gray400}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.note}
            onChangeText={(text) => setForm((prev: any) => ({ ...prev, note: text }))}
            placeholder="Nhập ghi chú"
            placeholderTextColor={COLORS.gray400}
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nhà cung cấp *</Text>
          <TouchableOpacity 
            style={styles.pickerContainer}
            onPress={() => setShowSupplierPicker(true)}
          >
            <View style={styles.pickerContent}>
              <Text style={[styles.pickerText, !selectedSupplier && styles.placeholderText]}>
                {selectedSupplier ? selectedSupplier.name : 'Chọn nhà cung cấp'}
              </Text>
              <MaterialCommunityIcons name="menu-down" size={20} color={COLORS.gray400} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Supplier Picker Modal */}
      <Modal
        visible={showSupplierPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSupplierPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSupplierPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chọn nhà cung cấp</Text>
                  <TouchableOpacity onPress={() => setShowSupplierPicker(false)}>
                    <MaterialCommunityIcons name="close-circle-outline" size={24} color={COLORS.gray600} />
                  </TouchableOpacity>
                </View>
                <FlatList
              data={suppliers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.supplierItem,
                    item.id === form.supplierId && styles.selectedSupplierItem
                  ]}
                  onPress={() => handleSupplierSelect(item)}
                >
                  <View style={styles.supplierInfo}>
                    <Text style={[
                      styles.supplierName,
                      item.id === form.supplierId && styles.selectedSupplierText
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.supplierCode,
                      item.id === form.supplierId && styles.selectedSupplierSubtext
                    ]}>
                      {item.code}
                    </Text>
                  </View>
                  {item.id === form.supplierId && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray800,
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.gray800,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  pickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.gray800,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.gray400,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  supplierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  selectedSupplierItem: {
    backgroundColor: COLORS.primary + '10',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  selectedSupplierText: {
    color: COLORS.primary,
  },
  supplierCode: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  selectedSupplierSubtext: {
    color: COLORS.primary + '80',
  },
});