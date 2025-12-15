import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../../services';
import { ApiError } from '../../../types';

const { width } = Dimensions.get('window');

interface ForgotPasswordScreenProps {
  onSwitchToLogin: () => void;
  onBack: () => void;
}

export default function ForgotPasswordScreen({ 
  onSwitchToLogin, 
  onBack 
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const otpInputs = useRef<Array<TextInput | null>>([]);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
        countdownTimer.current = null;
      }
    };
  }, []);

  const validateEmail = (email: string) => {
    const value = email.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    return gmailRegex.test(value);
  };

  const startCountdown = () => {
    // Clear existing timer
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    
    // Set initial countdown
    setCountdown(60);
    
    // Start new timer
    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimer.current) {
            clearInterval(countdownTimer.current);
            countdownTimer.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Thông báo', 'Email phải là địa chỉ Gmail (@gmail.com)');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendForgotPasswordOTP({ email });
      // Proceed to OTP step without success alert
      setStep('code');
      startCountdown();
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 300);
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Lỗi', apiError.message || 'Không thể gửi mã xác nhận');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await authService.sendForgotPasswordOTP({ email });
      setOtp(['', '', '', '', '', '']);
      startCountdown();
      otpInputs.current[0]?.focus();
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Lỗi', apiError.message || 'Không thể gửi lại mã');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    // No verify-otp endpoint; proceed to password step directly
    setStep('password');
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword({ email, otp: otp.join(''), newPassword });
      // Navigate to login immediately without success alert
      onSwitchToLogin();
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Lỗi', apiError.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'email') {
      onBack();
    } else if (step === 'code') {
      setStep('email');
    } else {
      setStep('code');
    }
  };

  const getStepInfo = () => {
    switch (step) {
      case 'email':
        return {
          icon: 'mail-outline',
          title: 'Quên mật khẩu?',
          subtitle: 'Nhập email để nhận mã xác nhận',
        };
      case 'code':
        return {
          icon: 'shield-checkmark-outline',
          title: 'Xác thực OTP',
          subtitle: 'Nhập mã được gửi đến email',
        };
      case 'password':
        return {
          icon: 'key-outline',
          title: 'Đặt mật khẩu mới',
          subtitle: 'Tạo mật khẩu mạnh để bảo vệ tài khoản',
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
    >
      {/* Header Background */}
      <View style={styles.headerBackground} pointerEvents="none">
        <View style={styles.pattern1} />
        <View style={styles.pattern2} />
      </View>

      {/* Back Button */}
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <View style={styles.backButtonCircle}>
          <Ionicons name="arrow-back" size={24} color="#2196F3" />
        </View>
      </TouchableOpacity>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill, 
            { width: step === 'email' ? '33%' : step === 'code' ? '66%' : '100%' }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {step === 'email' ? '1' : step === 'code' ? '2' : '3'}/3
        </Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={false}
        nestedScrollEnabled
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name={stepInfo.icon as any} size={50} color="#fff" />
          </View>
          <Text style={styles.title}>{stepInfo.title}</Text>
          <Text style={styles.subtitle}>{stepInfo.subtitle}</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              <View style={styles.inputGroup}>
                
                <View style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused
                ]}
                  onStartShouldSetResponder={() => true}
                >
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={emailFocused ? '#2196F3' : '#999'} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập email của bạn"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    editable={!loading}
                  />
                  {email.length > 0 && (
                    <TouchableOpacity 
                      onPress={() => setEmail('')}
                      style={styles.clearButton}
                    >
                      <Ionicons name="close-circle" size={18} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={18} color="#2196F3" />
                <Text style={styles.infoText}>
                  Chúng tôi sẽ gửi mã xác nhận 6 số đến email của bạn
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {loading ? (
                    <>
                      <View style={styles.loadingDot} />
                      <Text style={styles.primaryButtonText}>Đang gửi...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Gửi mã xác nhận</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'code' && (
            <>
              <View style={styles.emailInfo}>
                <Text style={styles.emailLabel}>Mã đã được gửi đến:</Text>
                <Text style={styles.emailValue}>{email}</Text>
              </View>

              <Text style={styles.otpLabel}>Nhập mã OTP</Text>
              <View style={styles.otpContainer} onStartShouldSetResponder={() => true}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      otpInputs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent: { key } }) => handleOtpKeyPress(key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!loading}
                  />
                ))}
              </View>

              <View style={styles.resendContainer}>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>
                    Gửi lại sau {countdown}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                    <Text style={styles.resendText}>
                      Không nhận được mã? <Text style={styles.resendLink}>Gửi lại</Text>
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading || otp.join('').length !== 6}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {loading ? (
                    <>
                      <View style={styles.loadingDot} />
                      <Text style={styles.primaryButtonText}>Đang xác thực...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Xác nhận</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 'password' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu mới</Text>
                <View style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputWrapperFocused
                ]}
                  onStartShouldSetResponder={() => true}
                >
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={passwordFocused ? '#2196F3' : '#999'} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ít nhất 8 ký tự"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)} 
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye' : 'eye-off'} 
                      size={20} 
                      color={passwordFocused ? '#2196F3' : '#999'} 
                    />
                  </TouchableOpacity>
                </View>
                {newPassword.length > 0 && newPassword.length < 8 && (
                  <Text style={styles.errorText}>
                    Mật khẩu phải có ít nhất 8 ký tự
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <View style={[
                  styles.inputWrapper,
                  confirmPasswordFocused && styles.inputWrapperFocused
                ]}
                  onStartShouldSetResponder={() => true}
                >
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={confirmPasswordFocused ? '#2196F3' : '#999'} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#999"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye' : 'eye-off'} 
                      size={20} 
                      color={confirmPasswordFocused ? '#2196F3' : '#999'} 
                    />
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <Text style={styles.errorText}>
                    Mật khẩu không khớp
                  </Text>
                )}
              </View>

              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Mật khẩu mạnh nên có:</Text>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.tipText}>Ít nhất 8 ký tự</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.tipText}>Chữ hoa, chữ thường và số</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {loading ? (
                    <>
                      <View style={styles.loadingDot} />
                      <Text style={styles.primaryButtonText}>Đang cập nhật...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Đặt lại mật khẩu</Text>
                      <Ionicons name="checkmark-done" size={20} color="#fff" />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* Back to Login Link */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Nhớ mật khẩu? </Text>
            <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.7}>
              <Text style={styles.link}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 270,
    backgroundColor: '#2196F3',
    overflow: 'hidden',
  },
  pattern1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pattern2: {
    position: 'absolute',
    top: 80,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 25,
    left: 20,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    zIndex: 10,
    alignItems: 'flex-end',
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 110 : 100,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: '#2196F3',
    backgroundColor: '#fff',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 6,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 10,
    lineHeight: 18,
  },
  emailInfo: {
    backgroundColor: '#F5F7FA',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  emailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  otpLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: (width - 108) / 7,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#F9FAFB',
  },
  otpInputFilled: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 13,
    color: '#666',
  },
  resendLink: {
    color: '#2196F3',
    fontWeight: '600',
  },
  countdownText: {
    fontSize: 13,
    color: '#999',
  },
  tipsContainer: {
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    width: '90%',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
});