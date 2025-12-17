import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = { onBack: () => void };

const QA = ({ q, a }: { q: string; a: string }) => (
  <View style={styles.qa}>
    <Text style={styles.question}>{q}</Text>
    <Text style={styles.answer}>{a}</Text>
  </View>
);

export default function FAQScreen({ onBack }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#2196F3" />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Câu hỏi thường gặp</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <QA q="Làm sao để đăng ký tài khoản?" a="Chọn Đăng ký, điền thông tin và xác nhận." />
          <QA q="Quên mật khẩu xử lý thế nào?" a="Chọn Quên mật khẩu và làm theo hướng dẫn." />
          <QA q="Ứng dụng có miễn phí không?" a="Bạn có thể dùng miễn phí với một số giới hạn." />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  backText: { color: "#2196F3", fontWeight: "600", marginLeft: 2 },
  title: { fontSize: 18, fontWeight: "700", color: "#333" },
  content: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  qa: { marginBottom: 12 },
  question: { fontSize: 15, fontWeight: "700", color: "#333", marginBottom: 6 },
  answer: { fontSize: 14, color: "#555", lineHeight: 20 },
});
