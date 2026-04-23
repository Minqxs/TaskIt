import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.lg,
    ...theme.shadow.card
  },
  header: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md
  },
  title: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '800'
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
