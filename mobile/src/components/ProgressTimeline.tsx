import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export interface TimelineStep {
  label: string;
  description?: string;
  complete?: boolean;
  active?: boolean;
}

interface ProgressTimelineProps {
  steps: TimelineStep[];
}

export function ProgressTimeline({ steps }: ProgressTimelineProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const highlighted = step.complete || step.active;
        return (
          <View key={`${step.label}-${index}`} style={styles.row}>
            <View style={styles.track}>
              <View style={[styles.dot, highlighted ? styles.dotActive : null]} />
              {index < steps.length - 1 ? <View style={[styles.line, step.complete ? styles.lineActive : null]} /> : null}
            </View>
            <View style={styles.copy}>
              <Text style={[styles.label, highlighted ? styles.labelActive : null]}>{step.label}</Text>
              {step.description ? <Text style={styles.description}>{step.description}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 42
  },
  track: {
    alignItems: 'center',
    width: 18
  },
  dot: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
    borderRadius: 999,
    borderWidth: 2,
    height: 14,
    width: 14
  },
  dotActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent
  },
  line: {
    backgroundColor: theme.colors.border,
    flex: 1,
    marginVertical: theme.spacing.xxs,
    width: 2
  },
  lineActive: {
    backgroundColor: theme.colors.accent
  },
  copy: {
    flex: 1,
    gap: 2,
    paddingBottom: theme.spacing.sm
  },
  label: {
    color: theme.colors.muted,
    fontSize: theme.typography.body,
    fontWeight: '800'
  },
  labelActive: {
    color: theme.colors.text
  },
  description: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    lineHeight: 18
  }
});
