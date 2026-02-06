import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#2196F3',
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  gray800: '#1F2937',
};

const { width } = Dimensions.get('window');

type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: SnackbarType;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export default function Snackbar({ 
  visible, 
  message, 
  type = 'info', 
  duration = 3000, 
  onDismiss,
  action 
}: SnackbarProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset values before showing
      translateY.setValue(-100);
      opacity.setValue(0);
      
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideSnackbar();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      hideSnackbar();
    }
  }, [visible]);

  const hideSnackbar = () => {
    if (!visible) return;
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return COLORS.success;
      case 'error':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      case 'info':
      default:
        return COLORS.info;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle' as const;
      case 'error':
        return 'alert-circle' as const;
      case 'warning':
        return 'alert' as const;
      case 'info':
      default:
        return 'information' as const;
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons 
          name={getIcon() as any} 
          size={20} 
          color={COLORS.white} 
        />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        
        {action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={action.onPress}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideSnackbar}
        >
          <MaterialCommunityIcons 
            name="close" 
            size={18} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 16,
    left: 16,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 9999,
    maxWidth: width - 32,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    textDecorationLine: 'underline',
  },
  closeButton: {
    padding: 2,
  },
});