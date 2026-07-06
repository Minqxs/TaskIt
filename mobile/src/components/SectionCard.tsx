import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function SectionCard({ title, subtitle, children, action }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    ...theme.shadow.card
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing.xs
  },
  action: {
    alignItems: 'flex-end'
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900'
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  content: {
    gap: theme.spacing.md
  }
});
