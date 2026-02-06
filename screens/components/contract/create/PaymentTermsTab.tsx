import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  warning: '#F59E0B',
};

interface PaymentTermsTabProps {
  form: any;
  setForm: (form: any) => void;
}

export default function PaymentTermsTab({ form, setForm }: PaymentTermsTabProps) {
  const [showDatePicker, setShowDatePicker] = useState<{ 
    show: boolean; 
    termIndex: number; 
    field: 'paymentDate' | 'dueDate' 
  }>({ show: false, termIndex: -1, field: 'paymentDate' });

  const handleAddTerm = () => {
    const newTerm = {
      title: '',
      paymentDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      amount: 0,
      status: 'PENDING' as const,
      note: '',
    };
    setForm((prev: any) => ({ ...prev, terms: [...prev.terms, newTerm] }));
  };

  const handleRemoveTerm = (index: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa điều khoản này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            setForm((prev: any) => ({
              ...prev,
              terms: prev.terms.filter((_: any, i: number) => i !== index)
            }));
          }
        },
      ]
    );
  };

  const handleUpdateTerm = (index: number, field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      terms: prev.terms.map((term: any, i: number) => 
        i === index ? { ...term, [field]: value } : term
      )
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getTotalAmount = () => {
    return form.terms.reduce((total: number, term: any) => total + (term.amount || 0), 0);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="credit-card-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Điều khoản thanh toán</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Số điều khoản:</Text>
              <Text style={styles.summaryValue}>{form.terms.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng giá trị:</Text>
              <Text style={[styles.summaryValue, styles.amountText]}>
                {formatCurrency(getTotalAmount())}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddTerm}>
            <MaterialCommunityIcons name="plus-circle" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Thêm điều khoản</Text>
          </TouchableOpacity>

          {form.terms.map((term: any, index: number) => (
            <View key={index} style={styles.termCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <MaterialCommunityIcons 
                    name="file-document-outline" 
                    size={20} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.cardTitle}>Điều khoản {index + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveTerm(index)}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tiêu đề điều khoản</Text>
                <TextInput
                  style={styles.input}
                  value={term.title}
                  onChangeText={(text) => handleUpdateTerm(index, 'title', text)}
                  placeholder="Nhập tiêu đề điều khoản"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Ngày thanh toán</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker({ 
                      show: true, 
                      termIndex: index, 
                      field: 'paymentDate' 
                    })}
                  >
                    <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
                    <Text style={styles.dateText}>{formatDate(term.paymentDate)}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Ngày đến hạn</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker({ 
                      show: true, 
                      termIndex: index, 
                      field: 'dueDate' 
                    })}
                  >
                    <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
                    <Text style={styles.dateText}>{formatDate(term.dueDate)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số tiền</Text>
                <TextInput
                  style={styles.input}
                  value={term.amount?.toString() || ''}
                  onChangeText={(text) => {
                    const amount = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
                    handleUpdateTerm(index, 'amount', amount);
                  }}
                  placeholder="0"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Trạng thái</Text>
                <View style={styles.statusContainer}>
                  {[{ key: 'PENDING', label: 'Chờ' }, { key: 'COMPLETED', label: 'Hoàn thành' }, { key: 'CANCELLED', label: 'Hủy' }, { key: 'FAILED', label: 'Thất bại' }].map((status) => (
                    <TouchableOpacity
                      key={status.key}
                      style={styles.radioContainer}
                      onPress={() => handleUpdateTerm(index, 'status', status.key)}
                    >
                      <View style={styles.radioButton}>
                        {term.status === status.key && <View style={styles.radioButtonInner} />}
                      </View>
                      <Text style={styles.radioLabel}>{status.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={term.note}
                  onChangeText={(text) => handleUpdateTerm(index, 'note', text)}
                  placeholder="Nhập ghi chú"
                  placeholderTextColor={COLORS.gray400}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          ))}

          {form.terms.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="file-document-plus-outline" 
                size={48} 
                color={COLORS.gray400} 
              />
              <Text style={styles.emptyText}>Chưa có điều khoản thanh toán</Text>
              <Text style={styles.emptySubtext}>Thêm điều khoản để quản lý thanh toán</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker.show && (
        <DateTimePicker
          value={form.terms[showDatePicker.termIndex]?.[showDatePicker.field] || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker({ show: false, termIndex: -1, field: 'paymentDate' });
            if (selectedDate) {
              handleUpdateTerm(showDatePicker.termIndex, showDatePicker.field, selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    width: '50%',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  amountText: {
    color: COLORS.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  termCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 4,
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
    backgroundColor: COLORS.gray50,
    color: COLORS.gray800,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.gray50,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.gray800,
  },
  statusContainer: {
    gap: 12,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.gray800,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray600,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray400,
    marginTop: 4,
    width: '100%',
    textAlign: 'center',
  },
});