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

const FAQItem = ({
  q,
  a,
  expanded,
  onPress,
}: {
  q: string;
  a: string;
  expanded: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.qaCard, expanded && styles.qaCardExpanded]}>
      <View style={styles.qaHeader}>
        <View style={styles.qIconWrapper}>
          <Ionicons name="help-circle" size={20} color="#2196F3" />
        </View>
        <Text style={styles.question} numberOfLines={expanded ? 0 : 2}>
          {q}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#2196F3"
        />
      </View>
      {expanded && (
        <View style={styles.answerWrapper}>
          <Text style={styles.answer}>{a}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export default function FAQScreen({ onBack }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqData = [
    {
      id: 1,
      q: "Làm sao để đăng ký tài khoản?",
      a: "Bạn có thể đăng ký tài khoản bằng cách: 1) Chọn nút Đăng ký trên màn hình đăng nhập, 2) Điền thông tin cá nhân (email, số điện thoại, mật khẩu), 3) Xác nhận email hoặc số điện thoại, 4) Hoàn thành thiết lập hồ sơ. Quá trình này chỉ mất khoảng 2-3 phút.",
    },
    {
      id: 2,
      q: "Quên mật khẩu xử lý thế nào?",
      a: "Nếu quên mật khẩu, hãy: 1) Chọn 'Quên mật khẩu' trên màn hình đăng nhập, 2) Nhập email hoặc số điện thoại được liên kết với tài khoản, 3) Nhận mã xác nhận qua email/SMS, 4) Tạo mật khẩu mới và đăng nhập lại. Bạn sẽ nhận được email xác nhận nếu quá trình thành công.",
    },
    {
      id: 3,
      q: "Ứng dụng có miễn phí không?",
      a: "Có, BizMan cung cấp gói miễn phí với các tính năng cơ bản bao gồm: quản lý tối đa 5 sản phẩm, báo cáo hàng ngày, và hỗ trợ email. Để truy cập các tính năng nâng cao như báo cáo tùy chỉnh và hỗ trợ ưu tiên, bạn có thể nâng cấp lên gói Premium.",
    },
    {
      id: 4,
      q: "Làm sao để thay đổi thông tin hồ sơ?",
      a: "Để cập nhật thông tin hồ sơ: 1) Truy cập mục Cài đặt từ menu chính, 2) Chọn 'Chỉnh sửa hồ sơ', 3) Sửa các thông tin cần thiết (tên, email, số điện thoại, ảnh đại diện), 4) Bấm 'Lưu' để xác nhận. Các thay đổi sẽ được cập nhật ngay lập tức trên tất cả các thiết bị.",
    },
    {
      id: 5,
      q: "Dữ liệu của tôi có an toàn không?",
      a: "Chúng tôi sử dụng mã hóa SSL 256-bit để bảo vệ tất cả dữ liệu truyền tải. Dữ liệu được lưu trữ trên máy chủ an toàn với bản sao lưu tự động hàng ngày. Chúng tôi tuân thủ đầy đủ các quy định bảo mật GDPR và pháp luật bảo vệ dữ liệu cá nhân.",
    },
    {
      id: 6,
      q: "Tôi có thể hủy đăng ký khi nào?",
      a: "Bạn có thể hủy đăng ký bất cứ lúc nào. Để hủy: 1) Vào Cài đặt > Quản lý tài khoản, 2) Chọn 'Hủy đăng ký', 3) Xác nhận lý do (không bắt buộc), 4) Bấm 'Xác nhận hủy'. Tài khoản sẽ bị xóa vĩnh viễn sau 30 ngày, trong thời gian này bạn có thể phục hồi.",
    },
    {
      id: 7,
      q: "Ứng dụng hỗ trợ những nền tảng nào?",
      a: "BizMan hiện tương thích với iOS 12.0+ và Android 8.0+. Ứng dụng có kích thước khoảng 50MB trên iOS và 60MB trên Android. Chúng tôi đang phát triển phiên bản web để người dùng có thể truy cập từ trình duyệt desktop.",
    },
    {
      id: 8,
      q: "Làm sao liên hệ với hỗ trợ khách hàng?",
      a: "Bạn có thể liên hệ với chúng tôi thông qua: Email: info@ccvi.vn, Điện thoại: 0902 355 580 (08:00-18:00 hàng ngày), Chat trực tuyến: Trong ứng dụng chọn 'Hỗ trợ', Form liên hệ: Trên website www.bizman.com. Thời gian phản hồi trung bình là 2-4 giờ.",
    },
  ];

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
            <Ionicons name="help-circle" size={50} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Câu hỏi thường gặp</Text>
          <Text style={styles.headerSubtitle}>
            Tìm kiếm câu trả lời cho những thắc mắc
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >

        <View style={styles.faqContainer}>
          <Text style={styles.sectionTitle}>Các câu hỏi phổ biến</Text>

          {faqData.map((item) => (
            <FAQItem
              key={item.id}
              q={item.q}
              a={item.a}
              expanded={expandedId === item.id}
              onPress={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
            />
          ))}
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
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
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
  statsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2196F3",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#EEE",
  },
  searchCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8EEF5",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: "#999",
    marginLeft: 12,
  },
  faqContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  qaCard: {
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
  qaCardExpanded: {
    shadowOpacity: 0.08,
    elevation: 3,
  },
  qaHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  qIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  question: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
  },
  answerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FAFBFC",
  },
  answer: {
    fontSize: 13,
    color: "#555",
    lineHeight: 21,
    fontWeight: "400",
  },
  needHelpCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  needHelpTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 12,
    marginBottom: 6,
  },
  needHelpText: {
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  spacer: {
    height: 20,
  },
});