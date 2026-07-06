import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { theme } from '../theme';

interface AppHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

export function AppHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionDisabled = false
}: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <PrimaryButton disabled={actionDisabled} label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between'
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs
  },
  eyebrow: {
    color: theme.colors.accentDark,
    fontSize: theme.typography.caption,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase'
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.screenTitle,
    fontWeight: '900',
    lineHeight: 34
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: theme.typography.body,
    lineHeight: 21
  },
  action: {
    minHeight: 42,
    paddingHorizontal: theme.spacing.md
  }
});
