import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { AuthScreen } from './screens/AuthScreen';
import { BookingDetailsScreen } from './screens/BookingDetailsScreen';
import { CreateBookingScreen } from './screens/CreateBookingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { authApi, bookingsApi, providersApi, reviewsApi } from './services/api';
import { clearStoredSession, loadStoredSession, saveStoredSession } from './services/storage';
import { theme } from './theme';
import type {
  AuthForm,
  AuthResponse,
  Booking,
  BookingAction,
  BookingWorkflowAction,
  CreateBookingForm,
  Provider,
  RegisterForm,
  Session
} from './types';

const INITIAL_FORM: AuthForm = {
  email: '',
  password: ''
};

const INITIAL_REGISTER_FORM: RegisterForm = {
  role: 'Customer',
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  hourlyRate: ''
};

const INITIAL_CREATE_BOOKING_FORM: CreateBookingForm = {
  title: '',
  description: '',
  category: 'Cleaning',
  preferredDate: '',
  preferredTime: '',
  durationHours: '2',
  offeredPrice: '',
  notes: ''
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while talking to the API.';
}

export default function App() {
  const [form, setForm] = useState<AuthForm>(INITIAL_FORM);
  const [registerForm, setRegisterForm] = useState<RegisterForm>(INITIAL_REGISTER_FORM);
  const [session, setSession] = useState<Session | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<Booking['id'] | null>(null);
  const [customerScreen, setCustomerScreen] = useState<'home' | 'create' | 'details'>('home');
  const [createBookingForm, setCreateBookingForm] = useState<CreateBookingForm>(INITIAL_CREATE_BOOKING_FORM);
  const [editBookingForm, setEditBookingForm] = useState<CreateBookingForm>(INITIAL_CREATE_BOOKING_FORM);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [hourlyRate, setHourlyRate] = useState('');
  const [reviewBookingId, setReviewBookingId] = useState<Booking['id'] | null>(null);
  const [reviewRating, setReviewRating] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const isCreatingBookingRef = useRef(false);

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
      setSelectedBookingId(null);
      setCustomerScreen('home');
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
        }

        const nextBookings = await bookingsApi.listMine(session.token);
        if (cancelled) {
          return;
        }

        setBookings(nextBookings);
        setMessage('Dashboard synced with the API.');
      } catch (hydrateError) {
        if (!cancelled) {
          const hydrateErrorMessage = getErrorMessage(hydrateError);
          if (hydrateErrorMessage.includes('status 401') || hydrateErrorMessage.includes('status 403')) {
            await clearStoredSession();
            setSession(null);
            setMessage('');
            setError('Your session expired. Please log in again.');
          } else {
            setError(hydrateErrorMessage);
          }
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

  const updateRegisterField = <K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) => {
    setRegisterForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  };

  const updateCreateBookingField = <K extends keyof CreateBookingForm>(field: K, value: CreateBookingForm[K]) => {
    setCreateBookingForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  };

  const updateEditBookingField = <K extends keyof CreateBookingForm>(field: K, value: CreateBookingForm[K]) => {
    setEditBookingForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  };

  const splitBookingDescription = (description: string): Pick<
    CreateBookingForm,
    'title' | 'category' | 'description' | 'notes'
  > => {
    const lines = description.split('\n');
    const title = lines[0] ?? '';
    const categoryLine = lines.find((line) => line.startsWith('Category: '));
    const notesLine = lines.find((line) => line.startsWith('Notes: '));
    const body = lines
      .slice(1)
      .filter((line) => !line.startsWith('Category: ') && !line.startsWith('Notes: '))
      .join('\n');

    return {
      title,
      category: categoryLine?.replace('Category: ', '') || 'Other',
      description: body,
      notes: notesLine?.replace('Notes: ', '') || ''
    };
  };

  const openEditBooking = (booking: Booking) => {
    const parsedDate = new Date(booking.date);
    const parsedDescription = splitBookingDescription(booking.description);

    setEditBookingForm({
      ...parsedDescription,
      preferredDate: Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().slice(0, 10),
      preferredTime: Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().slice(11, 16),
      durationHours: String(booking.durationHours),
      offeredPrice: String(booking.totalAmount)
    });
    setError('');
    setIsEditBookingOpen(true);
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

    if (announce) {
      setMessage(nextProviders.length > 0 ? `Loaded ${nextProviders.length} providers.` : 'No providers found yet.');
    }
  };

  const refreshBookings = async (announce = true): Promise<void> => {
    if (!session) {
      return;
    }

    const nextBookings = await bookingsApi.listMine(session.token);
    setBookings(nextBookings);

    if (announce) {
      setMessage(nextBookings.length > 0 ? `Loaded ${nextBookings.length} bookings.` : 'No bookings yet.');
    }
  };

  const handleLogin = async () => {
    await runAction(async () => {
      if (!form.email.trim() || !form.password) {
        throw new Error('Enter your email and password.');
      }

      const payload = await authApi.login({
        email: form.email.trim(),
        password: form.password
      });

      await completeAuth(payload, 'Logged in successfully.');
    });
  };

  const validateRegisterForm = (): number | null => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!registerForm.fullName.trim()) {
      throw new Error('Name is required.');
    }

    if (!registerForm.email.trim() || !emailPattern.test(registerForm.email.trim())) {
      throw new Error('Enter a valid email address.');
    }

    if (!registerForm.password) {
      throw new Error('Password is required.');
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      throw new Error('Passwords must match.');
    }

    if (registerForm.role !== 'Customer' && registerForm.role !== 'ServiceProvider') {
      throw new Error('Choose a role.');
    }

    if (registerForm.role === 'ServiceProvider') {
      const hourlyRate = Number(registerForm.hourlyRate);
      if (!registerForm.hourlyRate.trim() || Number.isNaN(hourlyRate) || hourlyRate <= 0) {
        throw new Error('Hourly rate must be a number greater than 0.');
      }

      return hourlyRate;
    }

    return null;
  };

  const handleRegister = async () => {
    setIsBusy(true);
    setRegisterError('');

    try {
      const hourlyRate = validateRegisterForm();

      await authApi.register({
        email: registerForm.email.trim(),
        password: registerForm.password,
        role: registerForm.role,
        fullName: registerForm.fullName.trim(),
        phoneNumber: '',
        hourlyRate,
        governmentIdNumber: null,
        city: null,
        district: null,
        addressLine: null
      });

      setRegisterForm(INITIAL_REGISTER_FORM);
      setIsRegisterOpen(false);
      setMessage('Account created. Please log in.');
      setError('');
    } catch (registerActionError) {
      setRegisterError(getErrorMessage(registerActionError));
    } finally {
      setIsBusy(false);
    }
  };

  const handleRefreshProviders = async () => {
    await runAction(async () => {
      await refreshProviders();
    });
  };

  const handleUpdateHourlyRate = async () => {
    if (!session) {
      return;
    }

    const nextHourlyRate = Number(hourlyRate);
    if (!hourlyRate.trim() || Number.isNaN(nextHourlyRate) || nextHourlyRate <= 0) {
      setError('Hourly rate must be a number greater than 0.');
      return;
    }

    await runAction(async () => {
      await providersApi.updateRate(nextHourlyRate, session.token);
      setMessage('Hourly rate updated.');
    });
  };

  const handleRefreshBookings = async () => {
    await runAction(async () => {
      await refreshBookings();
    });
  };

  const openCreateBooking = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().slice(0, 10);

    setCreateBookingForm((currentForm) => ({
      ...INITIAL_CREATE_BOOKING_FORM,
      category: currentForm.category || INITIAL_CREATE_BOOKING_FORM.category,
      preferredDate: currentForm.preferredDate || defaultDate,
      preferredTime: currentForm.preferredTime || '09:00'
    }));
    setError('');
    setCustomerScreen('create');
  };

  const buildBookingDate = (): string => {
    const date = createBookingForm.preferredDate.trim();
    const time = createBookingForm.preferredTime.trim();
    const parsedDate = new Date(`${date}T${time}:00`);

    if (!date || !time || Number.isNaN(parsedDate.getTime())) {
      throw new Error('Enter a valid preferred date and time.');
    }

    return parsedDate.toISOString();
  };

  const buildBookingDescription = (): string => {
    const title = createBookingForm.title.trim();
    const description = createBookingForm.description.trim();
    const notes = createBookingForm.notes.trim();

    if (!title) {
      throw new Error('Task title is required.');
    }

    if (!description) {
      throw new Error('Task description is required.');
    }

    return [
      title,
      `Category: ${createBookingForm.category}`,
      description,
      notes ? `Notes: ${notes}` : ''
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleSubmitCreateBooking = async () => {
    if (!session || isCreatingBookingRef.current) {
      return;
    }

    isCreatingBookingRef.current = true;
    setIsBusy(true);
    setError('');

    try {
      const durationHours = Number(createBookingForm.durationHours);
      if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 12) {
        throw new Error('Duration must be a whole number between 1 and 12.');
      }

      const offeredPrice = Number(createBookingForm.offeredPrice);
      if (!createBookingForm.offeredPrice.trim() || Number.isNaN(offeredPrice) || offeredPrice <= 0) {
        throw new Error('Offered price must be a number greater than 0.');
      }

      await bookingsApi.create(
        {
          date: buildBookingDate(),
          durationHours,
          description: buildBookingDescription(),
          offeredPrice
        },
        session.token
      );

      await refreshBookings(false);
      setCreateBookingForm(INITIAL_CREATE_BOOKING_FORM);
      setCustomerScreen('home');
      setMessage('Task posted successfully.');
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      isCreatingBookingRef.current = false;
      setIsBusy(false);
    }
  };

  const handleSubmitEditBooking = async () => {
    if (!session || !selectedBooking) {
      return;
    }

    setIsBusy(true);
    setError('');

    try {
      const durationHours = Number(editBookingForm.durationHours);
      if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 12) {
        throw new Error('Duration must be a whole number between 1 and 12.');
      }

      const offeredPrice = Number(editBookingForm.offeredPrice);
      if (!editBookingForm.offeredPrice.trim() || Number.isNaN(offeredPrice) || offeredPrice <= 0) {
        throw new Error('Offered price must be a number greater than 0.');
      }

      const date = editBookingForm.preferredDate.trim();
      const time = editBookingForm.preferredTime.trim();
      const parsedDate = new Date(`${date}T${time}:00`);
      if (!date || !time || Number.isNaN(parsedDate.getTime())) {
        throw new Error('Enter a valid preferred date and time.');
      }

      const title = editBookingForm.title.trim();
      const description = editBookingForm.description.trim();
      if (!title) {
        throw new Error('Task title is required.');
      }

      if (!description) {
        throw new Error('Task description is required.');
      }

      await bookingsApi.update(
        selectedBooking.id,
        {
          date: parsedDate.toISOString(),
          durationHours,
          description: [
            title,
            `Category: ${editBookingForm.category}`,
            description,
            editBookingForm.notes.trim() ? `Notes: ${editBookingForm.notes.trim()}` : ''
          ]
            .filter(Boolean)
            .join('\n'),
          offeredPrice
        },
        session.token
      );

      await refreshBookings(false);
      setIsEditBookingOpen(false);
      setMessage('Task updated.');
    } catch (editError) {
      setError(getErrorMessage(editError));
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteBooking = async (bookingId: Booking['id']) => {
    if (!session) {
      return;
    }

    await runAction(async () => {
      await bookingsApi.cancel(bookingId, session.token);
      await refreshBookings(false);
      setSelectedBookingId(null);
      setCustomerScreen('home');
      setMessage('Task deleted.');
    });
  };

  const handleBookingAction = async (bookingId: Booking['id'], action: BookingWorkflowAction) => {
    if (!session) {
      return;
    }

    if (action === 'review') {
      setReviewBookingId(bookingId);
      setReviewRating('');
      setReviewComment('');
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

  const handleSubmitReview = async () => {
    if (!session || !reviewBookingId) {
      return;
    }

    const rating = Number(reviewRating);
    if (!reviewRating.trim() || Number.isNaN(rating) || rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5.');
      return;
    }

    if (!reviewComment.trim()) {
      setError('Review comment is required.');
      return;
    }

    await runAction(async () => {
      await reviewsApi.create(
        {
          bookingId: reviewBookingId,
          rating,
          comment: reviewComment.trim()
        },
        session.token
      );
      setReviewBookingId(null);
      setReviewRating('');
      setReviewComment('');
      setMessage('Review submitted.');
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
            label: 'Accept',
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

    if (session.role === 'Customer' && booking.status === 'Pending') {
      return [
        {
          key: 'edit',
          label: 'Edit task',
          onPress: () => openEditBooking(booking),
          variant: 'secondary'
        },
        {
          key: 'delete',
          label: 'Delete task',
          onPress: () => handleDeleteBooking(booking.id),
          variant: 'ghost'
        }
      ];
    }

    if (session.role === 'Customer' && booking.status === 'Completed' && booking.paymentStatus === 'Released') {
      return [
        {
          key: 'review',
          label: 'Leave review',
          onPress: () => handleBookingAction(booking.id, 'review'),
          variant: 'secondary'
        }
      ];
    }

    return [];
  };

  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId) ?? null;
  const selectedBookingProvider =
    selectedBooking && selectedBooking.serviceProviderId
      ? providers.find((provider) => provider.userId === selectedBooking.serviceProviderId) ?? null
      : null;

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
        session.role === 'Customer' && customerScreen === 'create' ? (
          <CreateBookingScreen
            error={error}
            form={createBookingForm}
            isBusy={isBusy}
            onBack={() => {
              setCustomerScreen('home');
              setError('');
            }}
            onChangeField={updateCreateBookingField}
            onSubmit={handleSubmitCreateBooking}
          />
        ) : session.role === 'Customer' && customerScreen === 'details' ? (
          <BookingDetailsScreen
            actions={selectedBooking ? getBookingActions(selectedBooking) : []}
            booking={selectedBooking}
            disabled={isBusy}
            editForm={editBookingForm}
            isEditOpen={isEditBookingOpen}
            onBack={() => {
              setCustomerScreen('home');
              setSelectedBookingId(null);
            }}
            onChangeEditField={updateEditBookingField}
            onCloseEdit={() => setIsEditBookingOpen(false)}
            onSubmitEdit={handleSubmitEditBooking}
            provider={selectedBookingProvider}
          />
        ) : (
          <DashboardScreen
            bookings={bookings}
            error={error}
            getBookingActions={getBookingActions}
            hourlyRate={hourlyRate}
            isReviewOpen={reviewBookingId !== null}
            isBusy={isBusy}
            message={message}
            onChangeHourlyRate={setHourlyRate}
            onChangeReviewComment={setReviewComment}
            onChangeReviewRating={setReviewRating}
            onCloseReview={() => setReviewBookingId(null)}
            onCreateBooking={openCreateBooking}
            onLogout={handleLogout}
            onOpenBookingDetails={(bookingId) => {
              setSelectedBookingId(bookingId);
              setCustomerScreen('details');
            }}
            onRefreshBookings={handleRefreshBookings}
            onUpdateHourlyRate={handleUpdateHourlyRate}
            onSubmitReview={handleSubmitReview}
            reviewComment={reviewComment}
            reviewRating={reviewRating}
            session={session}
          />
        )
      ) : (
        <AuthScreen
          error={error}
          form={form}
          isBusy={isBusy}
          isRegisterOpen={isRegisterOpen}
          message={message}
          registerError={registerError}
          registerForm={registerForm}
          onChangeField={updateField}
          onChangeRegisterField={updateRegisterField}
          onCloseRegister={() => {
            setRegisterError('');
            setIsRegisterOpen(false);
          }}
          onLogin={handleLogin}
          onOpenRegister={() => {
            setRegisterError('');
            setIsRegisterOpen(true);
          }}
          onRegister={handleRegister}
          onRegisterRoleChange={(role) => updateRegisterField('role', role)}
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
