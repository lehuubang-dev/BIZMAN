import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProductList, FloatingButtons, Product, COLORS } from './components/Inventory';
import ProductDetail from './components/Inventory/ProductDetail';
import ProductCreate from './components/Inventory/ProductCreate';
import ProductUpdate from './components/Inventory/ProductUpdate';

const InventoryScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [updateProductId, setUpdateProductId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectProduct = (product: Product) => {
    // Open product detail instead of toggling selection
    setDetailProductId(product.id);
  };

  const handleUpdateProduct = (product: Product) => {
    setUpdateProductId(product.id);
  };

  const handleConfirm = () => {
    console.log('Confirmed items:', selectedItems);
  };

  const handleChatPress = () => {
    console.log('Chat pressed');
  };

  const handleCartPress = () => {
    console.log('Cart pressed');
  };

  return (
    <View style={styles.container}>
      {/* Search & Filter Bar */}
      <View style={styles.searchBar}>
        <View
          style={[
            styles.searchInputContainer,
            searchFocused && styles.searchInputContainerFocused,
          ]}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={searchFocused ? COLORS.primary : COLORS.gray400}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm thông tin ..."
            placeholderTextColor={COLORS.gray400}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={COLORS.gray400}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons
            name="tune-vertical"
            size={20}
            color={COLORS.primary}
          />
        </TouchableOpacity>

          {/* Thêm Hàng hóa */}
        <TouchableOpacity style={styles.helpButton} onPress={() => setShowCreateProduct(true)}>
          <MaterialCommunityIcons
            name="plus-circle"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <ProductList
        selectedItems={selectedItems}
        onSelectProduct={handleSelectProduct}
        onUpdateProduct={handleUpdateProduct}
        refreshTrigger={refreshTrigger}
        searchKeyword={searchText}
      />

      {/* Bottom Action Buttons */}
      {selectedItems.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.selectedCounter}>
            <Text style={styles.selectedCountText}>
              {selectedItems.length} sản phẩm được chọn
            </Text>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Buttons */}
      <FloatingButtons
        selectedCount={selectedItems.length}
        onChatPress={handleChatPress}
        onCartPress={handleCartPress}
      />

      {detailProductId && (
        <ProductDetail productId={detailProductId} onClose={() => setDetailProductId(null)} />
      )}

      {showCreateProduct && (
        <ProductCreate 
          onClose={() => setShowCreateProduct(false)} 
          onSuccess={() => {
            setRefreshTrigger(prev => prev + 1);
          }} 
        />
      )}

      {updateProductId && (
        <ProductUpdate
          productId={updateProductId}
          onClose={() => setUpdateProductId(null)}
          onSuccess={() => {
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    height: 48,
  },
  searchInputContainerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.gray800,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  selectedCounter: {
    flex: 1,
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  confirmButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default InventoryScreen;