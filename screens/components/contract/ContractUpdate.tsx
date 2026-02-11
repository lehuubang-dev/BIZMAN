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
import BasicInfoTab from './update/BasicInfoTab';
import PaymentTermsTab from './update/PaymentTermsTab';
import ProductsTab from './update/ProductsTab';
import ContractTypeTab from './update/ContractTypeTab';
import DocumentsTab from './update/DocumentsTab';
import DialogNotification from '../common/DialogNotification';
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
  title: string;
  paymentDate: Date;
  dueDate: Date;
  amount: number;
  status: TermStatus;
  note: string;
}

interface ContractItem {
  variantId: string;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  totalPrice: number;
  note: string;
}

export default function ContractUpdate({ visible, contractId, onClose, onSuccess }: ContractUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [dialog, setDialog] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ visible: false, title: '', message: '', type: 'success' });
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ visible: false, message: '', type: 'success' });
  
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
    // Reset dialog and snackbar state
    setDialog({ visible: false, title: '', message: '', type: 'success' });
    setSnackbar({ visible: false, message: '', type: 'success' });
    
    // Reset form when closing
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
    setActiveTab('basic');
    onClose();
  };

  useEffect(() => {
    if (visible && contractId) {
      loadData();
    }
  }, [visible, contractId]);

  // Auto update total value when items change
  useEffect(() => {
    const totalValue = form.items.reduce((total: number, item: any) => {
      return total + (item.totalPrice || 0);
    }, 0);
    
    if (form.totalValue !== totalValue) {
      setForm((prev: any) => ({ ...prev, totalValue }));
    }
  }, [form.items]);

  const loadData = async () => {
    if (!contractId) return;
    
    try {
      setLoadingData(true);
      const [suppliersData, variantsData, contractData] = await Promise.all([
        partnerService.getSuppliers(),
        productService.getProductVariants(),
        contractService.getContractById(contractId),
      ]);
      setSuppliers(suppliersData);
      setVariants(variantsData);
      
      // Map contract data to form
      if (contractData) {
        setForm({
          id: contractData.id,
          title: contractData.title,
          contractNumber: contractData.contractNumber,
          description: contractData.description || '',
          note: contractData.note || '',
          supplierId: contractData.supplier?.id || '',
          contractType: contractData.contractType,
          debtRecognitionMode: contractData.debtRecognitionMode,
          paymentTermDays: contractData.paymentTermDays,
          startDate: new Date(contractData.startDate),
          endDate: new Date(contractData.endDate),
          signDate: new Date(contractData.signDate),
          totalValue: contractData.totalValue,
          documents: contractData.documents?.map(doc => doc.id) || [],
          terms: contractData.terms?.map(term => ({
            title: term.title,
            paymentDate: term.paymentDate ? new Date(term.paymentDate) : new Date(),
            dueDate: term.dueDate ? new Date(term.dueDate) : new Date(),
            amount: term.amount,
            status: term.status,
            note: term.note,
          })) || [],
          items: contractData.items?.map(item => ({
            variantId: item.variant?.id || '',
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            discountRate: item.discountRate,
            discountAmount: item.discountAmount,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subTotal: item.subTotal,
            totalPrice: item.totalPrice,
            note: item.note,
          })) || [],
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu hợp đồng');
    } finally {
      setLoadingData(false);
    }
  };

  const validateCurrentTab = () => {
    switch (activeTab) {
      case 'basic':
        if (!form.title) {
          Alert.alert('Lỗi', 'Vui lòng điền tiêu đề hợp đồng');
          return false;
        }
        if (!form.contractNumber) {
          Alert.alert('Lỗi', 'Vui lòng điền số hợp đồng');
          return false;
        }
        if (!form.supplierId) {
          Alert.alert('Lỗi', 'Vui lòng chọn nhà cung cấp');
          return false;
        }
        return true;
      case 'products':
        if (form.items.length === 0) {
          Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một sản phẩm');
          return false;
        }
        for (let i = 0; i < form.items.length; i++) {
          const item = form.items[i];
          if (!item.variantId) {
            Alert.alert('Lỗi', `Vui lòng chọn sản phẩm cho mục ${i + 1}`);
            return false;
          }
          if (item.quantity <= 0) {
            Alert.alert('Lỗi', `Số lượng sản phẩm ${i + 1} phải lớn hơn 0`);
            return false;
          }
          if (item.unitPrice <= 0) {
            Alert.alert('Lỗi', `Đơn giá sản phẩm ${i + 1} phải lớn hơn 0`);
            return false;
          }
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
        if (form.paymentTermDays <= 0) {
          Alert.alert('Lỗi', 'Số ngày thanh toán phải lớn hơn 0');
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
            variants={variants} 
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
    
    // Comprehensive final validation
    if (!form.title) {
      setActiveTab('basic');
      Alert.alert('Lỗi', 'Vui lòng điền tiêu đề hợp đồng');
      return;
    }

    if (!form.contractNumber) {
      setActiveTab('basic');
      Alert.alert('Lỗi', 'Vui lòng điền số hợp đồng');
      return;
    }

    if (!form.supplierId) {
      setActiveTab('basic');
      Alert.alert('Lỗi', 'Vui lòng chọn nhà cung cấp');
      return;
    }

    if (form.items.length === 0) {
      setActiveTab('products');
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    // Validate all items
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      if (!item.variantId || item.quantity <= 0 || item.unitPrice <= 0) {
        setActiveTab('products');
        Alert.alert('Lỗi', `Sản phẩm ${i + 1} có thông tin không hợp lệ`);
        return;
      }
    }

    if (form.totalValue <= 0) {
      Alert.alert('Lỗi', 'Tổng giá trị hợp đồng phải lớn hơn 0');
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

      // Clean and validate payload
      const payload = {
        id: form.id,
        supplierId: form.supplierId,
        documents: form.documents.filter(doc => doc && doc.trim()),
        terms: form.terms
          .filter(term => term.title && term.amount > 0)
          .map(term => ({
            title: term.title,
            note: term.note || '',
            status: term.status,
            paymentDate: term.paymentDate.toISOString().split('T')[0],
            dueDate: term.dueDate.toISOString().split('T')[0],
            amount: Math.round(term.amount * 100) / 100,
          })),
        items: form.items.map(item => ({
          variantId: item.variantId,
          taxRate: Math.round((item.taxRate || 0) * 100) / 100,
          taxAmount: Math.round((item.taxAmount || 0) * 100) / 100,
          discountRate: Math.round((item.discountRate || 0) * 100) / 100,
          discountAmount: Math.round((item.discountAmount || 0) * 100) / 100,
          quantity: Math.round(item.quantity),
          unitPrice: Math.round(item.unitPrice * 100) / 100,
          subTotal: Math.round(item.subTotal * 100) / 100,
          totalPrice: Math.round(item.totalPrice * 100) / 100,
          note: item.note || '',
        })),
        title: form.title.trim(),
        contractNumber: form.contractNumber.trim(),
        description: form.description?.trim() || '',
        note: form.note?.trim() || '',
        paymentTermDays: Math.max(1, Math.round(form.paymentTermDays)),
        debtRecognitionMode: form.debtRecognitionMode,
        contractType: form.contractType,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        signDate: sign.toISOString(),
        totalValue: Math.round(form.totalValue * 100) / 100,
      };

      console.log('Contract update payload being sent:', JSON.stringify(payload, null, 2));

      await contractService.updateContract(payload);
      
      // Show success dialog
      setDialog({ 
        visible: true, 
        title: 'Cập nhật hợp đồng thành công', 
        message: 'Hợp đồng đã được cập nhật thành công.', 
        type: 'success' 
      });
      
      // Call onSuccess immediately for list refresh
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Contract update error:', error);
      
      // Parse error message for better user experience
      let errorMessage = 'Cập nhật hợp đồng thất bại. Vui lòng thử lại.';
      
      if (error?.message) {
        if (error.message.includes('supplier')) {
          errorMessage = 'Nhà cung cấp không hợp lệ';
        } else if (error.message.includes('variant')) {
          errorMessage = 'Sản phẩm không hợp lệ';
        } else if (error.message.includes('validation')) {
          errorMessage = 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại';
        }
      }
      
      setSnackbar({ visible: true, message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialog({ visible: false, title: '', message: '', type: 'success' });
    handleClose();
  };

  if (!visible || !contractId) return null;

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
            <Text style={styles.title}>Cập nhật hợp đồng</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          {loadingData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải dữ liệu hợp đồng...</Text>
            </View>
          ) : (
            <>
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
                        <Text style={styles.submitText}>Cập nhật</Text>
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
            </>
          )}
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
      
      <DialogNotification
        visible={dialog.visible}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        actions={[
          {
            text: 'Đóng',
            onPress: handleDialogClose,
            style: 'default',
          },
        ]}
        onDismiss={handleDialogClose}
      />
      
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray600,
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