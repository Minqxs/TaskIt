import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface QuickChipsProps {
  items: string[];
  selected?: string;
  onSelect?: (item: string) => void;
}

export function QuickChips({ items, selected, onSelect }: QuickChipsProps) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const active = item === selected;
        return (
          <Pressable
            accessibilityRole={onSelect ? 'button' : undefined}
            disabled={!onSelect}
            key={item}
            onPress={() => onSelect?.(item)}
            style={[styles.chip, active ? styles.chipActive : null]}
          >
            <Text style={[styles.label, active ? styles.labelActive : null]}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  chip: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent
  },
  label: {
    color: theme.colors.grayDark,
    fontSize: theme.typography.bodySmall,
    fontWeight: '800'
  },
  labelActive: {
    color: '#ffffff'
  }
});
