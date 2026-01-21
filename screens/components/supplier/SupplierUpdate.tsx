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
import RNPickerSelect from 'react-native-picker-select';
import { partnerService } from '../../../services/partnerService';
import { Supplier } from '../../../types/supplier';

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

interface SupplierUpdateProps {
  visible: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SupplierUpdate({ visible, supplier, onClose, onSuccess }: SupplierUpdateProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [supplierType, setSupplierType] = useState('COMPANY');
  const [taxCode, setTaxCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [paymentTermDays, setPaymentTermDays] = useState('0');
  const [debtRecognitionMode, setDebtRecognitionMode] = useState('IMMEDIATE');
  const [maxDebt, setMaxDebt] = useState('0');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setAddress(supplier.address || '');
      setSupplierType(supplier.supplierType);
      setTaxCode(supplier.taxCode || '');
      setPhoneNumber(supplier.phoneNumber || '');
      setEmail(supplier.email || '');
      setBankName(supplier.bankName || '');
      setBankAccount(supplier.bankAccount || '');
      setBankBranch(supplier.bankBranch || '');
      setPaymentTermDays(supplier.paymentTermDays?.toString() || '0');
      setDebtRecognitionMode(supplier.debtRecognitionMode);
      setMaxDebt(supplier.maxDebt?.toString() || '0');
      setDescription(supplier.description || '');
    }
  }, [supplier]);

  const handleReset = () => {
    setName('');
    setAddress('');
    setSupplierType('COMPANY');
    setTaxCode('');
    setPhoneNumber('');
    setEmail('');
    setBankName('');
    setBankAccount('');
    setBankBranch('');
    setPaymentTermDays('0');
    setDebtRecognitionMode('IMMEDIATE');
    setMaxDebt('0');
    setDescription('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!supplier) return;

    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhà cung cấp');
      return;
    }

    setLoading(true);
    try {
      await partnerService.updateSupplier({
        id: supplier.id,
        name: name.trim(),
        address: address.trim(),
        supplierType,
        taxCode: taxCode.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        bankName: bankName.trim(),
        bankAccount: bankAccount.trim(),
        bankBranch: bankBranch.trim(),
        paymentTermDays: parseInt(paymentTermDays) || 0,
        debtRecognitionMode,
        debtDate: null,
        maxDebt: parseFloat(maxDebt) || 0,
        description: description.trim(),
        active: supplier.active,
      });
      handleReset();
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể cập nhật nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  if (!supplier) return null;

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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Cập nhật nhà cung cấp</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Code - Read only */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mã nhà cung cấp</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{supplier.code}</Text>
              </View>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên nhà cung cấp <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên nhà cung cấp"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            {/* Supplier Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setSupplierType('COMPANY')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {supplierType === 'COMPANY' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Công ty</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setSupplierType('INDIVIDUAL')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {supplierType === 'INDIVIDUAL' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Cá nhân</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tax Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mã số thuế</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mã số thuế"
                value={taxCode}
                onChangeText={setTaxCode}
                editable={!loading}
              />
            </View>

            {/* Phone & Email */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập SĐT"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  editable={!loading}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập địa chỉ"
                value={address}
                onChangeText={setAddress}
                editable={!loading}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Bank Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngân hàng</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên ngân hàng"
                value={bankName}
                onChangeText={setBankName}
                editable={!loading}
              />
            </View>

            {/* Bank Account & Branch */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Số tài khoản</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập STK"
                  value={bankAccount}
                  onChangeText={setBankAccount}
                  editable={!loading}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Chi nhánh</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập chi nhánh"
                  value={bankBranch}
                  onChangeText={setBankBranch}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Payment Term Days */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số ngày thanh toán</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số ngày"
                value={paymentTermDays}
                onChangeText={setPaymentTermDays}
                editable={!loading}
                keyboardType="numeric"
              />
            </View>

            {/* Debt Recognition Mode */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chế độ ghi nhận công nợ</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setDebtRecognitionMode('IMMEDIATE')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {debtRecognitionMode === 'IMMEDIATE' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Ghi nợ ngay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setDebtRecognitionMode('BY_RECEIPT_PARTIAL')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {debtRecognitionMode === 'BY_RECEIPT_PARTIAL' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Ghi nợ theo từng đợt nhận</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setDebtRecognitionMode('BY_COMPLETION')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {debtRecognitionMode === 'BY_COMPLETION' && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Chỉ ghi nợ khi hoàn thành</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Max Debt */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Công nợ tối đa</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập công nợ tối đa"
                value={maxDebt}
                onChangeText={setMaxDebt}
                editable={!loading}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập mô tả"
                value={description}
                onChangeText={setDescription}
                editable={!loading}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

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
    marginBottom: 16,
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
  picker: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray800,
    backgroundColor: COLORS.white,
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
  textArea: {
    minHeight: 60,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
  },
  radioGroup: {
    gap: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.gray800,
    flex: 1,
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
