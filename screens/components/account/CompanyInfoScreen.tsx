import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type Props = {
  onBack: () => void;
};

export default function CompanyInfoScreen({ onBack }: Props) {
  const handleCall = (phone: string) => {
    const cleanNumber = phone.replace(/[-\s]/g, "");
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert("Lỗi", "Không thể thực hiện cuộc gọi");
    });
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert("Lỗi", "Không thể mở ứng dụng email");
    });
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Lỗi", "Không thể mở trình duyệt");
    });
  };

  const handleMap = () => {
    const address = "191/7 Đ. Hoàng Văn Thụ, Phường 8, Phú Nhuận, Thành phố Hồ Chí Minh 727010, Việt Nam";
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`).catch(() => {
      Alert.alert("Lỗi", "Không thể mở bản đồ");
    });
  };

  return (
    <View style={styles.container}>
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
            <Ionicons name="business" size={50} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>CCVI Technology</Text>
          <Text style={styles.headerSubtitle}>Giải pháp quản lý kho hàng thông minh</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
    
        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

          {/* Tax Code */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="document-text" size={24} color="#FF9800" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mã số thuế</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                0315121745
              </Text>
            </View>
          </View>

          {/* Address */}
          <TouchableOpacity
            style={styles.infoCard}
            onPress={handleMap}
            activeOpacity={0.7}
          >
            <View style={styles.infoIconWrapper}>
              <Ionicons name="location" size={24} color="#F44336" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Địa chỉ</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                Tầng 4, Hoàng Văn Thụ, HCM
              </Text>
              <Text style={styles.infoHint}>Nhấn để xem bản đồ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
          </TouchableOpacity>

          {/* Phone */}
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => handleCall("1900-1234")}
            activeOpacity={0.7}
          >
            <View style={styles.infoIconWrapper}>
              <Ionicons name="call" size={24} color="#4CAF50" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Hotline</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                0902 355 580
              </Text>
              <Text style={styles.infoHint}>Nhấn để gọi ngay</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => handleEmail("info@ccvi.vn")}
            activeOpacity={0.7}
          >
            <View style={styles.infoIconWrapper}>
              <Ionicons name="mail" size={24} color="#2196F3" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                info@ccvi.vn
              </Text>
              <Text style={styles.infoHint}>Nhấn để gửi email</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
          </TouchableOpacity>

          {/* Website */}
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => handleWebsite("https://ccvi.vn/")}
            activeOpacity={0.7}
          >
            <View style={styles.infoIconWrapper}>
              <Ionicons name="globe" size={24} color="#9C27B0" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                https://ccvi.vn
              </Text>
              <Text style={styles.infoHint}>Nhấn để truy cập</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
          </TouchableOpacity>
        </View>

        {/* About Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutIconRow}>
              <Ionicons name="information-circle" size={24} color="#2196F3" />
              <Text style={styles.aboutTitle}>Về CCVI Technology</Text>
            </View>
            <Text style={styles.aboutText}>
              CCVI Technology là đơn vị hàng đầu trong lĩnh vực cung cấp giải pháp
              quản lý kho hàng và logistics thông minh cho các doanh nghiệp vừa và nhỏ.
            </Text>
            <Text style={styles.aboutText}>
              Với sứ mệnh giúp doanh nghiệp tối ưu hóa quy trình quản lý hàng hóa,
              chúng tôi cam kết mang đến những công cụ đơn giản, hiệu quả và dễ sử dụng.
            </Text>
          </View>
        </View>

        {/* Mission & Vision */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sứ mệnh & Tầm nhìn</Text>

          <View style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <View style={[styles.missionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="rocket" size={28} color="#2196F3" />
              </View>
              <Text style={styles.missionTitle}>Sứ mệnh</Text>
            </View>
            <Text style={styles.missionText}>
              Giúp các doanh nghiệp vừa và nhỏ số hóa quy trình quản lý kho hàng,
              tăng hiệu suất vận hành và tiết kiệm chi phí.
            </Text>
          </View>

          <View style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <View style={[styles.missionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="eye" size={28} color="#FF9800" />
              </View>
              <Text style={styles.missionTitle}>Tầm nhìn</Text>
            </View>
            <Text style={styles.missionText}>
              Trở thành nền tảng quản lý kho hàng được tin dùng nhất tại Việt Nam,
              đồng hành cùng hàng ngàn doanh nghiệp phát triển bền vững.
            </Text>
          </View>
        </View>

        {/* Core Values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giá trị cốt lõi</Text>

          <View style={styles.valuesGrid}>
            <View style={styles.valueCard}>
              <View style={[styles.valueIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="shield-checkmark" size={32} color="#4CAF50" />
              </View>
              <Text style={styles.valueTitle}>Uy tín</Text>
              <Text style={styles.valueText} numberOfLines={2}>
                Đặt chữ tín lên hàng đầu
              </Text>
            </View>

            <View style={styles.valueCard}>
              <View style={[styles.valueIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="bulb" size={32} color="#2196F3" />
              </View>
              <Text style={styles.valueTitle}>Sáng tạo</Text>
              <Text style={styles.valueText} numberOfLines={2}>
                Luôn đổi mới và cải tiến
              </Text>
            </View>

            <View style={styles.valueCard}>
              <View style={[styles.valueIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="people" size={32} color="#FF9800" />
              </View>
              <Text style={styles.valueTitle}>Tận tâm</Text>
              <Text style={styles.valueText} numberOfLines={2}>
                Phục vụ khách hàng hết mình
              </Text>
            </View>

            <View style={styles.valueCard}>
              <View style={[styles.valueIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="trending-up" size={32} color="#9C27B0" />
              </View>
              <Text style={styles.valueTitle}>Hiệu quả</Text>
              <Text style={styles.valueText} numberOfLines={2}>
                Tối ưu hóa mọi quy trình
              </Text>
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
    backgroundColor: "#F5F7FA",
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
    width: "80%",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  companyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  companySlogan: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  infoHint: {
    fontSize: 11,
    color: "#2196F3",
    fontStyle: "italic",
  },
  aboutCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  aboutText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 22,
    marginBottom: 12,
  },
  missionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  missionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  missionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  missionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  valuesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  valueCard: {
    width: (width - 52) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  valueIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  valueText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
});