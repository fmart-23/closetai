import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/colors';

/**
 * LoadingSpinner
 *
 * Props:
 *   fullScreen — boolean (default true): fills the whole screen with gradient bg
 *   message    — string: optional message shown below the spinner
 *   size       — 'small' | 'large' (default 'large')
 */
export default function LoadingSpinner({
  fullScreen = true,
  message = 'Loading…',
  size = 'large',
}) {
  if (fullScreen) {
    return (
      <LinearGradient
        colors={Colors.gradientDark}
        style={styles.fullScreen}
      >
        <View style={styles.content}>
          <ActivityIndicator size={size} color={Colors.primary} />
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {message ? <Text style={styles.inlineMessage}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 220,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  inlineMessage: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});
