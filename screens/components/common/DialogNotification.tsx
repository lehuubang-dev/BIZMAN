import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  gray600: '#4B5563',
  gray200: '#E5E7EB',
};

type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface DialogAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface DialogNotificationProps {
  visible: boolean;
  type?: DialogType;
  title: string;
  message?: string;
  actions: DialogAction[];
  onDismiss?: () => void;
}

export default function DialogNotification({
  visible,
  type = 'info',
  title,
  message,
  actions,
  onDismiss,
}: DialogNotificationProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle' as const, color: COLORS.success };
      case 'error':
        return { name: 'alert-circle' as const, color: COLORS.error };
      case 'warning':
        return { name: 'alert' as const, color: COLORS.warning };
      case 'confirm':
        return { name: 'help-circle' as const, color: COLORS.warning };
      case 'info':
      default:
        return { name: 'information' as const, color: COLORS.info };
    }
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'cancel':
        return [styles.actionButton, styles.cancelButton];
      case 'destructive':
        return [styles.actionButton, styles.destructiveButton];
      default:
        return [styles.actionButton, styles.primaryButton];
    }
  };

  const getButtonTextStyle = (style?: string) => {
    switch (style) {
      case 'cancel':
        return [styles.actionText, styles.cancelText];
      case 'destructive':
        return [styles.actionText, styles.destructiveText];
      default:
        return [styles.actionText, styles.primaryText];
    }
  };

  const icon = getIcon();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <View style={styles.header}>
                <MaterialCommunityIcons
                  name={icon.name as any}
                  size={24}
                  color={icon.color}
                />
                <Text style={styles.title}>{title}</Text>
              </View>

              {message && (
                <Text style={styles.message}>{message}</Text>
              )}

              <View style={styles.actions}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={getButtonStyle(action.style)}
                    onPress={action.onPress}
                  >
                    <Text style={getButtonTextStyle(action.style)}>
                      {action.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialog: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray800,
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  destructiveButton: {
    backgroundColor: COLORS.error,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.white,
  },
  cancelText: {
    color: COLORS.gray600,
  },
  destructiveText: {
    color: COLORS.white,
  },
});