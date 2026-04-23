import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { theme } from '../theme';
import type { Booking, BookingAction } from '../types';

interface BookingCardProps {
  booking: Booking;
  actions?: BookingAction[];
  disabled?: boolean;
}

function formatDate(dateValue: string): string {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleString();
}

export function BookingCard({ booking, actions = [], disabled = false }: BookingCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{booking.description}</Text>
        <Text style={styles.amount}>R {Number(booking.totalAmount).toFixed(2)}</Text>
      </View>

      <Text style={styles.meta}>Scheduled: {formatDate(booking.date)}</Text>
      <Text style={styles.meta}>Duration: {booking.durationHours} hours</Text>
      <Text style={styles.meta}>Status: {booking.status}</Text>
      <Text style={styles.meta}>Payment: {booking.paymentStatus}</Text>

      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action) => (
            <PrimaryButton
              key={`${booking.id}-${action.key}`}
              disabled={disabled}
              label={action.label}
              onPress={action.onPress}
              style={styles.button}
              variant={action.variant || 'secondary'}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md
  },
  header: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between'
  },
  title: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '800'
  },
  amount: {
    color: theme.colors.accentDark,
    fontSize: 15,
    fontWeight: '800'
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  actions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm
  },
  button: {
    width: '100%'
  }
});
