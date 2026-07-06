import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppModal } from '../components/AppModal';
import { BookingCard } from '../components/BookingCard';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionCard } from '../components/SectionCard';
import { StatusBanner } from '../components/StatusBanner';
import { theme } from '../theme';
import type { Booking, BookingAction, BookingApplication, ProviderDashboardTab, Session } from '../types';

type MainTab = 'home' | 'activity' | 'account';

interface DashboardScreenProps {
  availableBookings: Booking[];
  bookings: Booking[];
  providerApplications: BookingApplication[];
  providerTab: ProviderDashboardTab;
  error: string;
  getBookingActions: (booking: Booking) => BookingAction[];
  getAvailableBookingActions: (booking: Booking) => BookingAction[];
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
  onChangeProviderTab: (tab: ProviderDashboardTab) => void;
  onOpenBookingDetails: (bookingId: Booking['id']) => void;
  onLogout: () => void;
  onRefreshBookings: () => void;
  onUpdateHourlyRate: () => void;
  onSubmitReview: () => void;
  session: Session;
}

export function DashboardScreen({
  availableBookings,
  bookings,
  providerApplications,
  providerTab,
  error,
  getBookingActions,
  getAvailableBookingActions,
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
  onChangeProviderTab,
  onOpenBookingDetails,
  onLogout,
  onRefreshBookings,
  onUpdateHourlyRate,
  onSubmitReview,
  session
}: DashboardScreenProps) {
  const [mainTab, setMainTab] = useState<MainTab>('home');
  const activeBookings = bookings.filter((booking) => !isHistoryStatus(booking.status));
  const historyBookings = bookings.filter((booking) => isHistoryStatus(booking.status));

  const renderProviderTabButton = (tab: ProviderDashboardTab, label: string) => (
    <PrimaryButton
      disabled={isBusy}
      label={label}
      onPress={() => onChangeProviderTab(tab)}
      style={styles.tabButton}
      variant={providerTab === tab ? 'primary' : 'secondary'}
    />
  );

  return (
    <>
      <View style={styles.shell}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{getRoleLabel(session.role)}</Text>
            <Text style={styles.title}>{getTabTitle(mainTab, session.role)}</Text>
          </View>

          <PrimaryButton disabled={isBusy} label="Refresh" onPress={onRefreshBookings} variant="secondary" />
        </View>

        {message ? <StatusBanner message={message} tone="success" /> : null}
        {error ? <StatusBanner message={error} tone="error" /> : null}

        {mainTab === 'home' && session.role === 'Customer' ? (
          <>
            <SectionCard title="Post a task" subtitle="Create a home-service request and review interested providers.">
              <PrimaryButton disabled={isBusy} label="Create Task" onPress={onCreateBooking} />
            </SectionCard>

            <SectionCard title="Current tasks">
              {activeBookings.length === 0 ? (
                <>
                  <EmptyState title="No active tasks yet." message="Create a task when you need help at home." />
                  <PrimaryButton label="Create Task" onPress={onCreateBooking} />
                </>
              ) : (
                activeBookings.map((booking) => (
                  <BookingCard
                    actions={[
                      {
                        key: 'details',
                        label: 'View details',
                        onPress: () => onOpenBookingDetails(booking.id),
                        variant: 'secondary'
                      },
                      ...getBookingActions(booking)
                    ]}
                    booking={booking}
                    disabled={isBusy}
                    key={booking.id}
                  />
                ))
              )}
            </SectionCard>
          </>
        ) : null}

        {mainTab === 'home' && session.role === 'ServiceProvider' ? (
          <>
            <View style={styles.segmentedControl}>
              {renderProviderTabButton('available', 'Available')}
              {renderProviderTabButton('applications', 'Applied')}
              {renderProviderTabButton('assigned', 'Active')}
            </View>

            {providerTab === 'available' ? (
              <SectionCard title="Available Tasks">
                {availableBookings.length === 0 ? (
                  <EmptyState
                    title="No available tasks right now."
                    message="New customer tasks will appear here when they are posted."
                  />
                ) : (
                  availableBookings.map((booking) => (
                    <BookingCard
                      actions={getAvailableBookingActions(booking)}
                      booking={booking}
                      disabled={isBusy || booking.hasCurrentProviderInterest}
                      key={booking.id}
                    />
                  ))
                )}
              </SectionCard>
            ) : null}

            {providerTab === 'applications' ? (
              <SectionCard title="My Applications">
                {providerApplications.length === 0 ? (
                  <>
                    <EmptyState
                      title="You have not shown interest in any tasks yet."
                      message="Browse available tasks and apply when a job fits your schedule."
                    />
                    <PrimaryButton label="Browse Available Tasks" onPress={() => onChangeProviderTab('available')} />
                  </>
                ) : (
                  providerApplications.map((application) => (
                    <BookingCard
                      applicationStatus={getApplicationStatusLabel(application.status)}
                      booking={application.booking}
                      disabled={isBusy}
                      key={application.id}
                    />
                  ))
                )}
              </SectionCard>
            ) : null}

            {providerTab === 'assigned' ? (
              <SectionCard title="Active Tasks">
                {activeBookings.length === 0 ? (
                  <EmptyState
                    title="No active tasks yet."
                    message="When a customer selects you, the task will appear here."
                  />
                ) : (
                  activeBookings.map((booking) => (
                    <BookingCard
                      actions={getBookingActions(booking)}
                      booking={booking}
                      disabled={isBusy}
                      key={booking.id}
                    />
                  ))
                )}
              </SectionCard>
            ) : null}
          </>
        ) : null}

        {mainTab === 'activity' ? (
          <SectionCard title="Activity" subtitle="Completed and cancelled task history.">
            {historyBookings.length === 0 ? (
              <EmptyState title="No activity yet." message="Completed tasks will appear here." />
            ) : (
              historyBookings.map((booking) => (
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
        ) : null}

        {mainTab === 'account' ? (
          <>
            <SectionCard title="Profile">
              <Text style={styles.meta}>Role: {getRoleLabel(session.role)}</Text>
              <Text style={styles.meta}>User ID: {session.userId}</Text>
            </SectionCard>

            {session.role === 'ServiceProvider' ? (
              <SectionCard title="Provider settings">
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

            <SectionCard title="Settings">
              <PrimaryButton disabled={isBusy} label="Refresh data" onPress={onRefreshBookings} variant="secondary" />
              <PrimaryButton label="Log out" onPress={onLogout} variant="ghost" />
            </SectionCard>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.bottomNav}>
        <BottomNavItem active={mainTab === 'home'} label="Home" onPress={() => setMainTab('home')} />
        <BottomNavItem active={mainTab === 'activity'} label="Activity" onPress={() => setMainTab('activity')} />
        <BottomNavItem active={mainTab === 'account'} label="Account" onPress={() => setMainTab('account')} />
      </View>
      </View>

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

function BottomNavItem({
  active,
  label,
  onPress
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="tab" onPress={onPress} style={styles.navItem}>
      <View style={[styles.navDot, active ? styles.navDotActive : null]} />
      <Text style={[styles.navLabel, active ? styles.navLabelActive : null]}>{label}</Text>
    </Pressable>
  );
}

function isHistoryStatus(status: string): boolean {
  return status === 'Completed' || status === 'Cancelled';
}

function getRoleLabel(role: Session['role']): string {
  return role === 'ServiceProvider' ? 'Provider' : 'Customer';
}

function getTabTitle(tab: MainTab, role: Session['role']): string {
  if (tab === 'activity') {
    return 'Activity';
  }

  if (tab === 'account') {
    return 'Account';
  }

  return role === 'ServiceProvider' ? 'Find work' : 'Home';
}

function getApplicationStatusLabel(status: string): string {
  if (status === 'PendingCustomerDecision') {
    return 'Waiting for Customer';
  }

  if (status === 'Rejected') {
    return 'Not Selected';
  }

  return status;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1
  },
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingBottom: 112
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between'
  },
  headerText: {
    flex: 1,
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
    fontSize: 28,
    fontWeight: '900'
  },
  segmentedControl: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm
  },
  tabButton: {
    width: '100%'
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  bottomNav: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    bottom: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    left: theme.spacing.md,
    padding: theme.spacing.xs,
    position: 'absolute',
    right: theme.spacing.md,
    ...theme.shadow.card
  },
  navItem: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    flex: 1,
    gap: 4,
    minHeight: 54,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs
  },
  navDot: {
    backgroundColor: 'transparent',
    borderRadius: 999,
    height: 4,
    width: 24
  },
  navDotActive: {
    backgroundColor: theme.colors.accent
  },
  navLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800'
  },
  navLabelActive: {
    color: theme.colors.text
  }
});
