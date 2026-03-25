import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export function PressableScaleButton({ label, onPress, variant = 'primary' }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      speed: 30,
      bounciness: 4,
      useNativeDriver: true
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 28,
      bounciness: 5,
      useNativeDriver: true
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.button, styles[variant], { transform: [{ scale }] }]}>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center'
  },
  primary: {
    backgroundColor: colors.primary
  },
  subtle: {
    backgroundColor: colors.surfaceAlt
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600'
  }
});
