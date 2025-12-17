import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface NotificationsScreenProps {
  onBack: () => void;
}

const mockNotifications = [
  {
    id: "1",
    title: "Phiếu nhập mới",
    message: "Phiếu PN-2024-001 vừa được tạo.",
    time: "5 phút trước",
    icon: "download-outline",
    color: "#4CAF50",
  },
  {
    id: "2",
    title: "Phiếu xuất chờ duyệt",
    message: "PX-2024-014 cần duyệt trước 17h.",
    time: "30 phút trước",
    icon: "alert-circle-outline",
    color: "#FB8C00",
  },
  {
    id: "3",
    title: "Tồn kho thấp",
    message: "SP-001 còn dưới mức tối thiểu.",
    time: "Hôm qua",
    icon: "warning-outline",
    color: "#E53935",
  },
];

export default function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="close" size={22} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {mockNotifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: `${item.color}1A` }] }>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View style={styles.textGroup}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        ))}
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
    marginLeft: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: "#6B7280",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8F0F7",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: "#455A64",
    lineHeight: 18,
  },
});
