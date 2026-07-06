import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

interface StatusBadgeProps {
  label: string;
}

function getPalette(label: string) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('completed') || normalizedLabel.includes('verified')) {
    return {
      backgroundColor: theme.colors.successSoft,
      color: theme.colors.success
    };
  }

  if (normalizedLabel.includes('open')) {
    return {
      backgroundColor: theme.colors.blueSoft,
      color: theme.colors.blue
    };
  }

  if (normalizedLabel.includes('accepted') || normalizedLabel.includes('assigned') || normalizedLabel.includes('progress') || normalizedLabel.includes('selected')) {
    return {
      backgroundColor: theme.colors.accentSoft,
      color: theme.colors.accentDark
    };
  }

  if (
    normalizedLabel.includes('awaiting') ||
    normalizedLabel.includes('pending') ||
    normalizedLabel.includes('waiting')
  ) {
    return {
      backgroundColor: theme.colors.warningSoft,
      color: theme.colors.warning
    };
  }

  if (normalizedLabel.includes('cancel') || normalizedLabel.includes('failed')) {
    return {
      backgroundColor: theme.colors.dangerSoft,
      color: theme.colors.danger
    };
  }

  return {
    backgroundColor: theme.colors.graySoft,
    color: theme.colors.grayDark
  };
}

export function StatusBadge({ label }: StatusBadgeProps) {
  const palette = getPalette(label);

  return <Text style={[styles.badge, palette]}>{label}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    fontSize: theme.typography.caption,
    fontWeight: '900'
  }
});
