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
  InteractionManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../../services';
import { ApiError } from '../../../types';

const { width } = Dimensions.get('window');

interface UserData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface SignupScreenProps {
  onSwitchToLogin: () => void;
  onBack: () => void;
  onSignupSuccess: (user: UserData) => void;
}

export default function SignupScreen({ 
  onSwitchToLogin, 
  onBack, 
  onSignupSuccess 
}: SignupScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpLayoutReady, setOtpLayoutReady] = useState(false);

  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Field errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

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

  // Focus OTP after layout ready
  useEffect(() => {
    if (otpSent && otpLayoutReady) {
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 100);
    }
  }, [otpSent, otpLayoutReady]);

  const validateEmail = (email: string) => {
    const value = email.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    return gmailRegex.test(value);
  };

  const validateName = (name: string) => {
    return name.trim().length >= 3;
  };

  const validatePhoneVN = (phone: string) => {
    // Vietnamese mobile numbers with specific prefixes
    const digitsOnly = phone.replace(/\D/g, '');
    const phoneRegex = /^(03[2-9]|05[2689]|07[06-9]|08[1-9]|09[0-9])\d{7}$/;
    return phoneRegex.test(digitsOnly);
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
    if (sendingOTP) return; // debounce
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Thông báo', 'Email phải là địa chỉ Gmail (@gmail.com)');
      return;
    }

    setSendingOTP(true);
    
    try {
      const response = await authService.sendOTP({ email });
      setSendingOTP(false);
      setOtpSent(true);
      startCountdown();
      Alert.alert('Thành công', response.message || `Mã OTP đã được gửi đến ${email}`);
      // Focus vào ô OTP đầu tiên
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          otpInputs.current[0]?.focus();
        }, 300);
      });
    } catch (error) {
      setSendingOTP(false);
      const apiError = error as ApiError;
      Alert.alert('Lỗi', apiError.message || 'Không thể gửi mã OTP');
    }
  };

  const handleResendOTP = async () => {
    if (sendingOTP || countdown > 0) return; // debounce and countdown guard
    
    setSendingOTP(true);
    
    try {
      const response = await authService.sendOTP({ email });
      setSendingOTP(false);
      setOtp(['', '', '', '', '', '']);
      startCountdown();
      Alert.alert('Thành công', response.message || 'Mã OTP mới đã được gửi');
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          otpInputs.current[0]?.focus();
        }, 300);
      });
    } catch (error) {
      setSendingOTP(false);
      const apiError = error as ApiError;
      Alert.alert('Lỗi', apiError.message || 'Không thể gửi mã OTP');
    }
  };

  // Single handler to avoid onPress race conditions
  const handlePressSendOtp = () => {
    if (sendingOTP) return;
    if (otpSent) {
      handleResendOTP();
    } else {
      handleSendOTP();
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleSignup = async () => {
    if (!fullName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Thông báo', 'Email không hợp lệ');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại');
      return;
    }

    if (!password) {
      Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (!otpSent) {
      Alert.alert('Thông báo', 'Vui lòng gửi mã OTP trước');
      return;
    }

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authService.signup({
        phone,
        email,
        password,
        role: 'USER',
        otp: otpCode,
      });
      
      setLoading(false);
      
      const userData: UserData = {
        name: fullName,
        email: email,
        phone: phone,
      };
      
      Alert.alert(
        'Thành công',
        response.message || 'Đăng ký tài khoản thành công!',
        [
          {
            text: 'OK',
            onPress: () => onSignupSuccess(userData),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      const apiError = error as ApiError;
      Alert.alert('Lỗi', apiError.message || 'Đăng ký thất bại');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header Background */}
      <View style={styles.headerBackground} pointerEvents="none">
        <View style={styles.pattern1} />
        <View style={styles.pattern2} />
      </View>

      {/* Back Button */}
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <View style={styles.backButtonCircle}>
          <Ionicons name="close" size={24} color="#2196F3" />
        </View>
      </TouchableOpacity>
      
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
            <Ionicons name="person-add" size={50} color="#fff" />
          </View>
          <Text style={styles.title}>Đăng ký tài khoản</Text>
          <Text style={styles.subtitle}>Tạo tài khoản để quản lý kho hàng</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={[
              styles.inputWrapper,
              nameFocused && styles.inputWrapperFocused
            ]}
              onStartShouldSetResponder={() => true}
            >
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={nameFocused ? '#2196F3' : '#999'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  if (v.length === 0) {
                    setNameError(null);
                  } else {
                    setNameError(validateName(v) ? null : 'Họ và tên phải có ít nhất 3 ký tự');
                  }
                }}
                onFocus={() => setNameFocused(true)}
                onBlur={() => {
                  setNameFocused(false);
                  setNameError(validateName(fullName) ? null : 'Họ và tên phải có ít nhất 3 ký tự');
                }}
                editable={!loading}
              />
            </View>
            {nameError && (
              <Text style={styles.fieldError}>{nameError}</Text>
            )}
          </View>

          {/* Email Input with Send OTP Button */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.emailContainer}>
              <View style={[
                styles.inputWrapper,
                styles.emailInput,
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
                  placeholder="Nhập email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    if (v.length === 0) {
                      setEmailError(null);
                    } else {
                      setEmailError(validateEmail(v) ? null : 'Email phải là địa chỉ Gmail (@gmail.com)');
                    }
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => {
                    setEmailFocused(false);
                    setEmailError(validateEmail(email) ? null : 'Email phải là địa chỉ Gmail (@gmail.com)');
                  }}
                  editable={!loading && !sendingOTP}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendOtpButton,
                  (sendingOTP || (otpSent && countdown > 0)) && styles.sendOtpButtonDisabled
                ]}
                onPress={handlePressSendOtp}
                disabled={
                  sendingOTP ||
                  (otpSent && countdown > 0) ||
                  !email.trim() ||
                  !validateEmail(email)
                }
                activeOpacity={0.8}
              >
                {sendingOTP ? (
                  <Text style={styles.sendOtpButtonText}>Đang gửi...</Text>
                ) : countdown > 0 ? (
                  <Text style={styles.sendOtpButtonText}>{countdown}s</Text>
                ) : otpSent ? (
                  <Text style={styles.sendOtpButtonText}>Gửi lại</Text>
                ) : (
                  <Text style={styles.sendOtpButtonText}>Gửi mã</Text>
                )}
              </TouchableOpacity>
            </View>
            {emailError && (
              <Text style={styles.fieldError}>{emailError}</Text>
            )}
            {otpSent && (
              <View style={styles.otpSentNotice}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.otpSentText}>
                  Mã OTP đã được gửi đến email của bạn
                </Text>
              </View>
            )}
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={[
              styles.inputWrapper,
              phoneFocused && styles.inputWrapperFocused
            ]}
              onStartShouldSetResponder={() => true}
            >
              <Ionicons 
                name="call-outline" 
                size={20} 
                color={phoneFocused ? '#2196F3' : '#999'} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  if (v.length === 0) {
                    setPhoneError(null);
                  } else {
                    setPhoneError(validatePhoneVN(v) ? null : 'Số điện thoại Việt Nam không hợp lệ');
                  }
                }}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => {
                  setPhoneFocused(false);
                  setPhoneError(validatePhoneVN(phone) ? null : 'Số điện thoại Việt Nam không hợp lệ');
                }}
                editable={!loading}
                maxLength={10}
              />
            </View>
            {phoneError && (
              <Text style={styles.fieldError}>{phoneError}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
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
                value={password}
                onChangeText={setPassword}
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
            {password.length > 0 && password.length < 8 && (
              <Text style={styles.errorText}>
                Mật khẩu phải có ít nhất 8 ký tự
              </Text>
            )}
          </View>

          {/* OTP Input - Only show after OTP is sent */}
          {otpSent && (
            <View style={styles.otpGroup}>
              <Text style={styles.label}>Mã OTP</Text>
              <Text style={styles.otpHint}>Nhập mã xác thực 6 số</Text>
              <View 
                style={styles.otpContainer}
                onStartShouldSetResponder={() => true}
                onLayout={() => setOtpLayoutReady(true)}
              >
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
            </View>
          )}

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <>
                  <View style={styles.loadingDot} />
                  <Text style={styles.signupButtonText}>Đang đăng ký...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.signupButtonText}>Đăng ký</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
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
    height: 250,
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
    top: Platform.OS === 'ios' ? 50 : 30,
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 100 : 90,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
  fieldError: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 6,
    marginLeft: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    marginRight: 10,
  },
  sendOtpButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendOtpButtonDisabled: {
    backgroundColor: '#BDBDBD',
    shadowOpacity: 0,
  },
  sendOtpButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  otpSentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  otpSentText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 6,
    flex: 1,
  },
  otpGroup: {
    marginBottom: 24,
  },
  otpHint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  otpInput: {
    width: (width - 88) / 6 - 6,
    height: 50,
    borderWidth: 1.5,
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
  signupButton: {
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
  signupButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
});