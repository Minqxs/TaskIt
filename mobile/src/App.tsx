import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { API_BASE_URL } from './config/api';
import { AuthScreen } from './screens/AuthScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { authApi, bookingsApi, providersApi } from './services/api';
import { clearStoredSession, loadStoredSession, saveStoredSession } from './services/storage';
import { theme } from './theme';
import type {
  AuthForm,
  AuthResponse,
  Booking,
  BookingAction,
  BookingWorkflowAction,
  Provider,
  Session
} from './types';

const INITIAL_FORM: AuthForm = {
  role: 'Customer',
  email: 'customer@hometask.sa',
  password: 'Password123!',
  fullName: '',
  phoneNumber: '',
  governmentIdNumber: '',
  city: '',
  district: '',
  addressLine: ''
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while talking to the API.';
}

export default function App() {
  const [form, setForm] = useState<AuthForm>(INITIAL_FORM);
  const [session, setSession] = useState<Session | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [message, setMessage] = useState(
    'Set EXPO_PUBLIC_API_URL when the API is not reachable at the local default.'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    loadStoredSession()
      .then((savedSession: Session | null) => {
        if (isMounted && savedSession) {
          setSession(savedSession);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Saved session could not be restored.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsRestoring(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setProviders([]);
      setBookings([]);
      setSelectedProviderId(null);
      return;
    }

    let cancelled = false;

    const hydrateDashboard = async () => {
      setIsBusy(true);
      setError('');

      try {
        if (session.role === 'Customer') {
          const nextProviders = await providersApi.list();
          if (cancelled) {
            return;
          }

          setProviders(nextProviders);
          setSelectedProviderId((currentProviderId: string | null) => {
            if (currentProviderId && nextProviders.some((provider) => provider.userId === currentProviderId)) {
              return currentProviderId;
            }

            return nextProviders[0]?.userId ?? null;
          });
        }

        const nextBookings = await bookingsApi.listByUserId(session.userId, session.token);
        if (cancelled) {
          return;
        }

        setBookings(nextBookings);
        setMessage('Dashboard synced with the API.');
      } catch (hydrateError) {
        if (!cancelled) {
          setError(getErrorMessage(hydrateError));
        }
      } finally {
        if (!cancelled) {
          setIsBusy(false);
        }
      }
    };

    void hydrateDashboard();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const updateField = <K extends keyof AuthForm>(field: K, value: AuthForm[K]) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  };

  const runAction = async (action: () => Promise<void>) => {
    setIsBusy(true);
    setError('');

    try {
      await action();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setIsBusy(false);
    }
  };

  const completeAuth = async (authPayload: AuthResponse, successMessage: string) => {
    const nextSession = {
      token: authPayload.token,
      userId: authPayload.userId,
      role: authPayload.role
    };

    setSession(nextSession);
    await saveStoredSession(nextSession);
    setMessage(successMessage);
  };

  const refreshProviders = async (announce = true): Promise<void> => {
    const nextProviders = await providersApi.list();
    setProviders(nextProviders);
    setSelectedProviderId((currentProviderId: string | null) => {
      if (currentProviderId && nextProviders.some((provider) => provider.userId === currentProviderId)) {
        return currentProviderId;
      }

      return nextProviders[0]?.userId ?? null;
    });

    if (announce) {
      setMessage(nextProviders.length > 0 ? `Loaded ${nextProviders.length} providers.` : 'No providers found yet.');
    }
  };

  const refreshBookings = async (announce = true): Promise<void> => {
    if (!session) {
      return;
    }

    const nextBookings = await bookingsApi.listByUserId(session.userId, session.token);
    setBookings(nextBookings);

    if (announce) {
      setMessage(nextBookings.length > 0 ? `Loaded ${nextBookings.length} bookings.` : 'No bookings yet.');
    }
  };

  const handleLogin = async () => {
    await runAction(async () => {
      const payload = await authApi.login({
        email: form.email,
        password: form.password
      });

      await completeAuth(payload, 'Logged in successfully.');
    });
  };

  const handleRegister = async () => {
    await runAction(async () => {
      const payload = await authApi.register({
        email: form.email,
        password: form.password,
        role: form.role,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        governmentIdNumber: form.role === 'ServiceProvider' ? form.governmentIdNumber : null,
        city: form.role === 'ServiceProvider' ? form.city : null,
        district: form.role === 'ServiceProvider' ? form.district : null,
        addressLine: form.role === 'ServiceProvider' ? form.addressLine : null
      });

      await completeAuth(payload, 'Account created.');
    });
  };

  const handleOAuthLogin = async () => {
    await runAction(async () => {
      const payload = await authApi.oauthLogin({
        provider: 'Google',
        oAuthSubject: `mock-${form.email}`,
        email: form.email,
        role: form.role,
        fullName: form.fullName || form.email
      });

      await completeAuth(payload, 'Signed in with mock Google.');
    });
  };

  const handleRefreshProviders = async () => {
    await runAction(async () => {
      await refreshProviders();
    });
  };

  const handleRefreshBookings = async () => {
    await runAction(async () => {
      await refreshBookings();
    });
  };

  const handleCreateBooking = async () => {
    if (!session || !selectedProviderId) {
      setError('Choose a provider before creating a booking.');
      return;
    }

    await runAction(async () => {
      await bookingsApi.create(
        {
          customerId: session.userId,
          serviceProviderId: selectedProviderId,
          date: new Date().toISOString(),
          durationHours: 2,
          description: 'General house cleaning'
        },
        session.token
      );

      await refreshBookings(false);
      setMessage('Booking created.');
    });
  };

  const handleBookingAction = async (bookingId: Booking['id'], action: BookingWorkflowAction) => {
    if (!session) {
      return;
    }

    await runAction(async () => {
      if (action === 'accept') {
        await bookingsApi.accept(bookingId, session.token);
        setMessage('Booking accepted.');
      } else if (action === 'start') {
        await bookingsApi.start(bookingId, session.token);
        setMessage('Booking started.');
      } else if (action === 'complete') {
        await bookingsApi.complete(bookingId, session.token);
        setMessage(
          session.role === 'ServiceProvider'
            ? 'Booking marked complete. Waiting on customer confirmation.'
            : 'Completion confirmed and payment released.'
        );
      }

      await refreshBookings(false);
    });
  };

  const handleLogout = async () => {
    await runAction(async () => {
      await clearStoredSession();
      setSession(null);
      setMessage('Signed out.');
    });
  };

  const getBookingActions = (booking: Booking): BookingAction[] => {
    if (!session) {
      return [];
    }

    if (session.role === 'ServiceProvider') {
      if (booking.status === 'Pending') {
        return [
          {
          key: 'accept',
          label: 'Accept booking',
          onPress: () => handleBookingAction(booking.id, 'accept'),
            variant: 'primary'
          }
        ];
      }

      if (booking.status === 'Accepted') {
        return [
          {
          key: 'start',
          label: 'Start job',
          onPress: () => handleBookingAction(booking.id, 'start'),
            variant: 'primary'
          }
        ];
      }

      if (booking.status === 'InProgress') {
        return [
          {
          key: 'complete',
          label: 'Mark complete',
          onPress: () => handleBookingAction(booking.id, 'complete'),
            variant: 'primary'
          }
        ];
      }
    }

    if (session.role === 'Customer' && booking.status === 'Completed' && booking.paymentStatus === 'Held') {
      return [
        {
          key: 'complete',
          label: 'Confirm completion',
          onPress: () => handleBookingAction(booking.id, 'complete'),
          variant: 'primary'
        }
      ];
    }

    return [];
  };

  if (isRestoring) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingCard}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {session ? (
        <DashboardScreen
          apiBaseUrl={API_BASE_URL}
          bookings={bookings}
          error={error}
          getBookingActions={getBookingActions}
          isBusy={isBusy}
          message={message}
          onCreateBooking={handleCreateBooking}
          onLogout={handleLogout}
          onRefreshBookings={handleRefreshBookings}
          onRefreshProviders={handleRefreshProviders}
          onSelectProvider={setSelectedProviderId}
          providers={providers}
          selectedProviderId={selectedProviderId}
          session={session}
        />
      ) : (
        <AuthScreen
          apiBaseUrl={API_BASE_URL}
          error={error}
          form={form}
          isBusy={isBusy}
          isRegister={isRegister}
          message={message}
          onChangeField={updateField}
          onLogin={handleLogin}
          onOAuthLogin={handleOAuthLogin}
          onRegister={handleRegister}
          onRoleChange={(role) => updateField('role', role)}
          onToggleMode={() => setIsRegister((currentValue) => !currentValue)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 160,
    padding: theme.spacing.xl,
    width: '100%',
    ...theme.shadow.card
  }
});
