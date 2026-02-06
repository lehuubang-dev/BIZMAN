import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProductTab, ProductVariantTab, FloatingButtons, Product, COLORS, SupplierFilter, ProductCreate, ProductVariantCreate } from './components/Inventory';
import { TagFilter } from './components/Inventory/TagFilter';

type TabType = 'products' | 'variants';

const InventoryScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('products');
  
  // States riêng cho tab variants
  const [variantSearchText, setVariantSearchText] = useState('');
  const [showSupplierFilter, setShowSupplierFilter] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  const handleConfirm = () => {
    console.log('Confirmed items:', selectedItems);
  };

  const handleChatPress = () => {
    console.log('Chat pressed');
  };

  const handleCartPress = () => {
    console.log('Cart pressed');
  };

  const handleCreateProduct = () => {
    console.log('Create product pressed');
    setShowCreateProduct(true);
  };

  const handleCreateVariant = () => {
    console.log('Create variant pressed');
    setShowCreateVariant(true);
  };

  const renderTabButton = (tab: TabType, title: string, icon: string) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={isActive ? COLORS.white : COLORS.gray600}
        />
        <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const getCurrentSearchText = () => {
    return activeTab === 'products' ? searchText : variantSearchText;
  };

  const setCurrentSearchText = (text: string) => {
    if (activeTab === 'products') {
      setSearchText(text);
    } else {
      setVariantSearchText(text);
    }
  };

  const getCurrentPlaceholder = () => {
    return activeTab === 'products' ? 'Tìm kiếm sản phẩm...' : 'Tìm kiếm biến thể...';
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
            placeholder={getCurrentPlaceholder()}
            placeholderTextColor={COLORS.gray400}
            value={getCurrentSearchText()}
            onChangeText={setCurrentSearchText}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {getCurrentSearchText() ? (
            <TouchableOpacity onPress={() => setCurrentSearchText('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={COLORS.gray400}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter button - different for each tab */}
        {activeTab === 'products' ? (
          <TouchableOpacity 
            style={[styles.filterButton, selectedTags.length > 0 && styles.filterButtonActive]} 
            onPress={() => setShowTagFilter(true)}
          >
            <MaterialCommunityIcons
              name="tune-vertical"
              size={20}
              color={COLORS.primary}
            />
            {selectedTags.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedTags.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.filterButton, selectedSuppliers.length > 0 && styles.filterButtonActive]} 
            onPress={() => setShowSupplierFilter(true)}
          >
            <MaterialCommunityIcons
              name="account-group"
              size={20}
              color={COLORS.primary}
            />
            {selectedSuppliers.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedSuppliers.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Add button */}
        <TouchableOpacity style={styles.helpButton} onPress={() => {
          if (activeTab === 'products') {
            handleCreateProduct();
          } else {
            handleCreateVariant();
          }
        }}>
          <MaterialCommunityIcons
            name="plus-circle"
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('products', 'Sản phẩm', 'package-variant-closed')}
        {renderTabButton('variants', 'Biến thể', 'package-variant')}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'products' ? (
          <ProductTab
            refreshTrigger={refreshTrigger}
            searchKeyword={searchText}
            filterTags={selectedTags}
          />
        ) : (
          <ProductVariantTab
            refreshTrigger={refreshTrigger}
            searchKeyword={variantSearchText}
            selectedSuppliers={selectedSuppliers}
          />
        )}
      </View>

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

      {showCreateProduct && (
        <>
          {console.log('Rendering ProductCreate modal', showCreateProduct)}
          <ProductCreate 
            onClose={() => {
              console.log('ProductCreate onClose called');
              setShowCreateProduct(false);
            }} 
            onSuccess={() => {
              console.log('ProductCreate onSuccess called');
              setRefreshTrigger(prev => prev + 1);
            }} 
          />
        </>
      )}

      {showCreateVariant && (
        <>
          {console.log('Rendering ProductVariantCreate modal', showCreateVariant)}
          <ProductVariantCreate 
            onClose={() => {
              console.log('ProductVariantCreate onClose called');
              setShowCreateVariant(false);
            }} 
            onSuccess={() => {
              console.log('ProductVariantCreate onSuccess called');
              setRefreshTrigger(prev => prev + 1);
              setShowCreateVariant(false);
            }} 
          />
        </>
      )}

      <TagFilter
        visible={showTagFilter}
        onClose={() => setShowTagFilter(false)}
        selectedTags={selectedTags}
        onTagsChange={(tags) => {
          setSelectedTags(tags);
          setRefreshTrigger(prev => prev + 1);
        }}
      />

      <SupplierFilter
        visible={showSupplierFilter}
        onClose={() => setShowSupplierFilter(false)}
        selectedSupplierIds={selectedSuppliers}
        onSuppliersChange={(supplierIds) => {
          setSelectedSuppliers(supplierIds);
          setRefreshTrigger(prev => prev + 1);
        }}
      />
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
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: COLORS.gray100,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  tabButtonTextActive: {
    color: COLORS.white,
  },
  tabContent: {
    flex: 1,
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