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

  return parsedDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getTaskParts(description: string): { title: string; category: string | null; summary: string; notes: string | null } {
  const lines = description.split('\n').filter(Boolean);
  const title = lines[0] || 'Task';
  const category = lines.find((line) => line.startsWith('Category: '))?.replace('Category: ', '') ?? null;
  const notes = lines.find((line) => line.startsWith('Notes: '))?.replace('Notes: ', '') ?? null;
  const summary = lines.filter((line) => !line.startsWith('Category: ') && !line.startsWith('Notes: ')).slice(1).join(' ');

  return { title, category, summary, notes };
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
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{taskParts.title}</Text>
          {taskParts.category ? <Text style={styles.category}>{taskParts.category}</Text> : null}
        </View>
        <View style={styles.pricePill}>
          <Text style={styles.amount}>R {Number(booking.totalAmount).toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.badges}>
        <StatusBadge label={getTaskStatusLabel(booking.status)} />
        <StatusBadge label={booking.paymentStatus} />
        {applicationStatus ? <StatusBadge label={applicationStatus} /> : null}
      </View>

      {taskParts.summary ? <Text style={styles.summary}>{taskParts.summary}</Text> : null}
      {taskParts.notes ? <Text style={styles.note}>Note: {taskParts.notes}</Text> : null}

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>When</Text>
          <Text style={styles.metaValue}>{formatDate(booking.date)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Duration</Text>
          <Text style={styles.metaValue}>{booking.durationHours} hr</Text>
        </View>
        {typeof nextInterestCount === 'number' ? (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Interest</Text>
            <Text style={styles.metaValue}>{nextInterestCount} provider{nextInterestCount === 1 ? '' : 's'}</Text>
          </View>
        ) : null}
      </View>

      {booking.customerId || booking.serviceProviderId ? (
        <View style={styles.assignment}>
          {booking.customerId ? <Text style={styles.meta}>Customer: {booking.customerId}</Text> : null}
          {booking.serviceProviderId ? <Text style={styles.meta}>Provider: {booking.serviceProviderId}</Text> : null}
        </View>
      ) : null}

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
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    ...theme.shadow.card
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
  title: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22
  },
  category: {
    color: theme.colors.accentDark,
    fontSize: theme.typography.bodySmall,
    fontWeight: '900'
  },
  pricePill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.ink,
    borderRadius: 999,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs
  },
  amount: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900'
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  summary: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 21
  },
  note: {
    color: theme.colors.grayDark,
    fontSize: theme.typography.bodySmall,
    lineHeight: 18
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  metaItem: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    minWidth: 112,
    padding: theme.spacing.sm
  },
  metaLabel: {
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  metaValue: {
    color: theme.colors.text,
    fontSize: theme.typography.bodySmall,
    fontWeight: '800',
    marginTop: 2
  },
  assignment: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    gap: theme.spacing.xxs,
    paddingTop: theme.spacing.sm
  },
  actions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm
  },
  button: {
    width: '100%'
  }
});
