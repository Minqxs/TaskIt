import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  tone?: 'default' | 'accent' | 'blue' | 'purple' | 'success';
}

export function MetricCard({ label, value, helper, tone = 'default' }: MetricCardProps) {
  return (
    <View style={[styles.card, toneStyles[tone]]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const toneStyles = StyleSheet.create({
  default: {
    backgroundColor: theme.colors.surfaceStrong
  },
  accent: {
    backgroundColor: theme.colors.accentMuted
  },
  blue: {
    backgroundColor: theme.colors.blueSoft
  },
  purple: {
    backgroundColor: theme.colors.purpleSoft
  },
  success: {
    backgroundColor: theme.colors.successSoft
  }
});

const styles = StyleSheet.create({
  card: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 136,
    padding: theme.spacing.md
  },
  label: {
    color: theme.colors.muted,
    fontSize: theme.typography.caption,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  value: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900'
  },
  helper: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    lineHeight: 18
  }
});
