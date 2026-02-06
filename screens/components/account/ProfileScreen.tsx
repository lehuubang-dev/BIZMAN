import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authService } from '../../../services/authService';

interface ProfileUser {
  id?: string;
  email?: string;
  role?: string;
  name?: string;
  phone?: string;
  avatar?: string;
}

interface BusinessProfile {
  id?: string;
  businessName?: string;
  taxCode?: string;
  businessType?: string;
  revenueClass?: string;
  plan?: string;
}

interface ProfileScreenProps {
  onBack: () => void;
}

export default function ProfileScreen({ onBack }: ProfileScreenProps) {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [userProfile, businessProfile] = await Promise.all([
        authService.getUserProfile(),
        authService.getBusinessProfile()
      ]);
      
      setUser({
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        name: businessProfile?.businessName || userProfile.email?.split('@')[0],
        phone: userProfile.phone,
        avatar: userProfile.avatar
      });
      
      setBusiness({
        id: businessProfile.id,
        businessName: businessProfile.businessName,
        taxCode: businessProfile.taxCode,
        businessType: businessProfile.businessType,
        revenueClass: businessProfile.revenueClass,
        plan: businessProfile.plan
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'USER': return 'Người dùng';
      case 'MANAGER': return 'Quản lý';
      default: return role || 'Chưa xác định';
    }
  };

  const getRevenueClassLabel = (revenueClass?: string) => {
    switch (revenueClass) {
      case 'A': return 'Hạng A';
      case 'B': return 'Hạng B';
      case 'C': return 'Hạng C';
      default: return revenueClass || 'Chưa phân loại';
    }
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
            <Ionicons name="close" size={24} color="#2196F3" />
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={45} color="#fff" />
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.name} numberOfLines={1}>
              {business?.businessName || user?.name || "Chưa có tên"}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email || "Chưa có email"}
            </Text>
            
            {/* Role Badge */}
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#2196F3" />
              <Text style={styles.roleText}>{getRoleLabel(user?.role)}</Text>
            </View>

            <TouchableOpacity style={styles.editProfileButton}>
              <Ionicons name="create-outline" size={18} color="#2196F3" />
              <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>

          {/* Business Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="business" size={20} color="#2196F3" />
              <Text style={styles.cardTitle}>Thông tin doanh nghiệp</Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="business-outline" size={22} color="#2196F3" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Tên doanh nghiệp</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {business?.businessName || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="document-text-outline" size={22} color="#FF9800" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Mã số thuế</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {business?.taxCode || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="stats-chart-outline" size={22} color="#4CAF50" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Hạng doanh thu</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {getRevenueClassLabel(business?.revenueClass)}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="call" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>Thông tin liên hệ</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="call-outline" size={22} color="#4CAF50" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {user?.phone || "Chưa cập nhật"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="mail-outline" size={22} color="#2196F3" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {user?.email || "Chưa cập nhật"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="location-outline" size={22} color="#FF5722" />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Địa chỉ giao/nhận</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  Thêm địa chỉ để tối ưu giao nhận
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      )}
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
    height: 240,
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
    top: 80,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    zIndex: 1,
    marginTop: 10,
  },
  backButton: {
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    marginTop: 20,
  },
  avatarWrapper: {
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF5722",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B1E2A",
    marginBottom: 6,
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    width: "80%",
    textAlign: "center",
  },
  editProfileButton: {
    flexDirection: "row",
    backgroundColor: "#F0F8FF",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  editProfileText: {
    color: "#2196F3",
    fontWeight: "600",
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTextGroup: {
    marginLeft: 4,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  quickActionsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    marginLeft: 4,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  tipIconWrapper: {
    marginRight: 12,
    paddingTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E65100",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: "#8D6E63",
    lineHeight: 18,
  },
  spacer: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 16,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B1E2A',
  },
});