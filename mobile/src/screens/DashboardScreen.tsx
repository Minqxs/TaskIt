import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppModal } from '../components/AppModal';
import { BookingCard } from '../components/BookingCard';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionCard } from '../components/SectionCard';
import { StatusBanner } from '../components/StatusBanner';
import { theme } from '../theme';
import type { Booking, BookingAction, Session } from '../types';

interface DashboardScreenProps {
  bookings: Booking[];
  error: string;
  getBookingActions: (booking: Booking) => BookingAction[];
  isBusy: boolean;
  message: string;
  hourlyRate: string;
  isReviewOpen: boolean;
  reviewComment: string;
  reviewRating: string;
  onChangeReviewComment: (value: string) => void;
  onChangeReviewRating: (value: string) => void;
  onCreateBooking: () => void;
  onChangeHourlyRate: (value: string) => void;
  onCloseReview: () => void;
  onOpenBookingDetails: (bookingId: Booking['id']) => void;
  onLogout: () => void;
  onRefreshBookings: () => void;
  onUpdateHourlyRate: () => void;
  onSubmitReview: () => void;
  session: Session;
}

export function DashboardScreen({
  bookings,
  error,
  getBookingActions,
  isBusy,
  message,
  hourlyRate,
  isReviewOpen,
  reviewComment,
  reviewRating,
  onChangeReviewComment,
  onChangeReviewRating,
  onCreateBooking,
  onChangeHourlyRate,
  onCloseReview,
  onOpenBookingDetails,
  onLogout,
  onRefreshBookings,
  onUpdateHourlyRate,
  onSubmitReview,
  session
}: DashboardScreenProps) {
  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{session.role}</Text>
            <Text style={styles.title}>{session.role === 'Customer' ? 'Book a task' : 'Manage bookings'}</Text>
          </View>

          <View style={styles.headerActions}>
            <PrimaryButton disabled={isBusy} label="Refresh" onPress={onRefreshBookings} variant="secondary" />
            <PrimaryButton label="Log out" onPress={onLogout} variant="ghost" />
          </View>
        </View>

        {message ? <StatusBanner message={message} tone="success" /> : null}
        {error ? <StatusBanner message={error} tone="error" /> : null}

        {session.role === 'Customer' ? (
          <SectionCard title="Home">
            <View style={styles.inlineActions}>
              <PrimaryButton disabled={isBusy} label="Create Task" onPress={onCreateBooking} />
            </View>

            <Text style={styles.helperText}>Post a task and service providers can accept it from their bookings queue.</Text>
          </SectionCard>
        ) : null}

        {session.role === 'ServiceProvider' ? (
          <SectionCard title="Hourly rate">
            <FormField
              keyboardType="decimal-pad"
              label="Hourly rate"
              onChangeText={onChangeHourlyRate}
              placeholder="120"
              value={hourlyRate}
            />
            <PrimaryButton disabled={isBusy} label="Update rate" onPress={onUpdateHourlyRate} />
          </SectionCard>
        ) : null}

        <SectionCard title={session.role === 'ServiceProvider' ? 'Bookings' : 'My bookings'}>
          {bookings.length === 0 ? (
            <>
              <EmptyState
                title={session.role === 'ServiceProvider' ? 'No bookings yet' : "You haven't posted any tasks yet."}
                message={
                  session.role === 'ServiceProvider'
                    ? 'Accepted and pending jobs will appear here.'
                    : 'Create a task when you need help at home.'
                }
              />
              {session.role === 'Customer' ? <PrimaryButton label="Create Task" onPress={onCreateBooking} /> : null}
            </>
          ) : (
            bookings.map((booking) => (
              <BookingCard
                actions={
                  session.role === 'Customer'
                    ? [
                        {
                          key: 'details',
                          label: 'View details',
                          onPress: () => onOpenBookingDetails(booking.id),
                          variant: 'secondary'
                        },
                        ...getBookingActions(booking)
                      ]
                    : getBookingActions(booking)
                }
                booking={booking}
                disabled={isBusy}
                key={booking.id}
              />
            ))
          )}
        </SectionCard>
      </ScrollView>

      <AppModal onClose={onCloseReview} title="Leave Review" visible={isReviewOpen}>
        <FormField
          keyboardType="number-pad"
          label="Rating"
          onChangeText={onChangeReviewRating}
          placeholder="1 to 5"
          value={reviewRating}
        />
        <FormField
          autoCapitalize="sentences"
          label="Comment"
          onChangeText={onChangeReviewComment}
          placeholder="How did the task go?"
          value={reviewComment}
        />
        <PrimaryButton disabled={isBusy} label="Submit review" onPress={onSubmitReview} />
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl
  },
  header: {
    alignItems: 'flex-start',
    gap: theme.spacing.md
  },
  headerText: {
    gap: theme.spacing.xs
  },
  eyebrow: {
    color: theme.colors.accentDark,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase'
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900'
  },
  headerActions: {
    gap: theme.spacing.sm
  },
  inlineActions: {
    gap: theme.spacing.sm
  },
  helperText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18
  }
});
