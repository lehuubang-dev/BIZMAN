import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { productService } from '../../../services/productService';

interface Tag {
  id: string;
  name: string;
}

interface TagFilterProps {
  visible: boolean;
  onClose: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  visible,
  onClose,
  selectedTags,
  onTagsChange,
}) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAvailableTags();
    }
  }, [visible]);

  const fetchAvailableTags = async () => {
    setLoading(true);
    try {
      // Get all products to extract unique tags
      const products = await productService.getProducts();
      const tagMap = new Map<string, Tag>();
      
      products.forEach((product: any) => {
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach((tag: any) => {
            if (!tagMap.has(tag.name)) {
              tagMap.set(tag.name, {
                id: tag.id,
                name: tag.name,
              });
            }
          });
        }
      });
      
      setAllTags(Array.from(tagMap.values()));
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách tags');
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(tag => tag !== tagName)
      : [...selectedTags, tagName];
    
    onTagsChange(newSelectedTags);
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  const handleApply = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Lọc theo Tags</Text>
          
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Tags Count */}
        {selectedTags.length > 0 && (
          <View style={styles.selectedInfo}>
            <MaterialCommunityIcons name="tag-multiple" size={16} color={COLORS.primary} />
            <Text style={styles.selectedInfoText}>
              Đã chọn {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Tags List */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải tags...</Text>
            </View>
          ) : (
            <View style={styles.tagsContainer}>
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tagItem,
                      isSelected && styles.tagItemSelected,
                    ]}
                    onPress={() => handleTagToggle(tag.name)}
                  >
                    <View style={styles.tagContent}>
                      <MaterialCommunityIcons
                        name={isSelected ? "tag" : "tag-outline"}
                        size={18}
                        color={isSelected ? COLORS.white : COLORS.primary}
                      />
                      <Text style={[
                        styles.tagText,
                        isSelected && styles.tagTextSelected,
                      ]}>
                        {tag.name}
                      </Text>
                    </View>
                    
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={COLORS.white}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
              
              {allTags.length === 0 && !loading && (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="tag-off" size={48} color={COLORS.gray400} />
                  <Text style={styles.emptyText}>Chưa có tags nào</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
          >
            <MaterialCommunityIcons name="check" size={20} color={COLORS.white} />
            <Text style={styles.applyButtonText}>
              Áp dụng {selectedTags.length > 0 ? `(${selectedTags.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  selectedInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  tagsContainer: {
    padding: 20,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  tagItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tagText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  tagTextSelected: {
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});