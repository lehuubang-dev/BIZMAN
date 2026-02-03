import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { contractService } from '../../../services/contractService';
import { purchaseOrderService } from '../../../services/purchaseOrderService';
import { ContractType, DebtRecognitionMode, TermStatus, Contract } from '../../../types/contract';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  success: '#10B981',
  error: '#EF4444',
};

interface ContractUpdateProps {
  visible: boolean;
  contractId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ContractForm {
  id: string;
  title: string;
  contractNumber: string;
  description: string;
  note: string;
  supplierId: string;
  contractType: ContractType;
  debtRecognitionMode: DebtRecognitionMode;
  paymentTermDays: number;
  startDate: Date;
  endDate: Date;
  signDate: Date;
  totalValue: number;
  documents: string[];
  terms: ContractTerm[];
  items: ContractItem[];
}

interface ContractTerm {
  id?: string;
  title: string;
  paymentDate: Date;
  dueDate: Date;
  amount: number;
  status: TermStatus;
  note: string;
}

interface ContractItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tax: number;
  discount: number;
  note: string;
}

export default function ContractUpdate({ visible, contractId, onClose, onSuccess }: ContractUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState<{ field: string; show: boolean }>({ field: '', show: false });
  
  // Debug logging
  console.log('ContractUpdate render:', { visible, contractId, onClose: !!onClose, onSuccess: !!onSuccess });
  
  const [form, setForm] = useState<ContractForm>({
    id: '',
    title: '',
    contractNumber: '',
    description: '',
    note: '',
    supplierId: '',
    contractType: 'PURCHASE',
    debtRecognitionMode: 'BY_COMPLETION',
    paymentTermDays: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    signDate: new Date(),
    totalValue: 0,
    documents: [],
    terms: [],
    items: [],
  });

  const handleClose = () => {
    console.log('ContractUpdate handleClose called');
    // Reset form khi đóng modal
    setForm({
      id: '',
      title: '',
      contractNumber: '',
      description: '',
      note: '',
      supplierId: '',
      contractType: 'PURCHASE',
      debtRecognitionMode: 'BY_COMPLETION',
      paymentTermDays: 30,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      signDate: new Date(),
      totalValue: 0,
      documents: [],
      terms: [],
      items: [],
    });
    onClose();
  };

  useEffect(() => {
    console.log('ContractUpdate useEffect:', { visible, contractId });
    if (visible && contractId) {
      loadData();
      loadContract();
    } else if (!visible) {
      // Reset form khi đóng modal
      setForm({
        id: '',
        title: '',
        contractNumber: '',
        description: '',
        note: '',
        supplierId: '',
        contractType: 'PURCHASE',
        debtRecognitionMode: 'BY_COMPLETION',
        paymentTermDays: 30,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        signDate: new Date(),
        totalValue: 0,
        documents: [],
        terms: [],
        items: [],
      });
    }
  }, [visible, contractId]);

  const loadData = async () => {
    try {
      const [suppliersData, productsData] = await Promise.all([
        purchaseOrderService.getSuppliers(),
        purchaseOrderService.getProducts(),
      ]);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    }
  };

  const loadContract = async () => {
    if (!contractId) return;
    
    try {
      setLoading(true);
      const contract = await contractService.getContractById(contractId);
      
      if (contract) {
        setForm({
          id: contract.id,
          title: contract.title,
          contractNumber: contract.contractNumber,
          description: (contract as any).description || '',
          note: (contract as any).note || '',
          supplierId: contract.supplier?.id || '',
          contractType: contract.contractType,
          debtRecognitionMode: contract.debtRecognitionMode,
          paymentTermDays: contract.paymentTermDays,
          startDate: new Date(contract.startDate),
          endDate: new Date(contract.endDate),
          signDate: new Date(contract.signDate),
          totalValue: contract.totalValue,
          documents: contract.documents?.map(doc => doc.id) || [],
          terms: contract.terms?.map(term => ({
            id: term.id,
            title: term.title,
            paymentDate: term.paymentDate ? new Date(term.paymentDate) : new Date(),
            dueDate: new Date(term.dueDate),
            amount: term.amount,
            status: term.status,
            note: term.note,
          })) || [],
          items: contract.items?.map(item => ({
            id: item.id,
            productId: item.product?.id || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            tax: item.tax,
            discount: item.discount,
            note: item.note,
          })) || [],
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTerm = () => {
    const newTerm: ContractTerm = {
      title: '',
      paymentDate: new Date(),
      dueDate: new Date(),
      amount: 0,
      status: 'PENDING',
      note: '',
    };
    setForm(prev => ({ ...prev, terms: [...prev.terms, newTerm] }));
  };

  const handleAddItem = () => {
    const newItem: ContractItem = {
      productId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      tax: 0,
      discount: 0,
      note: '',
    };
    setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveTerm = (index: number) => {
    setForm(prev => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateTerm = (index: number, field: keyof ContractTerm, value: any) => {
    setForm(prev => ({
      ...prev,
      terms: prev.terms.map((term, i) => 
        i === index ? { ...term, [field]: value } : term
      )
    }));
  };

  const handleUpdateItem = (index: number, field: keyof ContractItem, value: any) => {
    const updatedItems = form.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto calculate total price
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'tax') {
          const subtotal = updatedItem.quantity * updatedItem.unitPrice;
          const discountAmount = subtotal * (updatedItem.discount / 100);
          const afterDiscount = subtotal - discountAmount;
          const taxAmount = afterDiscount * (updatedItem.tax / 100);
          updatedItem.totalPrice = afterDiscount + taxAmount;
        }
        
        return updatedItem;
      }
      return item;
    });

    setForm(prev => ({ ...prev, items: updatedItems }));
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        const asset = result.assets[0];
        const documentId = await purchaseOrderService.uploadDocument({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'application/octet-stream',
        });
        
        setForm(prev => ({
          ...prev,
          documents: [...prev.documents, documentId]
        }));
        
        Alert.alert('Thành công', 'Đã tải lên tài liệu');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải lên tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.contractNumber) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề và Số hợp đồng)');
      return;
    }

    try {
      setLoading(true);

      // Normalize dates to date-only (midnight) to avoid timezone/time-of-day inconsistencies
      const start = new Date(form.startDate);
      start.setHours(0, 0, 0, 0);
      const sign = new Date(form.signDate);
      sign.setHours(0, 0, 0, 0);
      const end = new Date(form.endDate);
      end.setHours(0, 0, 0, 0);

      // Client-side validation to prevent API validation error
      if (start.getTime() > sign.getTime() || sign.getTime() > end.getTime()) {
        Alert.alert('Lỗi', 'Ngày không hợp lệ: đảm bảo Ngày bắt đầu <= Ngày ký <= Ngày kết thúc');
        setLoading(false);
        return;
      }

      const payload = {
        id: form.id,
        supplierId: form.supplierId,
        documents: form.documents,
        terms: form.terms.map(term => ({
          id: term.id,
          title: term.title,
          paymentDate: term.paymentDate.toISOString(),
          dueDate: term.dueDate.toISOString(),
          amount: term.amount,
          status: term.status,
          note: term.note,
        })),
        items: form.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          tax: item.tax,
          discount: item.discount,
          note: item.note,
        })),
        title: form.title,
        contractNumber: form.contractNumber,
        description: form.description,
        note: form.note,
        // send normalized ISO dates (date-only at UTC midnight)
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        signDate: sign.toISOString(),
        totalValue: form.totalValue,
        debtRecognitionMode: form.debtRecognitionMode,
        paymentTermDays: form.paymentTermDays,
        contractType: form.contractType,
      };

      await contractService.updateContract(payload);
      Alert.alert('Thành công', 'Đã cập nhật hợp đồng');
      onSuccess?.();
      onClose();
    } catch (error) {
      Alert.alert('Lỗi', 'Cập nhật hợp đồng thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    console.log('ContractUpdate: Not visible, returning null');
    return null;
  }

  if (!contractId) {
    console.log('ContractUpdate: No contractId provided');
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
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Lỗi</Text>
              <TouchableOpacity onPress={handleClose}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.error} />
              <Text style={styles.loadingText}>Không có ID hợp đồng để cập nhật</Text>
              <TouchableOpacity style={styles.submitButton} onPress={handleClose}>
                <Text style={styles.submitText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  console.log('ContractUpdate: Rendering form with contractId:', contractId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Cập nhật hợp đồng</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiêu đề hợp đồng *</Text>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
                placeholder="Nhập tiêu đề hợp đồng"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số hợp đồng *</Text>
              <TextInput
                style={styles.input}
                value={form.contractNumber}
                onChangeText={(text) => setForm(prev => ({ ...prev, contractNumber: text }))}
                placeholder="Nhập số hợp đồng"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.description}
                onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
                placeholder="Nhập mô tả hợp đồng"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.note}
                onChangeText={(text) => setForm(prev => ({ ...prev, note: text }))}
                placeholder="Nhập ghi chú"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nhà cung cấp *</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {suppliers.find(s => s.id === form.supplierId)?.name || 'Chọn nhà cung cấp'}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại hợp đồng</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.radioButton, form.contractType === 'PURCHASE' && styles.radioActive]}
                  onPress={() => setForm(prev => ({ ...prev, contractType: 'PURCHASE' }))}
                >
                  <Text style={[styles.radioText, form.contractType === 'PURCHASE' && styles.radioTextActive]}>
                    Mua hàng
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, form.contractType === 'SALE' && styles.radioActive]}
                  onPress={() => setForm(prev => ({ ...prev, contractType: 'SALE' }))}
                >
                  <Text style={[styles.radioText, form.contractType === 'SALE' && styles.radioTextActive]}>
                    Bán hàng
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Ngày bắt đầu *</Text>
                <TouchableOpacity 
                  style={styles.input} 
                  onPress={() => setShowDatePicker({ field: 'startDate', show: true })}
                >
                  <Text style={styles.dateText}>{form.startDate.toLocaleDateString('vi-VN')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.label}>Ngày kết thúc *</Text>
                <TouchableOpacity 
                  style={styles.input} 
                  onPress={() => setShowDatePicker({ field: 'endDate', show: true })}
                >
                  <Text style={styles.dateText}>{form.endDate.toLocaleDateString('vi-VN')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày ký hợp đồng *</Text>
              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowDatePicker({ field: 'signDate', show: true })}
              >
                <Text style={styles.dateText}>{form.signDate.toLocaleDateString('vi-VN')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Số ngày thanh toán</Text>
                <TextInput
                  style={styles.input}
                  value={form.paymentTermDays.toString()}
                  onChangeText={(text) => setForm(prev => ({ ...prev, paymentTermDays: parseInt(text) || 30 }))}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.label}>Giá trị hợp đồng</Text>
                <TextInput
                  style={styles.input}
                  value={form.totalValue.toString()}
                  onChangeText={(text) => setForm(prev => ({ ...prev, totalValue: parseFloat(text) || 0 }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phương thức ghi nhận công nợ</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.radioButton, form.debtRecognitionMode === 'IMMEDIATE' && styles.radioActive]}
                  onPress={() => setForm(prev => ({ ...prev, debtRecognitionMode: 'IMMEDIATE' }))}
                >
                  <Text style={[styles.radioText, form.debtRecognitionMode === 'IMMEDIATE' && styles.radioTextActive]}>
                    Ngay lập tức
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, form.debtRecognitionMode === 'BY_COMPLETION' && styles.radioActive]}
                  onPress={() => setForm(prev => ({ ...prev, debtRecognitionMode: 'BY_COMPLETION' }))}
                >
                  <Text style={[styles.radioText, form.debtRecognitionMode === 'BY_COMPLETION' && styles.radioTextActive]}>
                    Khi hoàn thành
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, form.debtRecognitionMode === 'BY_RECEIPT_PARTIAL' && styles.radioActive]}
                  onPress={() => setForm(prev => ({ ...prev, debtRecognitionMode: 'BY_RECEIPT_PARTIAL' }))}
                >
                  <Text style={[styles.radioText, form.debtRecognitionMode === 'BY_RECEIPT_PARTIAL' && styles.radioTextActive]}>
                    Theo từng phần
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Documents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài liệu</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument}>
              <MaterialCommunityIcons name="upload" size={20} color={COLORS.primary} />
              <Text style={styles.uploadText}>Tải lên tài liệu</Text>
            </TouchableOpacity>
            {form.documents.length > 0 && (
              <Text style={styles.documentCount}>{form.documents.length} tài liệu đã tải lên</Text>
            )}
          </View>

          {/* Terms Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Điều khoản thanh toán</Text>
              <TouchableOpacity onPress={handleAddTerm} style={styles.addButton}>
                <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
                <Text style={styles.addButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
            
            {form.terms.map((term, index) => (
              <View key={index} style={styles.termCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Điều khoản {index + 1}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTerm(index)}>
                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.input}
                  value={term.title}
                  onChangeText={(text) => handleUpdateTerm(index, 'title', text)}
                  placeholder="Tiêu đề điều khoản"
                />
                
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Ngày thanh toán</Text>
                    <TouchableOpacity 
                      style={styles.input} 
                      onPress={() => setShowDatePicker({ field: `terms_${index}_paymentDate`, show: true })}
                    >
                      <Text style={styles.dateText}>{term.paymentDate.toLocaleDateString('vi-VN')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Ngày đáo hạn</Text>
                    <TouchableOpacity 
                      style={styles.input} 
                      onPress={() => setShowDatePicker({ field: `terms_${index}_dueDate`, show: true })}
                    >
                      <Text style={styles.dateText}>{term.dueDate.toLocaleDateString('vi-VN')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Số tiền</Text>
                    <TextInput
                      style={styles.input}
                      value={term.amount.toString()}
                      onChangeText={(text) => handleUpdateTerm(index, 'amount', parseFloat(text) || 0)}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Trạng thái</Text>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerText}>
                        {term.status === 'PENDING' ? 'Chờ xử lý' :
                         term.status === 'COMPLETED' ? 'Hoàn thành' :
                         term.status === 'CANCELLED' ? 'Đã hủy' : 'Thất bại'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TextInput
                  style={styles.input}
                  value={term.note}
                  onChangeText={(text) => handleUpdateTerm(index, 'note', text)}
                  placeholder="Ghi chú cho điều khoản"
                />
              </View>
            ))}
          </View>

          {/* Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sản phẩm/Dịch vụ</Text>
              <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
                <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
                <Text style={styles.addButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
            
            {form.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Sản phẩm {index + 1}</Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sản phẩm</Text>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerText}>
                      {products.find(p => p.id === item.productId)?.name || 'Chọn sản phẩm'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Số lượng</Text>
                    <TextInput
                      style={styles.input}
                      value={item.quantity.toString()}
                      onChangeText={(text) => handleUpdateItem(index, 'quantity', parseFloat(text) || 0)}
                      placeholder="1"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Đơn giá</Text>
                    <TextInput
                      style={styles.input}
                      value={item.unitPrice.toString()}
                      onChangeText={(text) => handleUpdateItem(index, 'unitPrice', parseFloat(text) || 0)}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Thuế (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={item.tax.toString()}
                      onChangeText={(text) => handleUpdateItem(index, 'tax', parseFloat(text) || 0)}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Giảm giá (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={item.discount.toString()}
                      onChangeText={(text) => handleUpdateItem(index, 'discount', parseFloat(text) || 0)}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tổng tiền: {item.totalPrice.toLocaleString('vi-VN')} VNĐ</Text>
                </View>
                
                <TextInput
                  style={styles.input}
                  value={item.note}
                  onChangeText={(text) => handleUpdateItem(index, 'note', text)}
                  placeholder="Ghi chú cho sản phẩm"
                />
              </View>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitText}>Cập nhật hợp đồng</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
        )}
      </View>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker.show && (
        <DateTimePicker
          value={(() => {
            try {
              const field = showDatePicker.field;
              if (['startDate', 'endDate', 'signDate'].includes(field)) {
                return form[field as 'startDate' | 'endDate' | 'signDate'] || new Date();
              }
              if (field.startsWith('terms_')) {
                const parts = field.split('_');
                const idx = parseInt(parts[1]);
                const dateField = parts[2] as 'paymentDate' | 'dueDate';
                return form.terms?.[idx]?.[dateField] || new Date();
              }
            } catch (e) {
              // fallback
            }
            return new Date();
          })()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker({ field: '', show: false });
            if (selectedDate && showDatePicker.field) {
              // Handle regular date fields
              if (['startDate', 'endDate', 'signDate'].includes(showDatePicker.field)) {
                setForm(prev => ({ ...prev, [showDatePicker.field]: selectedDate }));
              }
              // Handle terms date fields
              else if (showDatePicker.field.startsWith('terms_')) {
                const parts = showDatePicker.field.split('_');
                const termIndex = parseInt(parts[1]);
                const dateField = parts[2] as 'paymentDate' | 'dueDate';
                handleUpdateTerm(termIndex, dateField, selectedDate);
              }
            }
          }}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray800,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.primary + '10',
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  radioButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  radioActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  radioText: {
    fontSize: 12,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  radioTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.primary + '10',
  },
  uploadText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  documentCount: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 4,
  },
  termCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  itemCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  pickerText: {
    fontSize: 14,
    color: COLORS.gray700,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.gray700,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
  },
});