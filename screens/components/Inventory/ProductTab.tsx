import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ProductList, Product, COLORS } from './index';
import ProductDetail from './ProductDetail';
import ProductCreate from './ProductCreate';
import ProductUpdate from './ProductUpdate';

interface ProductTabProps {
  refreshTrigger?: number;
  searchKeyword?: string;
  filterTags?: string[];
}

export const ProductTab: React.FC<ProductTabProps> = ({
  refreshTrigger,
  searchKeyword,
  filterTags,
}) => {
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [updateProductId, setUpdateProductId] = useState<string | null>(null);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);

  const handleSelectProduct = (product: Product) => {
    // Open product detail instead of toggling selection
    setDetailProductId(product.id);
  };

  const handleUpdateProduct = (product: Product) => {
    setUpdateProductId(product.id);
  };

  return (
    <View style={styles.container}>
      <ProductList
        selectedItems={selectedItems}
        onSelectProduct={handleSelectProduct}
        onUpdateProduct={handleUpdateProduct}
        refreshTrigger={refreshTrigger || 0 + localRefreshTrigger}
        searchKeyword={searchKeyword}
        filterTags={filterTags}
      />

      {detailProductId && (
        <ProductDetail 
          productId={detailProductId} 
          onClose={() => setDetailProductId(null)} 
        />
      )}

      {showCreateProduct && (
        <ProductCreate 
          onClose={() => setShowCreateProduct(false)} 
          onSuccess={() => {
            setLocalRefreshTrigger(prev => prev + 1);
          }} 
        />
      )}

      {updateProductId && (
        <ProductUpdate
          productId={updateProductId}
          onClose={() => setUpdateProductId(null)}
          onSuccess={() => {
            setLocalRefreshTrigger(prev => prev + 1);
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
});