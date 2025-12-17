import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="close" size={22} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông báo</Text>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Thông báo đẩy</Text>
              <Text style={styles.rowSubtitle}>Cảnh báo tồn kho, phiếu chờ duyệt</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: "#E0E0E0", true: "#BBDEFB" }} thumbColor={pushEnabled ? "#2196F3" : "#f4f3f4"} />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Email</Text>
              <Text style={styles.rowSubtitle}>Gửi báo cáo cuối ngày</Text>
            </View>
            <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: "#E0E0E0", true: "#C8E6C9" }} thumbColor={emailEnabled ? "#4CAF50" : "#f4f3f4"} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đồng bộ</Text>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Tự đồng bộ</Text>
              <Text style={styles.rowSubtitle}>Đồng bộ dữ liệu kho mỗi 15 phút</Text>
            </View>
            <Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ false: "#E0E0E0", true: "#FFECB3" }} thumbColor={autoSync ? "#FFB300" : "#f4f3f4"} />
          </View>
        </View>

        <TouchableOpacity style={styles.rowAction}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Sao lưu dữ liệu</Text>
            <Text style={styles.rowSubtitle}>Xuất file sao lưu kho</Text>
          </View>
          <Ionicons name="cloud-upload-outline" size={20} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowAction}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Khôi phục dữ liệu</Text>
            <Text style={styles.rowSubtitle}>Nhập file đã sao lưu</Text>
          </View>
          <Ionicons name="cloud-download-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B1E2A",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  rowAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 12,
  },
});
