import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

type ContractType = 'PURCHASE' | 'SALE' | 'SERVICE';
type DebtRecognitionMode = 'IMMEDIATE' | 'BY_COMPLETION' | 'BY_RECEIPT_PARTIAL';

interface ContractTypeTabProps {
  form: any;
  setForm: (form: any) => void;
}

export default function ContractTypeTab({ form, setForm }: ContractTypeTabProps) {
  const [showDatePicker, setShowDatePicker] = useState<{ 
    show: boolean; 
    field: 'startDate' | 'endDate' | 'signDate' 
  }>({ show: false, field: 'startDate' });

  const contractTypes: { value: ContractType; label: string; icon: string; description: string }[] = [
    { 
      value: 'PURCHASE', 
      label: 'Mua hàng', 
      icon: 'shopping-outline',
      description: 'Hợp đồng mua nguyên liệu, hàng hóa' 
    },
    { 
      value: 'SALE', 
      label: 'Bán hàng', 
      icon: 'cart-outline',
      description: 'Hợp đồng bán sản phẩm, dịch vụ' 
    },
    { 
      value: 'SERVICE', 
      label: 'Dịch vụ', 
      icon: 'cog-outline',
      description: 'Hợp đồng cung cấp dịch vụ' 
    },
  ];

  const debtModes: { value: DebtRecognitionMode; label: string; description: string }[] = [
    { 
      value: 'IMMEDIATE', 
      label: 'Ngay lập tức', 
      description: 'Ghi nhận công nợ ngay khi tạo hợp đồng' 
    },
    { 
      value: 'BY_COMPLETION', 
      label: 'Khi hoàn thành', 
      description: 'Ghi nhận công nợ khi hoàn thành hợp đồng' 
    },
    { 
      value: 'BY_RECEIPT_PARTIAL', 
      label: 'Theo từng phần', 
      description: 'Ghi nhận công nợ theo từng phần nhận hàng' 
    },
  ];

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

  const calculateDuration = () => {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="file-document-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Loại hợp đồng</Text>
          </View>

          {/* Contract Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại hợp đồng *</Text>
            <View style={styles.typeGrid}>
              {contractTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeCard,
                    form.contractType === type.value && styles.typeCardActive
                  ]}
                  onPress={() => setForm((prev: any) => ({ ...prev, contractType: type.value }))}
                >
                  <MaterialCommunityIcons 
                    name={type.icon as any} 
                    size={24} 
                    color={form.contractType === type.value ? COLORS.primary : COLORS.gray600} 
                  />
                  <Text style={[
                    styles.typeLabel,
                    form.contractType === type.value && styles.typeLabelActive
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={[
                    styles.typeDescription,
                    form.contractType === type.value && styles.typeDescriptionActive
                  ]}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dates Section */}
          <View style={styles.dateSection}>
            <View style={styles.sectionHeaderWithIcon}>
              <MaterialCommunityIcons name="calendar-range" size={20} color={COLORS.primary} />
              <Text style={styles.subSectionTitle}>Thời gian hợp đồng</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Ngày bắt đầu</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker({ show: true, field: 'startDate' })}
                >
                  <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
                  <Text style={styles.dateText}>{formatDate(form.startDate)}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.label}>Ngày kết thúc</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker({ show: true, field: 'endDate' })}
                >
                  <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
                  <Text style={styles.dateText}>{formatDate(form.endDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày ký hợp đồng</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker({ show: true, field: 'signDate' })}
              >
                <MaterialCommunityIcons name="calendar" size={16} color={COLORS.primary} />
                <Text style={styles.dateText}>{formatDate(form.signDate)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.durationCard}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.primary} />
              <Text style={styles.durationText}>
                Thời hạn hợp đồng: {calculateDuration()} ngày
              </Text>
            </View>
          </View>

          {/* Payment Terms */}
          <View style={styles.paymentSection}>
            <View style={styles.sectionHeaderWithIcon}>
              <MaterialCommunityIcons name="credit-card-outline" size={20} color={COLORS.primary} />
              <Text style={styles.subSectionTitle}>Điều kiện thanh toán</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số ngày thanh toán</Text>
              <TextInput
                style={styles.input}
                value={form.paymentTermDays?.toString() || ''}
                onChangeText={(text) => {
                  const days = parseInt(text) || 0;
                  setForm((prev: any) => ({ ...prev, paymentTermDays: Math.max(days, 0) }));
                }}
                placeholder="30"
                placeholderTextColor={COLORS.gray400}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chế độ ghi nhận công nợ</Text>
              <View style={styles.debtModeContainer}>
                {debtModes.map((mode) => (
                  <TouchableOpacity
                    key={mode.value}
                    style={[
                      styles.debtModeCard,
                      form.debtRecognitionMode === mode.value && styles.debtModeCardActive
                    ]}
                    onPress={() => setForm((prev: any) => ({ ...prev, debtRecognitionMode: mode.value }))}
                  >
                    <View style={styles.debtModeHeader}>
                      <Text style={[
                        styles.debtModeLabel,
                        form.debtRecognitionMode === mode.value && styles.debtModeLabelActive
                      ]}>
                        {mode.label}
                      </Text>
                      {form.debtRecognitionMode === mode.value && (
                        <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.primary} />
                      )}
                    </View>
                    <Text style={[
                      styles.debtModeDescription,
                      form.debtRecognitionMode === mode.value && styles.debtModeDescriptionActive
                    ]}>
                      {mode.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Value Section */}
          <View style={styles.valueSection}>
            <View style={styles.sectionHeaderWithIcon}>
              <MaterialCommunityIcons name="currency-usd" size={20} color={COLORS.primary} />
              <Text style={styles.subSectionTitle}>Giá trị hợp đồng</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tổng giá trị hợp đồng</Text>
              <TextInput
                style={styles.input}
                value={form.totalValue?.toString() || ''}
                onChangeText={(text) => {
                  const value = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
                  setForm((prev: any) => ({ ...prev, totalValue: value }));
                }}
                placeholder="0"
                placeholderTextColor={COLORS.gray400}
                keyboardType="numeric"
              />
            </View>

            {form.totalValue > 0 && (
              <View style={styles.valueDisplay}>
                <Text style={styles.valueLabel}>Giá trị hiển thị:</Text>
                <Text style={styles.valueAmount}>{formatCurrency(form.totalValue)}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker.show && (
        <DateTimePicker
          value={form[showDatePicker.field] || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker({ show: false, field: 'startDate' });
            if (selectedDate) {
              setForm((prev: any) => ({ ...prev, [showDatePicker.field]: selectedDate }));
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
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginLeft: 8,
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
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  typeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginTop: 8,
    marginBottom: 4,
  },
  typeLabelActive: {
    color: COLORS.primary,
  },
  typeDescription: {
    fontSize: 12,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  typeDescriptionActive: {
    color: COLORS.primary + '80',
  },
  dateSection: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
    backgroundColor: COLORS.white,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.gray800,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  durationText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  paymentSection: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  debtModeContainer: {
    gap: 12,
  },
  debtModeCard: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  debtModeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  debtModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  debtModeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  debtModeLabelActive: {
    color: COLORS.primary,
  },
  debtModeDescription: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  debtModeDescriptionActive: {
    color: COLORS.primary + '80',
  },
  valueSection: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  valueDisplay: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  valueAmount: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});