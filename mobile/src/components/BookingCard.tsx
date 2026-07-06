import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { StatusBadge } from './StatusBadge';
import { theme } from '../theme';
import type { Booking, BookingAction } from '../types';

interface BookingCardProps {
  booking: Booking;
  actions?: BookingAction[];
  applicationStatus?: string;
  interestCount?: number;
  disabled?: boolean;
}

function formatDate(dateValue: string): string {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleString();
}

function getTaskParts(description: string): { title: string; category: string | null; summary: string } {
  const lines = description.split('\n').filter(Boolean);
  const title = lines[0] || 'Task';
  const category = lines.find((line) => line.startsWith('Category: '))?.replace('Category: ', '') ?? null;
  const summary = lines.filter((line) => !line.startsWith('Category: ') && !line.startsWith('Notes: ')).slice(1).join(' ');

  return { title, category, summary };
}

function getTaskStatusLabel(status: string): string {
  if (status === 'Pending') {
    return 'Open';
  }

  if (status === 'AwaitingCustomerSelection') {
    return 'Awaiting Selection';
  }

  if (status === 'Accepted') {
    return 'Assigned';
  }

  return status;
}

export function BookingCard({
  booking,
  actions = [],
  applicationStatus,
  interestCount,
  disabled = false
}: BookingCardProps) {
  const taskParts = getTaskParts(booking.description);
  const nextInterestCount = interestCount ?? booking.interestCount;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{taskParts.title}</Text>
        <Text style={styles.amount}>R {Number(booking.totalAmount).toFixed(2)}</Text>
      </View>

      <View style={styles.badges}>
        <StatusBadge label={getTaskStatusLabel(booking.status)} />
        <StatusBadge label={booking.paymentStatus} />
        {applicationStatus ? <StatusBadge label={applicationStatus} /> : null}
      </View>

      {taskParts.category ? <Text style={styles.meta}>Category: {taskParts.category}</Text> : null}
      {taskParts.summary ? <Text style={styles.summary}>{taskParts.summary}</Text> : null}
      <Text style={styles.meta}>{formatDate(booking.date)}</Text>
      <Text style={styles.meta}>Duration: {booking.durationHours} hours</Text>
      {typeof nextInterestCount === 'number' ? (
        <Text style={styles.meta}>
          Interested providers: {nextInterestCount}
        </Text>
      ) : null}
      {booking.customerId ? <Text style={styles.meta}>Customer: {booking.customerId}</Text> : null}
      {booking.serviceProviderId ? <Text style={styles.meta}>Provider: {booking.serviceProviderId}</Text> : null}

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
    backgroundColor: theme.colors.surface,
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
  summary: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  actions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm
  },
  button: {
    width: '100%'
  }
});
