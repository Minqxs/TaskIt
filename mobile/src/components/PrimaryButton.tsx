import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { theme } from '../theme';
import type { ButtonVariant } from '../types';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
}

const variants: Record<
  ButtonVariant,
  {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  }
> = {
  primary: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
    textColor: '#ffffff'
  },
  secondary: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    textColor: theme.colors.text
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: theme.colors.accentDark
  }
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  style
}: PrimaryButtonProps) {
  const palette = variants[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor
        },
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
        style
      ]}
    >
      <Text style={[styles.label, { color: palette.textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  buttonDisabled: {
    opacity: 0.5
  },
  label: {
    fontSize: 15,
    fontWeight: '700'
  }
});
