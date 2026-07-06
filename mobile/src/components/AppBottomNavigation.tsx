import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export interface BottomNavigationItem<T extends string> {
  key: T;
  label: string;
  helper?: string;
}

interface AppBottomNavigationProps<T extends string> {
  activeKey: T;
  items: BottomNavigationItem<T>[];
  onChange: (key: T) => void;
}

export function AppBottomNavigation<T extends string>({
  activeKey,
  items,
  onChange
}: AppBottomNavigationProps<T>) {
  return (
    <View style={styles.nav}>
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.item, active ? styles.itemActive : null]}
          >
            <View style={[styles.indicator, active ? styles.indicatorActive : null]} />
            <Text style={[styles.label, active ? styles.labelActive : null]} numberOfLines={1}>
              {item.label}
            </Text>
            {item.helper ? (
              <Text style={[styles.helper, active ? styles.helperActive : null]} numberOfLines={1}>
                {item.helper}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    bottom: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.xxs,
    left: theme.spacing.md,
    padding: theme.spacing.xs,
    position: 'absolute',
    right: theme.spacing.md,
    ...theme.shadow.lift
  },
  item: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    flex: 1,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs
  },
  itemActive: {
    backgroundColor: theme.colors.accentMuted
  },
  indicator: {
    backgroundColor: 'transparent',
    borderRadius: 999,
    height: 4,
    marginBottom: theme.spacing.xxs,
    width: 22
  },
  indicatorActive: {
    backgroundColor: theme.colors.accent
  },
  label: {
    color: theme.colors.muted,
    fontSize: theme.typography.caption,
    fontWeight: '900'
  },
  labelActive: {
    color: theme.colors.accentDark
  },
  helper: {
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1
  },
  helperActive: {
    color: theme.colors.accentDark
  }
});
