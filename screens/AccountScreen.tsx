import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./components/account/LoginScreen";
import SignupScreen from "./components/account/SignupScreen";
import ForgotPasswordScreen from "./components/account/ForgotPasswordScreen";

const { width } = Dimensions.get("window");

type AuthScreen = "login" | "signup" | "forgot-password";

interface UserData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export default function AccountScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AuthScreen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem("userInfo");
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (user: UserData) => {
    try {
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));
      setUserData(user);
      setIsLoggedIn(true);
      setCurrentScreen(null);
    } catch (error) {
      console.log("Failed to save user data:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userInfo");
            setUserData(null);
            setIsLoggedIn(false);
          } catch (error) {
            console.log("Failed to remove user data:", error);
          }
        },
      },
    ]);
  };

  if (currentScreen === "login") {
    return (
      <LoginScreen
        onSwitchToSignup={() => setCurrentScreen("signup")}
        onSwitchToForgotPassword={() => setCurrentScreen("forgot-password")}
        onBack={() => setCurrentScreen(null)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentScreen === "signup") {
    return (
      <SignupScreen
        onSwitchToLogin={() => setCurrentScreen("login")}
        onBack={() => setCurrentScreen(null)}
        onSignupSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentScreen === "forgot-password") {
    return (
      <ForgotPasswordScreen
        onSwitchToLogin={() => setCurrentScreen("login")}
        onBack={() => setCurrentScreen(null)}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {isLoggedIn ? (
        // Logged In View
        <View style={styles.content}>
          {/* Header Background */}
          <View style={styles.headerBackground}>
            <View style={styles.headerPattern1} />
            <View style={styles.headerPattern2} />
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {userData?.avatar ? (
                <Image
                  source={{ uri: userData.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color="#fff" />
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text
              style={styles.userName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {userData?.name || "Người dùng"}
            </Text>
            <Text
              style={styles.userEmail}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userData?.email || ""}
            </Text>

            {/* Membership Card */}
            <View style={styles.membershipCard}>
              <View style={styles.membershipLeft}>
                <View style={styles.membershipBadge}>
                  <Ionicons name="star" size={18} color="#fff" />
                </View>
                <View style={styles.membershipTextContainer}>
                  <Text style={styles.membershipTitle} numberOfLines={1}>
                    Thành viên Bạc
                  </Text>
                  <Text style={styles.membershipSubtitle} numberOfLines={1}>
                    ID: #MB{Math.floor(Math.random() * 100000)}
                  </Text>
                </View>
              </View>
              <View style={styles.pointsContainer}>
                <Text style={styles.pointsValue}>0</Text>
                <Text style={styles.pointsLabel} numberOfLines={1}>
                  Điểm
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: "#E3F2FD" },
                ]}
              >
                <Ionicons name="person-outline" size={24} color="#2196F3" />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>
                Hồ sơ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <Ionicons name="receipt-outline" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>
                Giao dịch
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: "#FFF3E0" },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#FF9800"
                />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>
                Thông báo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View
                style={[
                  styles.actionIconWrapper,
                  { backgroundColor: "#F3E5F5" },
                ]}
              >
                <Ionicons name="settings-outline" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.actionText} numberOfLines={1}>
                Cài đặt
              </Text>
            </TouchableOpacity>
          </View>

          {/* Menu Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin & Hỗ trợ</Text>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#2196F3" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuText} numberOfLines={1}>
                      Email hỗ trợ
                    </Text>
                    <Text style={styles.menuSubtext} numberOfLines={1}>
                      support@bizman.vn
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color="#4CAF50"
                    />
                  </View>
                  <Text style={styles.menuText} numberOfLines={1}>
                    Thông tin công ty
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#FF9800"
                    />
                  </View>
                  <Text style={styles.menuText} numberOfLines={1}>
                    Điều khoản sử dụng
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#9C27B0"
                    />
                  </View>
                  <Text style={styles.menuText} numberOfLines={1}>
                    Chính sách bảo mật
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons
                      name="help-circle-outline"
                      size={20}
                      color="#F44336"
                    />
                  </View>
                  <Text style={styles.menuText} numberOfLines={1}>
                    Câu hỏi thường gặp
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Not Logged In View
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeImageContainer}>
              <Ionicons name="business" size={80} color="#2196F3" />
            </View>
            <Text style={styles.welcomeTitle} numberOfLines={2}>
              Đăng ký thành viên
            </Text>
            <Text style={styles.welcomeSubtitle} numberOfLines={2}>
              Nhận ngay ưu đãi độc quyền!
            </Text>
          </View>

          {/* Benefits Preview */}
          <View style={styles.benefitsPreviewContainer}>
            <View style={styles.benefitPreviewCard}>
              <View
                style={[
                  styles.benefitPreviewIcon,
                  { backgroundColor: "#E3F2FD" },
                ]}
              >
                <Ionicons name="cube" size={36} color="#1E88E5" />
              </View>
              <Text style={styles.benefitPreviewTitle} numberOfLines={1}>
                Tồn kho
              </Text>
              <Text style={styles.benefitPreviewText} numberOfLines={2}>
                Theo dõi số lượng hàng hóa
              </Text>
            </View>

            <View style={styles.benefitPreviewCard}>
              <View
                style={[
                  styles.benefitPreviewIcon,
                  { backgroundColor: "#FFF3E0" },
                ]}
              >
                <Ionicons name="swap-horizontal" size={36} color="#FB8C00" />
              </View>
              <Text style={styles.benefitPreviewTitle} numberOfLines={1}>
                Nhập – xuất
              </Text>
              <Text style={styles.benefitPreviewText} numberOfLines={2}>
                Quản lý luồng nhập xuất
              </Text>
            </View>

            <View style={styles.benefitPreviewCard}>
              <View
                style={[
                  styles.benefitPreviewIcon,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <Ionicons name="document-text" size={36} color="#43A047" />
              </View>
              <Text style={styles.benefitPreviewTitle} numberOfLines={1}>
                Báo cáo
              </Text>
              <Text style={styles.benefitPreviewText} numberOfLines={2}>
                Xem số lượng & biến động
              </Text>
            </View>
          </View>

          {/* Auth Buttons */}
          <View style={styles.authButtonsContainer}>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => setCurrentScreen("signup")}
            >
              <Text style={styles.signupButtonText}>Đăng ký</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => setCurrentScreen("login")}
            >
              <Text style={styles.loginButtonText} numberOfLines={1}>
                 Đăng nhập
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#2196F3" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuText} numberOfLines={1}>
                      Email
                    </Text>
                    <Text style={styles.menuSubtext} numberOfLines={1}>
                      support@bizman.vn
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color="#4CAF50"
                    />
                  </View>
                  <Text style={styles.menuText} numberOfLines={1}>
                    Thông tin công ty
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#FF9800"
                    />
                  </View>
                  <Text style={styles.menuText} numberOfLines={1}>
                    Điều khoản sử dụng
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#9C27B0"
                    />
                  </View>
                  <Text style={styles.menuText} numberOfLines={1}>
                    Chính sách bảo mật
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrapper}>
                    <Ionicons
                      name="help-circle-outline"
                      size={20}
                      color="#F44336"
                    />
                  </View>
                  <Text style={styles.menuText} numberOfLines={1}>
                    Câu hỏi thường gặp
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    paddingBottom: 30,
  },

  // Header Background
  headerBackground: {
    height: 200,
    backgroundColor: "#2196F3",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
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
    top: 50,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  // Profile Section (Logged In)
  profileSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF9800",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 40,
    textAlign: "center",
    paddingHorizontal: 30,
    width: "100%",
  },
  membershipCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: width - 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  membershipLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  membershipBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFB74D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  membershipTextContainer: {
    flex: 1,
  },
  membershipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  membershipSubtitle: {
    fontSize: 12,
    color: "#999",
  },
  pointsContainer: {
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF9800",
  },
  pointsLabel: {
    fontSize: 11,
    color: "#FF9800",
    marginTop: 2,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickActionCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    width: (width - 60) / 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },

  // Benefits
  benefitCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  benefitCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    width: (width - 60) / 3,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  benefitDesc: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
    lineHeight: 14,
  },

  // Menu
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  menuSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#F44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
    marginLeft: 8,
  },

  // Welcome Section (Not Logged In)
  welcomeSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  welcomeImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  // Benefits Preview
  benefitsPreviewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  benefitPreviewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: (width - 60) / 3,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitPreviewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitPreviewTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  benefitPreviewText: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
    lineHeight: 14,
  },

  // Auth Buttons
  authButtonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  signupButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 8,
  },
  loginButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
  },

  // Version Text
  versionText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
});
