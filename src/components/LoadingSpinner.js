/**
 * LoadingSpinner — Animated loading indicator
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import COLORS from '../constants/colors';
import { SPACING, TYPOGRAPHY } from '../constants/config';

export default function LoadingSpinner({ size = 'medium', message, style }) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 0.6, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinnerSize = size === 'small' ? 24 : size === 'large' ? 56 : 40;

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          { width: spinnerSize, height: spinnerSize, borderRadius: spinnerSize / 2 },
          { transform: [{ rotate: spin }] },
        ]}
      />
      {message && (
        <Animated.Text style={[styles.message, { opacity: pulseValue }]}>
          {message}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  spinner: {
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
    borderTopColor: COLORS.primary,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
