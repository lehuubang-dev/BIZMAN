import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { purchaseOrderService } from '../../../../services';

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

interface DocumentsTabProps {
  form: any;
  setForm: (form: any) => void;
}

export default function DocumentsTab({ form, setForm }: DocumentsTabProps) {
  const [uploading, setUploading] = useState(false);

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
        multiple: true, // Allow multiple file selection
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        
        const uploadPromises = result.assets.map(async (asset) => {
          try {
            const documentId = await purchaseOrderService.uploadDocument({
              uri: asset.uri,
              name: asset.name,
              mimeType: asset.mimeType || 'application/octet-stream',
            });
            return { id: documentId, name: asset.name, success: true };
          } catch (error) {
            return { name: asset.name, success: false, error };
          }
        });

        const results = await Promise.all(uploadPromises);
        
        const successfulUploads = results.filter(r => r.success);
        const failedUploads = results.filter(r => !r.success);

        if (successfulUploads.length > 0) {
          const newDocumentIds = successfulUploads.map(r => r.id);
          setForm((prev: any) => ({
            ...prev,
            documents: [...prev.documents, ...newDocumentIds]
          }));
        }

        if (failedUploads.length > 0) {
          Alert.alert(
            'Cảnh báo',
            `Tải lên thành công ${successfulUploads.length} tài liệu. ${failedUploads.length} tài liệu tải lên thất bại.`
          );
        } else {
          Alert.alert('Thành công', `Đã tải lên ${successfulUploads.length} tài liệu`);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải lên tài liệu');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = (index: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa tài liệu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            setForm((prev: any) => ({
              ...prev,
              documents: prev.documents.filter((_: string, i: number) => i !== index)
            }));
          }
        },
      ]
    );
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return 'file-pdf-box';
      case 'doc':
      case 'docx':
        return 'file-word-box';
      case 'xls':
      case 'xlsx':
        return 'file-excel-box';
      case 'ppt':
      case 'pptx':
        return 'file-powerpoint-box';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'file-image';
      case 'zip':
      case 'rar':
        return 'zip-box';
      case 'txt':
        return 'file-document-outline';
      default:
        return 'file-outline';
    }
  };

  const getFileTypeColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return '#FF5722';
      case 'doc':
      case 'docx':
        return '#2196F3';
      case 'xls':
      case 'xlsx':
        return '#4CAF50';
      case 'ppt':
      case 'pptx':
        return '#FF9800';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '#E91E63';
      case 'zip':
      case 'rar':
        return '#9C27B0';
      default:
        return COLORS.gray600;
    }
  };

  const formatFileSize = (size: number) => {
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const documentCategories = [
    { key: 'contract', label: 'Hợp đồng chính', icon: 'file-document' },
    { key: 'attachment', label: 'Phụ lục', icon: 'paperclip' },
    { key: 'specification', label: 'Thông số kỹ thuật', icon: 'cog' },
    { key: 'quotation', label: 'Báo giá', icon: 'currency-usd' },
    { key: 'other', label: 'Khác', icon: 'folder' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="folder-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Tài liệu hợp đồng</Text>
          </View>

          {/* Upload Section */}
          <View style={styles.uploadSection}>
            <TouchableOpacity 
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]} 
              onPress={handleUploadDocument}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <MaterialCommunityIcons name="cloud-upload" size={24} color={COLORS.primary} />
              )}
              <View style={styles.uploadTextContainer}>
                <Text style={styles.uploadText}>
                  {uploading ? 'Đang tải lên...' : 'Tải lên tài liệu'}
                </Text>
                <Text style={styles.uploadSubtext}>
                  Hỗ trợ PDF, DOC, XLS, PPT, hình ảnh và các định dạng khác
                </Text>
              </View>
            </TouchableOpacity>

            {/* Quick Upload Categories */}
            <View style={styles.categoriesContainer}>
              <Text style={styles.categoriesTitle}>Loại tài liệu thường dùng</Text>
              <View style={styles.categoriesGrid}>
                {documentCategories.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={styles.categoryCard}
                    onPress={handleUploadDocument}
                  >
                    <MaterialCommunityIcons 
                      name={category.icon as any} 
                      size={20} 
                      color={COLORS.primary} 
                    />
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Documents List */}
          {form.documents.length > 0 && (
            <View style={styles.documentsSection}>
              <View style={styles.documentsHeader}>
                <Text style={styles.documentsTitle}>
                  Tài liệu đã tải lên ({form.documents.length})
                </Text>
                <TouchableOpacity 
                  style={styles.clearAllButton}
                  onPress={() => {
                    Alert.alert(
                      'Xác nhận xóa tất cả',
                      'Bạn có chắc chắn muốn xóa tất cả tài liệu?',
                      [
                        { text: 'Hủy', style: 'cancel' },
                        { 
                          text: 'Xóa tất cả', 
                          style: 'destructive',
                          onPress: () => setForm((prev: any) => ({ ...prev, documents: [] }))
                        },
                      ]
                    );
                  }}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={16} color={COLORS.error} />
                  <Text style={styles.clearAllText}>Xóa tất cả</Text>
                </TouchableOpacity>
              </View>

              {form.documents.map((documentId: string, index: number) => (
                <View key={index} style={styles.documentCard}>
                  <View style={styles.documentInfo}>
                    <MaterialCommunityIcons 
                      name={getFileTypeIcon(`document_${index}.pdf`)} 
                      size={24} 
                      color={getFileTypeColor(`document_${index}.pdf`)} 
                    />
                    <View style={styles.documentDetails}>
                      <Text style={styles.documentName}>Tài liệu {index + 1}</Text>
                      <Text style={styles.documentId}>ID: {documentId}</Text>
                      <Text style={styles.documentDate}>
                        Tải lên: {new Date().toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.documentActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <MaterialCommunityIcons name="eye-outline" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <MaterialCommunityIcons name="download-outline" size={16} color={COLORS.success} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleRemoveDocument(index)}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {form.documents.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="folder-open-outline" 
                size={64} 
                color={COLORS.gray400} 
              />
              <Text style={styles.emptyText}>Chưa có tài liệu nào</Text>
              <Text style={styles.emptySubtext}>
                Tải lên các tài liệu liên quan đến hợp đồng
              </Text>
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={handleUploadDocument}
              >
                <MaterialCommunityIcons name="plus" size={16} color={COLORS.white} />
                <Text style={styles.emptyActionText}>Tải lên tài liệu đầu tiên</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Upload Guidelines */}
          <View style={styles.guidelinesSection}>
            <View style={styles.guidelinesHeader}>
              <MaterialCommunityIcons name="information-outline" size={16} color={COLORS.primary} />
              <Text style={styles.guidelinesTitle}>Hướng dẫn tải lên</Text>
            </View>
            <View style={styles.guidelinesList}>
              <Text style={styles.guidelineItem}>• Kích thước tối đa: 10MB mỗi file</Text>
              <Text style={styles.guidelineItem}>• Định dạng hỗ trợ: PDF, DOC, XLS, PPT, JPG, PNG</Text>
              <Text style={styles.guidelineItem}>• Có thể tải lên nhiều file cùng một lúc</Text>
              <Text style={styles.guidelineItem}>• Tên file nên có ý nghĩa, tránh ký tự đặc biệt</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  uploadSection: {
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.primary + '05',
    marginBottom: 16,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  categoriesContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  categoryLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  documentsSection: {
    marginBottom: 24,
  },
  documentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearAllText: {
    fontSize: 12,
    color: COLORS.error,
  },
  documentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 2,
  },
  documentId: {
    fontSize: 11,
    color: COLORS.gray600,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray600,
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray400,
    marginBottom: 16,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  emptyActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  guidelinesSection: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  guidelinesList: {
    gap: 4,
  },
  guidelineItem: {
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 16,
  },
});