import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = { onBack: () => void };

export default function TermsOfServiceScreen({ onBack }: Props) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const sections = [
    {
      id: 1,
      title: "1. Chấp nhận điều khoản",
      content:
        "Bằng việc sử dụng ứng dụng BizMan, bạn đồng ý tuân thủ theo các điều khoản và chính sách được nêu dưới đây. Chúng tôi cam đảm bảo rằng mọi điều khoản được thiết kế để bảo vệ quyền lợi của cả người dùng và nhà cung cấp dịch vụ.",
    },
    {
      id: 2,
      title: "2. Tài khoản",
      content:
        "Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động phát sinh từ tài khoản của mình. Vui lòng đảm bảo rằng bạn sử dụng mật khẩu mạnh và không chia sẻ thông tin đăng nhập với bất kỳ ai. Nếu phát hiện hoạt động bất thường, hãy liên hệ với chúng tôi ngay lập tức.",
    },
    {
      id: 3,
      title: "3. Sử dụng hợp lệ",
      content:
        "Không sử dụng ứng dụng cho mục đích trái pháp luật hoặc gây ảnh hưởng đến quyền và lợi ích hợp pháp của bên thứ ba. Bạn cam kết sử dụng dịch vụ của chúng tôi một cách có trách nhiệm và tuân thủ tất cả các luật hiện hành.",
    },
    {
      id: 4,
      title: "4. Giới hạn trách nhiệm",
      content:
        "BizMan không chịu trách nhiệm cho các thiệt hại gián tiếp hoặc không dự tính phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi.",
    },
    {
      id: 5,
      title: "5. Thay đổi điều khoản",
      content:
        "Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải lên ứng dụng.",
    },
  ];

  const toggleSection = (id: number) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Background */}
      <View style={styles.headerBackground} pointerEvents="none">
        <View style={styles.headerPattern1} />
        <View style={styles.headerPattern2} />
        <View style={styles.headerPattern3} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color="#2196F3" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="document-text" size={50} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Điều khoản sử dụng</Text>
          <Text style={styles.headerSubtitle}>Giải pháp quản lý doanh nghiệp thông minh</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.introCard}>
          <Ionicons name="shield-checkmark" size={32} color="#2196F3" />
          <Text style={styles.introText}>
            Vui lòng đọc kỹ các điều khoản dưới đây
          </Text>
        </View>

        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            onPress={() => toggleSection(section.id)}
            activeOpacity={0.7}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.heading} numberOfLines={2}>
                  {section.title}
                </Text>
                <Ionicons
                  name={
                    expandedSection === section.id
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color="#2196F3"
                />
              </View>

              {expandedSection === section.id && (
                <View style={styles.expandedContent}>
                  <Text style={styles.text}>{section.content}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: "#2196F3",
    overflow: "hidden",
    zIndex: 0,
  },
  headerPattern1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerPattern2: {
    position: "absolute",
    top: 100,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  headerPattern3: {
    position: "absolute",
    bottom: -20,
    right: 80,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  header: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 33,
    zIndex: 1,
  },
  backButton: {
    marginBottom: 10,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: "center",
    zIndex: 1,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
    borderWidth: 3,
    borderColor: "#fff",
    
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    width: "80%",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  introCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    borderRightColor: "#2196F3",
    borderRightWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  introText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8EEF5",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  heading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 12,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  text: {
    fontSize: 13,
    color: "#555",
    lineHeight: 21,
    fontWeight: "400",
  },
  spacer: {
    height: 20,
  },
});