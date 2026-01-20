import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from './constants';

interface FloatingButtonsProps {
  selectedCount: number;
  onChatPress: () => void;
  onCartPress: () => void;
}

export const FloatingButtons: React.FC<FloatingButtonsProps> = ({
  selectedCount,
  onChatPress,
  onCartPress,
}) => {
  return (
    <View style={styles.floatingButtons}>
      {/* Chat Button */}
      <TouchableOpacity
        style={styles.fabChat}
        activeOpacity={0.8}
        onPress={onChatPress}
      >
        <MaterialCommunityIcons
          name="robot-happy-outline"
          size={28}
          color="white"
        />
      </TouchableOpacity>

      {/* Cart Button */}
      <TouchableOpacity
        style={styles.fabCart}
        activeOpacity={0.8}
        onPress={onCartPress}
      >
        <MaterialCommunityIcons
          name="cart-outline"
          size={28}
          color="white"
        />
        {selectedCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{selectedCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButtons: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    gap: 12,
  },
  fabChat: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00A3E0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00A3E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  fabCart: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
});
