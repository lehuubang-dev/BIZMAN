import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProductTab, ProductVariantTab, FloatingButtons, Product, COLORS } from './components/Inventory';
import ProductCreate from './components/Inventory/ProductCreate';
import { TagFilter } from './components/Inventory/TagFilter';

type TabType = 'products' | 'variants';

const InventoryScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('products');

  const handleConfirm = () => {
    console.log('Confirmed items:', selectedItems);
  };

  const handleChatPress = () => {
    console.log('Chat pressed');
  };

  const handleCartPress = () => {
    console.log('Cart pressed');
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

        {activeTab === 'products' && (
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
        )}

        <TouchableOpacity style={styles.helpButton} onPress={() => {
          console.log('Create Product button pressed');
          setShowCreateProduct(true);
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
            searchKeyword={searchText}
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

      <TagFilter
        visible={showTagFilter}
        onClose={() => setShowTagFilter(false)}
        selectedTags={selectedTags}
        onTagsChange={(tags) => {
          setSelectedTags(tags);
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