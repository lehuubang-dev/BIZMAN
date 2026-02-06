import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { contractService, partnerService, productService } from '../../../services';
import { ContractType, DebtRecognitionMode, TermStatus } from '../../../types/contract';
import BasicInfoTab from './create/BasicInfoTab';
import PaymentTermsTab from './create/PaymentTermsTab';
import ProductsTab from './create/ProductsTab';
import ContractTypeTab from './create/ContractTypeTab';
import DocumentsTab from './create/DocumentsTab';
import Snackbar from '../common/Snackbar';

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

const TABS = [
  { id: 'basic', title: 'Thông tin cơ bản', icon: 'file-document-edit-outline' },
  { id: 'terms', title: 'Điều khoản TT', icon: 'credit-card-outline' },
  { id: 'products', title: 'Sản phẩm', icon: 'cube-outline' },
  { id: 'contract', title: 'Loại hợp đồng', icon: 'file-document-outline' },
  { id: 'documents', title: 'Tài liệu', icon: 'folder-outline' },
];

interface ContractCreateProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ContractForm {
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
  title: string;
  paymentDate: Date;
  dueDate: Date;
  amount: number;
  status: TermStatus;
  note: string;
}

interface ContractItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tax: number;
  discount: number;
  note: string;
}

export default function ContractCreate({ visible, onClose, onSuccess }: ContractCreateProps) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ visible: false, message: '', type: 'success' });
  
  const [form, setForm] = useState<ContractForm>({
    title: '',
    contractNumber: '',
    description: '',
    note: '',
    supplierId: '',
    contractType: 'PURCHASE',
    debtRecognitionMode: 'BY_COMPLETION',
    paymentTermDays: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    signDate: new Date(),
    totalValue: 0,
    documents: [],
    terms: [],
    items: [],
  });

  const handleClose = () => {
    // Reset snackbar state
    setSnackbar({ visible: false, message: '', type: 'success' });
    
    // Reset form when closing
    setForm({
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
    setActiveTab('basic');
    onClose();
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const [suppliersData, productsData] = await Promise.all([
        partnerService.getSuppliers(),
        productService.getProducts(),
      ]);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    }
  };

  const validateCurrentTab = () => {
    switch (activeTab) {
      case 'basic':
        if (!form.title || !form.contractNumber) {
          Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề và Số hợp đồng)');
          return false;
        }
        return true;
      case 'contract':
        const start = new Date(form.startDate);
        const sign = new Date(form.signDate);
        const end = new Date(form.endDate);
        if (start.getTime() > sign.getTime() || sign.getTime() > end.getTime()) {
          Alert.alert('Lỗi', 'Ngày không hợp lệ: đảm bảo Ngày bắt đầu <= Ngày ký <= Ngày kết thúc');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextTab = () => {
    if (!validateCurrentTab()) return;
    
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].id);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <BasicInfoTab 
            form={form} 
            setForm={setForm} 
            suppliers={suppliers} 
          />
        );
      case 'terms':
        return (
          <PaymentTermsTab 
            form={form} 
            setForm={setForm} 
          />
        );
      case 'products':
        return (
          <ProductsTab 
            form={form} 
            setForm={setForm} 
            products={products} 
          />
        );
      case 'contract':
        return (
          <ContractTypeTab 
            form={form} 
            setForm={setForm} 
          />
        );
      case 'documents':
        return (
          <DocumentsTab 
            form={form} 
            setForm={setForm} 
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentTab()) return;
    
    // Final validation
    if (!form.title || !form.contractNumber) {
      setActiveTab('basic');
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề và Số hợp đồng)');
      return;
    }

    try {
      setLoading(true);

      // Normalize and validate dates client-side
      const start = new Date(form.startDate);
      start.setHours(0, 0, 0, 0);
      const sign = new Date(form.signDate);
      sign.setHours(0, 0, 0, 0);
      const end = new Date(form.endDate);
      end.setHours(0, 0, 0, 0);

      if (start.getTime() > sign.getTime() || sign.getTime() > end.getTime()) {
        setActiveTab('contract');
        Alert.alert('Lỗi', 'Ngày không hợp lệ: đảm bảo Ngày bắt đầu <= Ngày ký <= Ngày kết thúc');
        setLoading(false);
        return;
      }

      const payload = {
        supplierId: form.supplierId,
        documents: form.documents,
        terms: form.terms.map(term => ({
          title: term.title,
          paymentDate: term.paymentDate.toISOString(),
          dueDate: term.dueDate.toISOString(),
          amount: term.amount,
          status: term.status,
          note: term.note,
        })),
        items: form.items.map(item => ({
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
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        signDate: sign.toISOString(),
        totalValue: form.totalValue,
        debtRecognitionMode: form.debtRecognitionMode,
        paymentTermDays: form.paymentTermDays,
        contractType: form.contractType,
        status: 'DRAFT', // Tạo hợp đồng ở trạng thái nháp
      };

      await contractService.createContract(payload);
      setSnackbar({ visible: true, message: 'Đã tạo hợp đồng thành công', type: 'success' });
      
      // Call onSuccess immediately for list refresh
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal after snackbar is shown
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Contract creation error:', error);
      setSnackbar({ visible: true, message: 'Tạo hợp đồng thất bại. Vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tạo hợp đồng mới</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabScrollContainer}
            >
              {TABS.map((tab, index) => {
                const isActive = activeTab === tab.id;
                const isCompleted = TABS.findIndex(t => t.id === activeTab) > index;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.tab,
                      isActive && styles.activeTab,
                      isCompleted && styles.completedTab
                    ]}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <MaterialCommunityIcons 
                      name={isCompleted ? 'check-circle' : tab.icon as any} 
                      size={20} 
                      color={
                        isActive ? COLORS.primary : 
                        isCompleted ? COLORS.success : 
                        COLORS.gray400
                      } 
                    />
                    <Text style={[
                      styles.tabText,
                      isActive && styles.activeTabText,
                      isCompleted && styles.completedTabText
                    ]}>
                      {tab.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Tab Content */}
          <View style={styles.content}>
            {renderTabContent()}
          </View>

          {/* Navigation Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                activeTab === TABS[0].id && styles.navButtonDisabled
              ]}
              onPress={handlePrevTab}
              disabled={activeTab === TABS[0].id}
            >
              <MaterialCommunityIcons 
                name="chevron-left" 
                size={20} 
                color={activeTab === TABS[0].id ? COLORS.gray400 : COLORS.primary} 
              />
              <Text style={[
                styles.navButtonText,
                activeTab === TABS[0].id && styles.navButtonTextDisabled
              ]}>
                Quay lại
              </Text>
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {TABS.findIndex(tab => tab.id === activeTab) + 1} / {TABS.length}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${((TABS.findIndex(tab => tab.id === activeTab) + 1) / TABS.length) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            {activeTab === TABS[TABS.length - 1].id ? (
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={20} color={COLORS.white} />
                    <Text style={styles.submitText}>Tạo </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNextTab}
              >
                <Text style={styles.navButtonText}>Tiếp theo</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
      
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
      />
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
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray800,
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tabScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: COLORS.gray100,
    minWidth: 120,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  completedTab: {
    backgroundColor: COLORS.success + '20',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  completedTabText: {
    color: COLORS.success,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    gap: 6,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  navButtonTextDisabled: {
    color: COLORS.gray400,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});