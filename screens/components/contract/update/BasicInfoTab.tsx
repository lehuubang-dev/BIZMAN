import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

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

interface BasicInfoTabProps {
  form: any;
  setForm: (form: any) => void;
  suppliers: any[];
}

export default function BasicInfoTab({ form, setForm, suppliers }: BasicInfoTabProps) {
  React.useEffect(() => {
    console.log('BasicInfoTab - Current form:', form);
  }, [form]);

  const handleInputChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Tiêu đề hợp đồng <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(text) => handleInputChange('title', text)}
            placeholder="Nhập tiêu đề hợp đồng"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Số hợp đồng <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={form.contractNumber}
            onChangeText={(text) => handleInputChange('contractNumber', text)}
            placeholder="Nhập số hợp đồng"
          />
        </View> */}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Nhà cung cấp <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.supplierId}
              onValueChange={(value) => handleInputChange('supplierId', value)}
              style={styles.picker}
            >
              <Picker.Item label="Chọn nhà cung cấp" value="" />
              {suppliers.map((supplier) => (
                <Picker.Item
                  key={supplier.id}
                  label={supplier.name}
                  value={supplier.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Nhập mô tả hợp đồng"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.note}
            onChangeText={(text) => handleInputChange('note', text)}
            placeholder="Nhập ghi chú"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Thông tin cơ bản của hợp đồng. Tiêu đề, số hợp đồng và nhà cung cấp là bắt buộc.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray800,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.gray800,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
});