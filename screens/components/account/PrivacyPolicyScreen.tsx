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

export default function PrivacyPolicyScreen({ onBack }: Props) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const sections = [
    {
      id: 1,
      title: "Thu thập dữ liệu",
      icon: "document-text",
      content:
        "Chúng tôi chỉ thu thập dữ liệu cần thiết để cung cấp dịch vụ và cải thiện trải nghiệm người dùng. Các thông tin được thu thập bao gồm: tên đăng nhập, địa chỉ email, thông tin kinh doanh cơ bản, và các dữ liệu liên quan đến sử dụng ứng dụng.",
    },
    {
      id: 2,
      title: "Lưu trữ & bảo vệ",
      icon: "shield-checkmark",
      content:
        "Dữ liệu được lưu trữ an toàn theo chuẩn ngành, với cơ chế mã hóa và phân quyền truy cập nghiêm ngặt. Chúng tôi sử dụng các công nghệ bảo mật tiên tiến để đảm bảo rằng dữ liệu của bạn luôn được bảo vệ khỏi truy cập trái phép.",
    },
    {
      id: 3,
      title: "Quyền của bạn",
      icon: "person",
      content:
        "Bạn có quyền xem, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân bất kỳ lúc nào theo quy định pháp luật. Để thực hiện bất kỳ yêu cầu nào, vui lòng liên hệ với chúng tôi thông qua email hoặc biểu mẫu hỗ trợ trong ứng dụng.",
    },
    {
      id: 4,
      title: "Chia sẻ dữ liệu",
      icon: "share-social",
      content:
        "Chúng tôi không bao giờ chia sẻ hoặc bán dữ liệu cá nhân của bạn cho bên thứ ba mà không có sự đồng ý rõ ràng từ bạn. Dữ liệu chỉ được chia sẻ với các đối tác dịch vụ tin cậy để cung cấp các tính năng của ứng dụng.",
    },
    {
      id: 5,
      title: "Cookie và Tracking",
      icon: "bug",
      content:
        "Ứng dụng của chúng tôi có thể sử dụng cookie và công nghệ theo dõi để cải thiện trải nghiệm người dùng. Bạn có thể kiểm soát các cài đặt này thông qua tùy chọn bảo mật trong ứng dụng.",
    },
    {
      id: 6,
      title: "Liên hệ với chúng tôi",
      icon: "call",
      content:
        "Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật của chúng tôi hoặc muốn bảo vệ quyền lợi của mình, vui lòng liên hệ: info@ccvi.vn hoặc gọi đến hotline hỗ trợ 0902 355 580.",
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
            <Ionicons name="shield-checkmark" size={50} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Chính sách bảo mật</Text>
          <Text style={styles.headerSubtitle}>
            Bảo vệ dữ liệu cá nhân là ưu tiên hàng đầu
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.introCard}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <Text style={styles.introText}>
            Chúng tôi cam kết bảo vệ quyền riêng tư của bạn với chuẩn an toàn
            quốc tế
          </Text>
        </View>

        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            onPress={() => toggleSection(section.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.card,
                expandedSection === section.id && styles.cardExpanded,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrapper}>
                  <View style={styles.iconBadge}>
                    <Ionicons
                      name={section.icon as any}
                      size={18}
                      color="#2196F3"
                    />
                  </View>
                  <Text style={styles.heading} numberOfLines={2}>
                    {section.title}
                  </Text>
                </View>
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

        <View style={styles.lastUpdatedCard}>
          <Ionicons name="time" size={20} color="#666" />
          <View style={styles.lastUpdatedText}>
            <Text style={styles.lastUpdatedLabel}>Cập nhật lần cuối</Text>
            <Text style={styles.lastUpdatedDate}>17 Tháng 12, 2025</Text>
          </View>
        </View>

        

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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  header: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 36,
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
    width: "85%",
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
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  introText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
  cardExpanded: {
    shadowOpacity: 0.08,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  cardTitleWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  heading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
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
  lastUpdatedCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: "#FFC107",
  },
  lastUpdatedText: {
    marginLeft: 12,
    flex: 1,
  },
  lastUpdatedLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  lastUpdatedDate: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    marginTop: 2,
  },
  contactCard: {
    backgroundColor: "linear-gradient(135deg, #2196F3, #1976D2)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#2196F3",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  contactButtonText: {
    color: "#2196F3",
    fontWeight: "600",
    fontSize: 13,
  },
  spacer: {
    height: 20,
  },
});