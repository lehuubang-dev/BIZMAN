import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { productService } from '../../../services/productService';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray800: '#1F2937',
  success: '#10B981',
  error: '#EF4444',
};

interface Group {
  id: string;
  groupId: string;
  name: string;
  description: string;
  jobType: string;
  gtgttax: number;
  tncnntax: number;
}

interface GroupUpdateProps {
  visible: boolean;
  group: Group | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GroupUpdate({ visible, group, onClose, onSuccess }: GroupUpdateProps) {
  const [name, setName] = useState('');
  const [gtgttax, setGtgttax] = useState('');
  const [tncnntax, setTncnntax] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setGtgttax(group.gtgttax?.toString() || '');
      setTncnntax(group.tncnntax?.toString() || '');
      setDescription(group.description || '');
      setJobType(group.jobType || '');
    }
  }, [group]);

  const handleReset = () => {
    setName('');
    setGtgttax('');
    setTncnntax('');
    setDescription('');
    setJobType('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!group) return;

    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm hàng hóa');
      return;
    }

    setLoading(true);
    try {
      await productService.updateGroup({
        id: group.id,
        groupId: group.groupId, // Sử dụng groupId gốc, không cho phép thay đổi
        name: name.trim(),
        gtgttax: gtgttax ? parseFloat(gtgttax) : 0,
        tncnntax: tncnntax ? parseFloat(tncnntax) : 0,
        description: description.trim(),
        jobType: jobType.trim(),
      });
        handleReset();
        onSuccess();
        onClose();
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể cập nhật nhóm hàng hóa');
    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Cập nhật nhóm hàng hóa</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên nhóm hàng hóa <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên nhóm"
                value={name}
                onChangeText={setName}
                editable={!loading}
                autoCapitalize="words"
              />
            </View>

            {/* Job Type Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại công việc</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập loại công việc"
                value={jobType}
                onChangeText={setJobType}
                editable={!loading}
              />
            </View>

            {/* GTGT Tax Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Thuế GTGT</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập thuế GTGT"
                value={gtgttax}
                onChangeText={setGtgttax}
                editable={!loading}
                keyboardType="decimal-pad"
              />
            </View>

            {/* TNCN Tax Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Thuế TNCN</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập thuế TNCN"
                value={tncnntax}
                onChangeText={setTncnntax}
                editable={!loading}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập mô tả"
                value={description}
                onChangeText={setDescription}
                editable={!loading}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Cập nhật</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray800,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  readOnlyField: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.gray50,
  },
  readOnlyText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
