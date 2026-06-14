import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { StatusBadge } from './StatusBadge';
import { theme } from '../theme';
import type { Provider } from '../types';

interface ProviderCardProps {
  provider: Provider;
  selected: boolean;
  onSelect: () => void;
}

export function ProviderCard({ provider, selected, onSelect }: ProviderCardProps) {
  return (
    <View style={[styles.card, selected ? styles.cardSelected : null]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{provider.name}</Text>
        </View>
        <StatusBadge label={provider.isVerified ? 'Verified' : 'Pending'} />
      </View>

      <Text style={styles.rate}>R {Number(provider.hourlyRate).toFixed(2)} / hour</Text>
      <Text style={styles.meta}>Rating {provider.rating} / 5</Text>

      <PrimaryButton
        label={selected ? 'Selected' : 'Book'}
        onPress={onSelect}
        variant={selected ? 'secondary' : 'primary'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  },
  cardSelected: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent
  },
  header: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between'
  },
  titleBlock: {
    flex: 1,
    gap: theme.spacing.xs
  },
  name: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800'
  },
  rate: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700'
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18
  }
});
