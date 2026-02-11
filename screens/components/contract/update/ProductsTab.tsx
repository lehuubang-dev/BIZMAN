import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
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
  warning: '#F59E0B',
};

interface ProductsTabProps {
  form: any;
  setForm: (form: any) => void;
  variants: any[];
  supplierId?: string;
  supplierName?: string;
}

export default function ProductsTab({ form, setForm, variants, supplierId, supplierName }: ProductsTabProps) {
  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);

  const handleAddItem = () => {
    const newItem = {
      variantId: '',
      taxRate: 0,
      taxAmount: 0,
      discountRate: 0,
      discountAmount: 0,
      quantity: 1,
      unitPrice: 0,
      subTotal: 0,
      totalPrice: 0,
      note: '',
    };
    setForm((prev: any) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (index: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            setForm((prev: any) => ({
              ...prev,
              items: prev.items.filter((_: any, i: number) => i !== index)
            }));
          }
        },
      ]
    );
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updatedItems = form.items.map((item: any, i: number) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto calculate when quantity, unitPrice, discountRate, or taxRate changes
        if (['quantity', 'unitPrice', 'discountRate', 'taxRate'].includes(field)) {
          const quantity = field === 'quantity' ? value : updatedItem.quantity;
          const unitPrice = field === 'unitPrice' ? value : updatedItem.unitPrice;
          const discountRate = field === 'discountRate' ? value : updatedItem.discountRate;
          const taxRate = field === 'taxRate' ? value : updatedItem.taxRate;
          
          // Calculate subTotal
          const subTotal = quantity * unitPrice;
          updatedItem.subTotal = subTotal;
          
          // Calculate discount amount
          const discountAmount = subTotal * (discountRate / 100);
          updatedItem.discountAmount = discountAmount;
          
          // Calculate after discount
          const afterDiscount = subTotal - discountAmount;
          
          // Calculate tax amount
          const taxAmount = afterDiscount * (taxRate / 100);
          updatedItem.taxAmount = taxAmount;
          
          // Calculate final total
          updatedItem.totalPrice = afterDiscount + taxAmount;
        }
        
        return updatedItem;
      }
      return item;
    });

    setForm((prev: any) => ({ ...prev, items: updatedItems }));
  };

  const handleVariantSelect = (variant: any) => {
    if (selectedItemIndex >= 0) {
      const updatedItems = [...form.items];
      const item = updatedItems[selectedItemIndex];
      
      // Ưu tiên dùng giá từ nhà cung cấp (defaultUnitPrice)
      const unitPrice = variant.defaultUnitPrice || variant.lastPurchaseCost || variant.standardCost || 0;
      
      // Tự động set thuế từ productGroup
      const taxRate = variant.product?.productGroup?.gtgttax || 0;
      
      // Tính toán với thuế
      const quantity = item.quantity;
      const subTotal = quantity * unitPrice;
      const discountAmount = subTotal * (item.discountRate / 100);
      const afterDiscount = subTotal - discountAmount;
      const taxAmount = afterDiscount * (taxRate / 100);
      const totalPrice = afterDiscount + taxAmount;
      
      updatedItems[selectedItemIndex] = {
        ...item,
        variantId: variant.id,
        unitPrice: unitPrice,
        taxRate: taxRate, // Tự động set từ productGroup
        taxAmount: Math.round(taxAmount * 100) / 100,
        subTotal: Math.round(subTotal * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100,
      };
      
      console.log('🏷️ Update: Auto-applied product info:', {
        productName: variant.name,
        unitPrice,
        taxRate,
        productGroup: variant.product?.productGroup?.name,
        calculation: { subTotal, taxAmount, totalPrice }
      });
      
      setForm((prev: any) => ({ ...prev, items: updatedItems }));
    }
    setShowVariantPicker(false);
    setSelectedItemIndex(-1);
  };

  const getSelectedVariant = (variantId: string) => {
    return variants.find(v => v.id === variantId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getTotalValue = () => {
    return form.items.reduce((total: number, item: any) => total + (item.totalPrice || 0), 0);
  };

  const getTotalQuantity = () => {
    return form.items.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="cube-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Sản phẩm</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Số sản phẩm:</Text>
              <Text style={styles.summaryValue}>{form.items.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng số lượng:</Text>
              <Text style={styles.summaryValue}>{getTotalQuantity()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng giá trị:</Text>
              <Text style={[styles.summaryValue, styles.amountText]}>
                {formatCurrency(getTotalValue())}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <MaterialCommunityIcons name="plus-circle" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Thêm sản phẩm</Text>
          </TouchableOpacity>

          {form.items.map((item: any, index: number) => {
            const selectedVariant = getSelectedVariant(item.variantId);
            return (
              <View key={index} style={styles.itemCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <MaterialCommunityIcons 
                      name="package-variant" 
                      size={20} 
                      color={COLORS.primary} 
                    />
                    <Text style={styles.cardTitle}>Sản phẩm {index + 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveItem(index)}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Chọn sản phẩm *</Text>
                  <TouchableOpacity
                    style={styles.productSelector}
                    onPress={() => {
                      setSelectedItemIndex(index);
                      setShowVariantPicker(true);
                    }}
                  >
                    <View style={styles.productInfo}>
                      {selectedVariant ? (
                        <View>
                          <Text style={styles.productName}>{selectedVariant.name}</Text>
                          <Text style={styles.productCode}>SKU: {selectedVariant.sku}</Text>
                          <Text style={styles.productPrice}>
                            Giá: {formatCurrency(selectedVariant.lastPurchaseCost || selectedVariant.standardCost || 0)}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.placeholderText}>Chọn sản phẩm</Text>
                      )}
                    </View>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.gray400} />
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Số lượng</Text>
                    <TextInput
                      style={styles.input}
                      value={item.quantity?.toString() || ''}
                      onChangeText={(text) => {
                        const quantity = parseInt(text) || 0;
                        handleUpdateItem(index, 'quantity', quantity);
                      }}
                      placeholder="1"
                      placeholderTextColor={COLORS.gray400}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Đơn giá</Text>
                    <TextInput
                      style={styles.input}
                      value={item.unitPrice?.toString() || ''}
                      onChangeText={(text) => {
                        const price = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
                        handleUpdateItem(index, 'unitPrice', price);
                      }}
                      placeholder="0"
                      placeholderTextColor={COLORS.gray400}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Chiết khấu (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={item.discountRate?.toString() || ''}
                      onChangeText={(text) => {
                        const discountRate = parseFloat(text) || 0;
                        handleUpdateItem(index, 'discountRate', Math.min(Math.max(discountRate, 0), 100));
                      }}
                      placeholder="0"
                      placeholderTextColor={COLORS.gray400}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Thuế (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={item.taxRate?.toString() || ''}
                      onChangeText={(text) => {
                        const taxRate = parseFloat(text) || 0;
                        handleUpdateItem(index, 'taxRate', Math.max(taxRate, 0));
                      }}
                      placeholder="0"
                      placeholderTextColor={COLORS.gray400}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Thành tiền</Text>
                  <Text style={styles.totalAmount}>
                    {formatCurrency(item.totalPrice || 0)}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ghi chú</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={item.note}
                    onChangeText={(text) => handleUpdateItem(index, 'note', text)}
                    placeholder="Nhập ghi chú"
                    placeholderTextColor={COLORS.gray400}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>
            );
          })}

          {form.items.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="package-variant-closed" 
                size={48} 
                color={COLORS.gray400} 
              />
              <Text style={styles.emptyText}>Chưa có sản phẩm</Text>
              <Text style={styles.emptySubtext}>Thêm sản phẩm vào hợp đồng</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Variant Picker Modal */}
      <Modal
        visible={showVariantPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVariantPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn sản phẩm ({variants?.length || 0} sản phẩm)</Text>
              <TouchableOpacity onPress={() => setShowVariantPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>
            
            {/* Supplier Filter Info */}
            {supplierId && supplierName && (
              <View style={styles.filterInfoCard}>
                <View style={styles.filterInfoHeader}>
                  <MaterialCommunityIcons name="filter-variant" size={16} color={COLORS.primary} />
                  <Text style={styles.filterInfoText}>
                    Hiển thị sản phẩm của: <Text style={styles.supplierNameText}>{supplierName}</Text>
                  </Text>
                </View>
                <Text style={styles.filterInfoSubtext}>
                  Có {variants.length} sản phẩm • Thuế và giá sẽ tự động áp dụng
                </Text>
              </View>
            )}
            
            <FlatList
              data={variants}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                // Handle different API response structures
                const productName = item.name || item.variant?.name || 'Sản phẩm không xác định';
                const productPrice = item.defaultUnitPrice || item.lastPurchaseCost || item.variant?.lastPurchaseCost || item.standardCost || item.variant?.standardCost || 0;
                
                return (
                  <TouchableOpacity
                    style={styles.productItem}
                    onPress={() => handleVariantSelect(item)}
                  >
                    <View style={styles.productItemInfo}>
                      <Text style={styles.productItemName}>{productName}</Text>
                      {item.sku && (
                        <Text style={styles.productItemSku}>SKU: {item.sku}</Text>
                      )}
                      {item.supplierSku && (
                        <Text style={styles.productItemSku}>SKU nhà CC: {item.supplierSku}</Text>
                      )}
                      {item.model && (
                        <Text style={styles.productItemSku}>Model: {item.model}</Text>
                      )}
                      <Text style={styles.productItemPrice}>
                        {formatCurrency(productPrice)}
                      </Text>
                      {item.supplier && (
                        <Text style={styles.productItemSupplier}>Nhà cung cấp: {item.supplier.name}</Text>
                      )}
                      {item.leadTimeDays && (
                        <Text style={styles.productItemLeadTime}>Thời gian giao: {item.leadTimeDays} ngày</Text>
                      )}
                      {item.product?.productGroup?.gtgttax && (
                        <Text style={styles.productItemTax}>Thuế GTGT: {item.product.productGroup.gtgttax}%</Text>
                      )}
                      <Text style={styles.productItemUnit}>Đơn vị: {item.unit || 'Chiếc'}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray400} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
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
  itemCard: {
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
  productSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  productCode: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.gray400,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  totalCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
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
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  productItemInfo: {
    flex: 1,
  },
  productItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  productItemSku: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  productItemPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  filterInfoCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  filterInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterInfoText: {
    fontSize: 13,
    color: COLORS.gray800,
    fontWeight: '500',
  },
  supplierNameText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  filterInfoSubtext: {
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 4,
    fontStyle: 'italic',
  },
  productItemSupplier: {
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 2,
  },
  productItemLeadTime: {
    fontSize: 11,
    color: COLORS.warning,
    marginTop: 1,
    fontWeight: '500',
  },
  productItemTax: {
    fontSize: 11,
    color: COLORS.success,
    marginTop: 1,
    fontWeight: '500',
  },
  productItemUnit: {
    fontSize: 11,
    color: COLORS.gray600,
    marginTop: 1,
    fontStyle: 'italic',
  },
});