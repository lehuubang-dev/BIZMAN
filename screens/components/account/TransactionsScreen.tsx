import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TransactionsScreenProps {
  onBack: () => void;
}

const mockTransactions = [
  {
    id: "PN-2024-001",
    type: "Nhập kho",
    time: "09:10 • Hôm nay",
    status: "Đã duyệt",
    color: "#4CAF50",
  },
  {
    id: "PX-2024-014",
    type: "Xuất kho",
    time: "Hôm qua",
    status: "Chờ duyệt",
    color: "#FB8C00",
  },
  {
    id: "PX-2024-009",
    type: "Xuất kho",
    time: "2 ngày trước",
    status: "Đã giao",
    color: "#2196F3",
  },
];

export default function TransactionsScreen({
  onBack,
}: TransactionsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="close" size={22} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giao dịch</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {mockTransactions.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.row}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: `${item.color}1A` },
                ]}
              >
                <Ionicons
                  name={
                    (item.type === "Nhập kho"
                      ? "arrow-down-outline"
                      : "arrow-up-outline") as React.ComponentProps<
                      typeof Ionicons
                    >["name"]
                  }
                  size={20}
                  color={item.color}
                />
              </View>
              <View style={styles.textGroup}>
                <Text style={styles.title}>{item.id}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.type} • {item.time}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${item.color}1A` },
                ]}
              >
                <Text style={[styles.statusText, { color: item.color }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  headerTop: {
    paddingTop: 16,
    marginBottom: 16,
  },
  
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    marginLeft: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
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
  row: {
    flexDirection: "row",
    alignItems: "center",
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
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
