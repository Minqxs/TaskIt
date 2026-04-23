import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookingCard } from '../components/BookingCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProviderCard } from '../components/ProviderCard';
import { SectionCard } from '../components/SectionCard';
import { StatusBanner } from '../components/StatusBanner';
import { theme } from '../theme';
import type { Booking, BookingAction, Provider, Session } from '../types';

interface DashboardScreenProps {
  apiBaseUrl: string;
  bookings: Booking[];
  error: string;
  getBookingActions: (booking: Booking) => BookingAction[];
  isBusy: boolean;
  message: string;
  onCreateBooking: () => void;
  onLogout: () => void;
  onRefreshBookings: () => void;
  onRefreshProviders: () => void;
  onSelectProvider: (providerId: string) => void;
  providers: Provider[];
  selectedProviderId: string | null;
  session: Session;
}

export function DashboardScreen({
  apiBaseUrl,
  bookings,
  error,
  getBookingActions,
  isBusy,
  message,
  onCreateBooking,
  onLogout,
  onRefreshBookings,
  onRefreshProviders,
  onSelectProvider,
  providers,
  selectedProviderId,
  session
}: DashboardScreenProps) {
  const selectedProvider = providers.find((provider) => provider.userId === selectedProviderId) ?? null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Dashboard</Text>
          <Text style={styles.title}>{session.role}</Text>
          <Text style={styles.subtitle}>Signed in as {session.userId}</Text>
        </View>

        <View style={styles.headerActions}>
          <PrimaryButton disabled={isBusy} label="Refresh bookings" onPress={onRefreshBookings} variant="secondary" />
          <PrimaryButton label="Log out" onPress={onLogout} variant="ghost" />
        </View>
      </View>

      {message ? <StatusBanner message={message} tone="success" /> : null}
      {error ? <StatusBanner message={error} tone="error" /> : null}

      {session.role === 'Customer' ? (
        <SectionCard
          subtitle="Choose a provider, then create a sample two-hour booking against the running API."
          title="Providers"
        >
          <View style={styles.inlineActions}>
            <PrimaryButton disabled={isBusy} label="Reload providers" onPress={onRefreshProviders} variant="secondary" />
            <PrimaryButton disabled={isBusy || !selectedProviderId} label="Create booking" onPress={onCreateBooking} />
          </View>

          <Text style={styles.helperText}>
            {selectedProvider
              ? `Selected provider: ${selectedProvider.name}`
              : 'Choose a provider first to enable booking creation.'}
          </Text>

          {providers.length === 0 ? (
            <Text style={styles.emptyText}>No providers loaded yet.</Text>
          ) : (
            providers.map((provider) => (
              <ProviderCard
                key={provider.userId}
                onSelect={() => onSelectProvider(provider.userId)}
                provider={provider}
                selected={provider.userId === selectedProviderId}
              />
            ))
          )}
        </SectionCard>
      ) : null}

      <SectionCard
        subtitle={
          session.role === 'ServiceProvider'
            ? 'Accept, start, and complete jobs from here.'
            : 'Track each booking and confirm completion once the provider finishes.'
        }
        title="Bookings"
      >
        {bookings.length === 0 ? (
          <Text style={styles.emptyText}>No bookings yet.</Text>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              actions={getBookingActions(booking)}
              booking={booking}
              disabled={isBusy}
              key={booking.id}
            />
          ))
        )}
      </SectionCard>

      <SectionCard subtitle="Use EXPO_PUBLIC_API_URL in mobile/.env if you need a different host." title="Connection">
        <Text style={styles.helperText}>API base URL: {apiBaseUrl}</Text>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl
  },
  header: {
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
    fontSize: 34,
    fontWeight: '900'
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20
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
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20
  }
});
