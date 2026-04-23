import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import type { BannerTone } from '../types';

interface StatusBannerProps {
  message: string;
  tone?: BannerTone;
}

const tones: Record<
  BannerTone,
  {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  }
> = {
  info: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: '#8cd9d0',
    textColor: theme.colors.accentDark
  },
  error: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: '#f7b4af',
    textColor: theme.colors.danger
  },
  success: {
    backgroundColor: theme.colors.successSoft,
    borderColor: '#a7e0b3',
    textColor: theme.colors.success
  }
};

export function StatusBanner({ message, tone = 'info' }: StatusBannerProps) {
  const palette = tones[tone];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor
        }
      ]}
    >
      <Text style={[styles.text, { color: palette.textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  text: {
    fontSize: 14,
    lineHeight: 20
  }
});
