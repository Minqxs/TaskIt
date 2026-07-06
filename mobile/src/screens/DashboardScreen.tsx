import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { AppBottomNavigation } from '../components/AppBottomNavigation';
import { AppHeader } from '../components/AppHeader';
import { AppModal } from '../components/AppModal';
import { BookingCard } from '../components/BookingCard';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { MetricCard } from '../components/MetricCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { QuickChips } from '../components/QuickChips';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { StatusBanner } from '../components/StatusBanner';
import { theme } from '../theme';
import type {
  Booking,
  BookingAction,
  BookingApplication,
  CustomerProfile,
  ProviderDashboardTab,
  ServiceProviderProfile,
  Session
} from '../types';

type CustomerTab = 'home' | 'tasks' | 'inbox' | 'profile';
type ProviderTab = 'dashboard' | 'browse' | 'jobs' | 'earnings' | 'profile';
type MainTab = CustomerTab | ProviderTab;

interface DashboardScreenProps {
  availableBookings: Booking[];
  bookings: Booking[];
  customerProfile: CustomerProfile | null;
  providerApplications: BookingApplication[];
  providerProfile: ServiceProviderProfile | null;
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
  onUpdateCustomerProfile: (profile: { fullName: string; phoneNumber: string }) => void;
  onUpdateProviderProfile: (profile: {
    fullName: string;
    phoneNumber: string;
    hourlyRate: string;
    governmentIdNumber: string;
    city: string;
    district: string;
    addressLine: string;
  }) => void;
  onUpdateHourlyRate: () => void;
  onSubmitReview: () => void;
  session: Session;
}

const customerCategories = ['Cleaning', 'Ironing', 'Repairs', 'Errands', 'Groceries'];
const providerFilters = ['All', 'Cleaning', 'Ironing', 'Repairs', 'Errands'];
const customerStatusFilters = ['Active', 'Completed', 'Cancelled'];

export function DashboardScreen({
  availableBookings,
  bookings,
  customerProfile,
  providerApplications,
  providerProfile,
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
  onUpdateCustomerProfile,
  onUpdateProviderProfile,
  onUpdateHourlyRate,
  onSubmitReview,
  session
}: DashboardScreenProps) {
  const [customerTab, setCustomerTab] = useState<CustomerTab>('home');
  const [providerMainTab, setProviderMainTab] = useState<ProviderTab>('dashboard');
  const [browseQuery, setBrowseQuery] = useState('');
  const [browseCategory, setBrowseCategory] = useState('All');
  const [customerStatus, setCustomerStatus] = useState('Active');

  const mainTab: MainTab = session.role === 'ServiceProvider' ? providerMainTab : customerTab;
  const activeBookings = bookings.filter((booking) => !isHistoryStatus(booking.status));
  const historyBookings = bookings.filter((booking) => isHistoryStatus(booking.status));
  const completedBookings = bookings.filter((booking) => booking.status === 'Completed');
  const openCustomerBookings = bookings.filter((booking) => booking.status === 'Pending' || booking.status === 'AwaitingCustomerSelection');
  const inProgressBookings = bookings.filter((booking) => booking.status === 'Accepted' || booking.status === 'InProgress');

  const filteredAvailableBookings = useMemo(
    () =>
      availableBookings.filter((booking) => {
        const parts = getTaskParts(booking.description);
        const matchesCategory = browseCategory === 'All' || parts.category === browseCategory;
        const normalizedQuery = browseQuery.trim().toLowerCase();
        const matchesQuery =
          !normalizedQuery ||
          `${parts.title} ${parts.category ?? ''} ${parts.summary}`.toLowerCase().includes(normalizedQuery);

        return matchesCategory && matchesQuery;
      }),
    [availableBookings, browseCategory, browseQuery]
  );

  const visibleCustomerTasks = customerStatus === 'Active'
    ? activeBookings
    : historyBookings.filter((booking) => booking.status === customerStatus);

  const providerEarnings = completedBookings.reduce((total, booking) => total + Number(booking.totalAmount || 0), 0);

  return (
    <>
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppHeader
            actionDisabled={isBusy}
            actionLabel={session.role === 'Customer' ? 'Post task' : 'Refresh'}
            eyebrow={getRoleLabel(session.role)}
            onAction={session.role === 'Customer' ? onCreateBooking : onRefreshBookings}
            subtitle={getTabSubtitle(mainTab)}
            title={getTabTitle(mainTab)}
          />

          {message ? <StatusBanner message={message} tone="success" /> : null}
          {error ? <StatusBanner message={error} tone="error" /> : null}
          {isBusy ? <LoadingStrip /> : null}

          {session.role === 'Customer' && customerTab === 'home' ? (
            <>
              <SectionCard title="What do you need done?" subtitle="Post a task and choose from interested providers.">
                <PrimaryButton disabled={isBusy} label="Create a Task" onPress={onCreateBooking} />
                <QuickChips items={customerCategories} />
              </SectionCard>

              <View style={styles.metricGrid}>
                <MetricCard helper="Need your attention" label="Open" tone="accent" value={String(openCustomerBookings.length)} />
                <MetricCard helper="Assigned or underway" label="Active" tone="blue" value={String(inProgressBookings.length)} />
              </View>

              <SectionCard
                action={<PrimaryButton label="View all" onPress={() => setCustomerTab('tasks')} style={styles.smallAction} variant="secondary" />}
                title="Current bookings"
                subtitle="Track provider interest, assignment, and completion."
              >
                {activeBookings.length === 0 ? (
                  <>
                    <EmptyState title="No active tasks yet" message="Create a task when you need help at home." />
                    <PrimaryButton label="Post your first task" onPress={onCreateBooking} />
                  </>
                ) : (
                  activeBookings.slice(0, 2).map((booking) => (
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

              <SectionCard title="Trust and safety" subtitle="Built for clear handoffs and customer choice.">
                <View style={styles.infoList}>
                  <InfoRow title="You choose the provider" text="Providers can show interest, but you decide who gets assigned." />
                  <InfoRow title="Payment status stays visible" text="Each task shows whether payment is held, released, or pending." />
                </View>
              </SectionCard>
            </>
          ) : null}

          {session.role === 'Customer' && customerTab === 'tasks' ? (
            <SectionCard title="My tasks" subtitle="Filter your bookings by status and open the full task detail.">
              <QuickChips items={customerStatusFilters} onSelect={setCustomerStatus} selected={customerStatus} />
              {visibleCustomerTasks.length === 0 ? (
                <EmptyState title={`No ${customerStatus.toLowerCase()} tasks`} message="Tasks will appear here as their status changes." />
              ) : (
                visibleCustomerTasks.map((booking) => (
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
          ) : null}

          {session.role === 'Customer' && customerTab === 'inbox' ? (
            <SectionCard title="Messages and notifications" subtitle="A polished placeholder for task updates and chat.">
              <NotificationCard title="Provider interest" text="When providers offer to help, their cards will appear on the task detail screen." />
              <NotificationCard title="Booking updates" text="Assignment, start, completion, and review prompts will be listed here." />
              <EmptyState title="Chat is not connected yet" message="This area is ready for conversation data when messaging is added." />
            </SectionCard>
          ) : null}

          {session.role === 'Customer' && customerTab === 'profile' ? (
            <ProfileSection
              hourlyRate={hourlyRate}
              isBusy={isBusy}
              customerProfile={customerProfile}
              onChangeHourlyRate={onChangeHourlyRate}
              onLogout={onLogout}
              onRefreshBookings={onRefreshBookings}
              onUpdateCustomerProfile={onUpdateCustomerProfile}
              onUpdateProviderProfile={onUpdateProviderProfile}
              onUpdateHourlyRate={onUpdateHourlyRate}
              providerProfile={providerProfile}
              session={session}
            />
          ) : null}

          {session.role === 'ServiceProvider' && providerMainTab === 'dashboard' ? (
            <>
              <SectionCard title="Provider dashboard" subtitle="Your daily view for available work and assigned jobs.">
                <View style={styles.metricGrid}>
                  <MetricCard helper="Ready to review" label="Available" tone="accent" value={String(availableBookings.length)} />
                  <MetricCard helper="Customer deciding" label="Offers sent" tone="purple" value={String(providerApplications.length)} />
                  <MetricCard helper="Assigned to you" label="Active" tone="blue" value={String(activeBookings.length)} />
                </View>
                <PrimaryButton label="Browse available tasks" onPress={() => setProviderMainTab('browse')} />
              </SectionCard>

              <SectionCard title="Availability" subtitle="Customers can only select providers who respond clearly.">
                <View style={styles.availabilityCard}>
                  <View style={styles.availabilityCopy}>
                    <Text style={styles.availabilityTitle}>Open for new tasks</Text>
                    <Text style={styles.meta}>Showing interest sends your availability to the customer.</Text>
                  </View>
                  <StatusBadge label="Online" />
                </View>
              </SectionCard>

              <SectionCard title="Today and active jobs">
                {activeBookings.length === 0 ? (
                  <EmptyState title="No assigned jobs yet" message="When a customer chooses you, the task appears here with next actions." />
                ) : (
                  activeBookings.slice(0, 2).map((booking) => (
                    <BookingCard actions={getBookingActions(booking)} booking={booking} disabled={isBusy} key={booking.id} />
                  ))
                )}
              </SectionCard>
            </>
          ) : null}

          {session.role === 'ServiceProvider' && providerMainTab === 'browse' ? (
            <SectionCard title="Browse tasks" subtitle="Find work that matches your schedule, location, and skills.">
              <View style={styles.searchBox}>
                <Text style={styles.searchLabel}>Search tasks</Text>
                <TextInput
                  onChangeText={setBrowseQuery}
                  placeholder="Search title, category, or description"
                  placeholderTextColor={theme.colors.muted}
                  style={styles.searchInput}
                  value={browseQuery}
                />
              </View>
              <QuickChips items={providerFilters} onSelect={setBrowseCategory} selected={browseCategory} />
              {filteredAvailableBookings.length === 0 ? (
                <EmptyState title="No matching tasks" message="Try another category or clear your search." />
              ) : (
                filteredAvailableBookings.map((booking) => (
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

          {session.role === 'ServiceProvider' && providerMainTab === 'jobs' ? (
            <>
              <View style={styles.segmentedControl}>
                <SegmentButton active={providerTab === 'applications'} label="Offers sent" onPress={() => onChangeProviderTab('applications')} />
                <SegmentButton active={providerTab === 'assigned'} label="Assigned" onPress={() => onChangeProviderTab('assigned')} />
                <SegmentButton active={providerTab === 'available'} label="Available" onPress={() => onChangeProviderTab('available')} />
              </View>

              {providerTab === 'applications' ? (
                <SectionCard title="Offers sent" subtitle="These are tasks where the customer still chooses the provider.">
                  {providerApplications.length === 0 ? (
                    <>
                      <EmptyState title="No offers sent yet" message="Browse tasks and use Show Interest when a job fits." />
                      <PrimaryButton label="Browse tasks" onPress={() => setProviderMainTab('browse')} />
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
                <SectionCard title="Assigned jobs" subtitle="Start, update, or complete jobs after the customer selects you.">
                  {activeBookings.length === 0 ? (
                    <EmptyState title="No assigned jobs" message="Assigned jobs will appear here with the next action." />
                  ) : (
                    activeBookings.map((booking) => (
                      <BookingCard actions={getBookingActions(booking)} booking={booking} disabled={isBusy} key={booking.id} />
                    ))
                  )}
                </SectionCard>
              ) : null}

              {providerTab === 'available' ? (
                <SectionCard title="Available tasks" subtitle="A quick view of new open work.">
                  {availableBookings.length === 0 ? (
                    <EmptyState title="No available tasks right now" message="New customer tasks will appear here when posted." />
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
            </>
          ) : null}

          {session.role === 'ServiceProvider' && providerMainTab === 'earnings' ? (
            <>
              <View style={styles.metricGrid}>
                <MetricCard helper="Completed jobs" label="Earned" tone="success" value={`R ${providerEarnings.toFixed(0)}`} />
                <MetricCard helper="Awaiting payout integration" label="Pending" value="R 0" />
              </View>
              <SectionCard title="Completed jobs" subtitle="This list is ready to connect to payout reporting.">
                {completedBookings.length === 0 ? (
                  <EmptyState title="No completed jobs yet" message="Completed work will appear here with payout details." />
                ) : (
                  completedBookings.map((booking) => (
                    <BookingCard actions={getBookingActions(booking)} booking={booking} disabled={isBusy} key={booking.id} />
                  ))
                )}
              </SectionCard>
            </>
          ) : null}

          {session.role === 'ServiceProvider' && providerMainTab === 'profile' ? (
            <ProfileSection
              hourlyRate={hourlyRate}
              isBusy={isBusy}
              customerProfile={customerProfile}
              onChangeHourlyRate={onChangeHourlyRate}
              onLogout={onLogout}
              onRefreshBookings={onRefreshBookings}
              onUpdateCustomerProfile={onUpdateCustomerProfile}
              onUpdateProviderProfile={onUpdateProviderProfile}
              onUpdateHourlyRate={onUpdateHourlyRate}
              providerProfile={providerProfile}
              session={session}
            />
          ) : null}
        </ScrollView>

        {session.role === 'Customer' ? (
          <AppBottomNavigation
            activeKey={customerTab}
            items={[
              { key: 'home', label: 'Home' },
              { key: 'tasks', label: 'Tasks' },
              { key: 'inbox', label: 'Inbox' },
              { key: 'profile', label: 'Profile' }
            ]}
            onChange={setCustomerTab}
          />
        ) : (
          <AppBottomNavigation
            activeKey={providerMainTab}
            items={[
              { key: 'dashboard', label: 'Home' },
              { key: 'browse', label: 'Browse' },
              { key: 'jobs', label: 'Jobs' },
              { key: 'earnings', label: 'Pay' },
              { key: 'profile', label: 'Profile' }
            ]}
            onChange={setProviderMainTab}
          />
        )}
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

function ProfileSection({
  customerProfile,
  hourlyRate,
  isBusy,
  onChangeHourlyRate,
  onLogout,
  onRefreshBookings,
  onUpdateCustomerProfile,
  onUpdateProviderProfile,
  onUpdateHourlyRate,
  providerProfile,
  session
}: {
  customerProfile: CustomerProfile | null;
  hourlyRate: string;
  isBusy: boolean;
  onChangeHourlyRate: (value: string) => void;
  onLogout: () => void;
  onRefreshBookings: () => void;
  onUpdateCustomerProfile: (profile: { fullName: string; phoneNumber: string }) => void;
  onUpdateProviderProfile: (profile: {
    fullName: string;
    phoneNumber: string;
    hourlyRate: string;
    governmentIdNumber: string;
    city: string;
    district: string;
    addressLine: string;
  }) => void;
  onUpdateHourlyRate: () => void;
  providerProfile: ServiceProviderProfile | null;
  session: Session;
}) {
  const [draftSaved, setDraftSaved] = useState(false);
  const [customerName, setCustomerName] = useState(customerProfile?.fullName ?? '');
  const [customerPhone, setCustomerPhone] = useState(customerProfile?.phoneNumber ?? '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerArea, setCustomerArea] = useState('');
  const [providerBio, setProviderBio] = useState('');
  const [providerServices, setProviderServices] = useState('Cleaning, ironing, errands');
  const [providerName, setProviderName] = useState(providerProfile?.fullName ?? '');
  const [providerPhone, setProviderPhone] = useState(providerProfile?.phoneNumber ?? '');
  const [providerGovernmentId, setProviderGovernmentId] = useState(providerProfile?.governmentIdNumber ?? '');
  const [providerCity, setProviderCity] = useState(providerProfile?.city ?? '');
  const [providerDistrict, setProviderDistrict] = useState(providerProfile?.district ?? '');
  const [providerAddress, setProviderAddress] = useState(providerProfile?.addressLine ?? '');
  const [providerAvailable, setProviderAvailable] = useState(true);
  const [customerNotifications, setCustomerNotifications] = useState(true);
  const [customerSavedAddress, setCustomerSavedAddress] = useState(true);

  useEffect(() => {
    setCustomerName(customerProfile?.fullName ?? '');
    setCustomerPhone(customerProfile?.phoneNumber ?? '');
  }, [customerProfile]);

  useEffect(() => {
    if (!providerProfile) {
      return;
    }

    setProviderName(providerProfile?.fullName ?? '');
    setProviderPhone(providerProfile?.phoneNumber ?? '');
    setProviderGovernmentId(providerProfile?.governmentIdNumber ?? '');
    setProviderCity(providerProfile?.city ?? '');
    setProviderDistrict(providerProfile?.district ?? '');
    setProviderAddress(providerProfile?.addressLine ?? '');
    onChangeHourlyRate(String(providerProfile.hourlyRate ?? ''));
  }, [onChangeHourlyRate, providerProfile]);

  const saveDraft = () => {
    setDraftSaved(true);
  };

  return (
    <>
      {draftSaved ? <StatusBanner message="Profile draft saved on this device. Backend sync can be connected later." tone="success" /> : null}

      <SectionCard title="Profile overview" subtitle="Account details and marketplace readiness.">
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{session.role === 'ServiceProvider' ? 'SP' : 'CU'}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileTitle}>{getRoleLabel(session.role)}</Text>
            <Text style={styles.meta}>{session.role === 'ServiceProvider' ? providerProfile?.email : customerProfile?.email}</Text>
            <Text style={styles.meta}>User ID: {session.userId}</Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <StatusBadge label={session.role === 'ServiceProvider' ? 'Provider account' : 'Customer account'} />
          <StatusBadge label="Backend sync pending" />
        </View>
      </SectionCard>

      {session.role === 'ServiceProvider' ? (
        <>
        <SectionCard title="Provider profile" subtitle="This is what customers should see before they select you.">
          <FormField
            autoCapitalize="words"
            label="Public name"
            onChangeText={setProviderName}
            placeholder="Your display name"
            value={providerName}
          />
          <FormField
            keyboardType="phone-pad"
            label="Phone number"
            onChangeText={setProviderPhone}
            placeholder="+27 82 000 0000"
            value={providerPhone}
          />
          <FormField
            autoCapitalize="sentences"
            label="Public bio"
            multiline
            numberOfLines={4}
            onChangeText={setProviderBio}
            placeholder="Friendly, reliable helper for weekly cleaning, ironing, and errands."
            value={providerBio}
          />
          <FormField
            autoCapitalize="words"
            label="Services and skills"
            onChangeText={setProviderServices}
            placeholder="Cleaning, ironing, errands"
            value={providerServices}
          />
          <FormField
            keyboardType="decimal-pad"
            label="Hourly rate"
            onChangeText={onChangeHourlyRate}
            placeholder="120"
            value={hourlyRate}
          />
          <View style={styles.actionRow}>
            <PrimaryButton
              disabled={isBusy}
              label="Save provider profile"
              onPress={() =>
                onUpdateProviderProfile({
                  fullName: providerName,
                  phoneNumber: providerPhone,
                  hourlyRate,
                  governmentIdNumber: providerGovernmentId,
                  city: providerCity,
                  district: providerDistrict,
                  addressLine: providerAddress
                })
              }
              style={styles.actionFlex}
            />
            <PrimaryButton disabled={isBusy} label="Update rate only" onPress={onUpdateHourlyRate} style={styles.actionFlex} variant="secondary" />
            <PrimaryButton label="Save draft" onPress={saveDraft} style={styles.actionFlex} variant="secondary" />
          </View>
          <ProfileCompletion />
        </SectionCard>

        <SectionCard title="Service area and availability" subtitle="Help customers understand where and when you can work.">
          <FormField
            autoCapitalize="words"
            label="City"
            onChangeText={setProviderCity}
            placeholder="Cape Town"
            value={providerCity}
          />
          <FormField
            autoCapitalize="words"
            label="District or suburb"
            onChangeText={setProviderDistrict}
            placeholder="Rondebosch"
            value={providerDistrict}
          />
          <FormField
            autoCapitalize="sentences"
            label="Address line"
            multiline
            numberOfLines={3}
            onChangeText={setProviderAddress}
            placeholder="Street address or operating base"
            value={providerAddress}
          />
          <FormField
            autoCapitalize="characters"
            label="Government ID number"
            onChangeText={setProviderGovernmentId}
            placeholder="ID or verification reference"
            value={providerGovernmentId}
          />
          <ManagementToggle
            enabled={providerAvailable}
            label="Available for new tasks"
            onChange={setProviderAvailable}
            text="When enabled, customers should see you as open to new offers."
          />
          <ManagementPanel
            title="Weekly availability"
            items={['Weekdays: 08:00 - 17:00', 'Saturday: 09:00 - 13:00', 'Sunday: unavailable']}
          />
        </SectionCard>

        <SectionCard title="Trust and verification" subtitle="These items are UI-ready and can map to verification endpoints later.">
          <ChecklistRow done label="Phone number verified" />
          <ChecklistRow done={Boolean(providerGovernmentId)} label="Government ID captured" />
          <ChecklistRow done={Boolean(providerAddress)} label="Address captured" />
          <ChecklistRow done label="Customer ratings visible" />
        </SectionCard>
        </>
      ) : (
        <>
        <SectionCard title="Customer details" subtitle="Keep booking details fast and accurate.">
          <FormField
            autoCapitalize="words"
            label="Full name"
            onChangeText={setCustomerName}
            placeholder="Your name"
            value={customerName}
          />
          <FormField
            keyboardType="phone-pad"
            label="Phone number"
            onChangeText={setCustomerPhone}
            placeholder="+27 82 000 0000"
            value={customerPhone}
          />
          <FormField
            autoCapitalize="words"
            label="Primary area"
            onChangeText={setCustomerArea}
            placeholder="Bryanston, Johannesburg"
            value={customerArea}
          />
          <PrimaryButton label="Save customer draft" onPress={saveDraft} />
          <PrimaryButton
            disabled={isBusy}
            label="Save customer profile"
            onPress={() =>
              onUpdateCustomerProfile({
                fullName: customerName,
                phoneNumber: customerPhone
              })
            }
          />
        </SectionCard>

        <SectionCard title="Saved home and booking preferences" subtitle="Useful defaults for faster task posting.">
          <FormField
            autoCapitalize="sentences"
            label="Default service address"
            multiline
            numberOfLines={3}
            onChangeText={setCustomerAddress}
            placeholder="Street address, complex name, access notes"
            value={customerAddress}
          />
          <QuickChips items={['Cleaning', 'Repairs', 'Errands', 'Groceries', 'Ironing']} />
          <ManagementToggle
            enabled={customerSavedAddress}
            label="Use saved address for new tasks"
            onChange={setCustomerSavedAddress}
            text="Pre-fills task location once backend address storage is connected."
          />
        </SectionCard>

        <SectionCard title="Customer controls" subtitle="Privacy, notifications, and support surfaces customers expect.">
          <ManagementToggle
            enabled={customerNotifications}
            label="Booking notifications"
            onChange={setCustomerNotifications}
            text="Provider interest, selection, start, completion, and review reminders."
          />
          <ManagementPanel
            title="Payment and safety"
            items={['Payment methods placeholder', 'Dispute support placeholder', 'Emergency contact placeholder']}
          />
          <ManagementPanel
            title="Help"
            items={['Booking FAQ', 'Provider selection guide', 'Contact support']}
          />
        </SectionCard>
        </>
      )}

      <SectionCard title="Settings" subtitle="Manage your session and refresh local data.">
        <PrimaryButton disabled={isBusy} label="Refresh data" onPress={onRefreshBookings} variant="secondary" />
        <PrimaryButton label="Log out" onPress={onLogout} variant="ghost" />
      </SectionCard>
    </>
  );
}

function ProfileCompletion() {
  return (
    <View style={styles.completionCard}>
      <View style={styles.completionTop}>
        <Text style={styles.completionTitle}>Profile completion</Text>
        <Text style={styles.completionPercent}>70%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
      <Text style={styles.meta}>Bio, skills, verification, and photos are UI placeholders ready for backend fields.</Text>
    </View>
  );
}

function ManagementToggle({
  enabled,
  label,
  onChange,
  text
}: {
  enabled: boolean;
  label: string;
  onChange: (value: boolean) => void;
  text: string;
}) {
  return (
    <View style={styles.toggleCard}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleTitle}>{label}</Text>
        <Text style={styles.meta}>{text}</Text>
      </View>
      <Switch
        onValueChange={onChange}
        thumbColor="#ffffff"
        trackColor={{ false: theme.colors.borderStrong, true: theme.colors.accent }}
        value={enabled}
      />
    </View>
  );
}

function ManagementPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.managementPanel}>
      <Text style={styles.managementTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={styles.managementRow}>
          <View style={styles.managementDot} />
          <Text style={styles.meta}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ChecklistRow({ done, label }: { done: boolean; label: string }) {
  return (
    <View style={styles.checklistRow}>
      <StatusBadge label={done ? 'Complete' : 'To do'} />
      <Text style={styles.checklistText}>{label}</Text>
    </View>
  );
}

function SegmentButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <PrimaryButton label={label} onPress={onPress} style={styles.segmentButton} variant={active ? 'primary' : 'secondary'} />
  );
}

function LoadingStrip() {
  return (
    <View style={styles.loadingStrip}>
      <View style={styles.loadingBar} />
      <Text style={styles.loadingText}>Syncing latest marketplace data...</Text>
    </View>
  );
}

function InfoRow({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoDot} />
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.meta}>{text}</Text>
      </View>
    </View>
  );
}

function NotificationCard({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <StatusBadge label="Ready" />
      </View>
      <Text style={styles.meta}>{text}</Text>
    </View>
  );
}

function isHistoryStatus(status: string): boolean {
  return status === 'Completed' || status === 'Cancelled';
}

function getTaskParts(description: string): { title: string; category: string | null; summary: string } {
  const lines = description.split('\n').filter(Boolean);
  const title = lines[0] || 'Task';
  const category = lines.find((line) => line.startsWith('Category: '))?.replace('Category: ', '') ?? null;
  const summary = lines.filter((line) => !line.startsWith('Category: ') && !line.startsWith('Notes: ')).slice(1).join(' ');

  return { title, category, summary };
}

function getRoleLabel(role: Session['role']): string {
  return role === 'ServiceProvider' ? 'Provider' : 'Customer';
}

function getTabTitle(tab: MainTab): string {
  const titles: Record<MainTab, string> = {
    home: 'Home',
    tasks: 'My tasks',
    inbox: 'Inbox',
    profile: 'Profile',
    dashboard: 'Provider hub',
    browse: 'Find work',
    jobs: 'My jobs',
    earnings: 'Earnings'
  };

  return titles[tab];
}

function getTabSubtitle(tab: MainTab): string {
  const subtitles: Record<MainTab, string> = {
    home: 'Book reliable help and track every task.',
    tasks: 'Review bookings, providers, and next actions.',
    inbox: 'Task updates and chat placeholders.',
    profile: 'Account, profile details, and settings.',
    dashboard: 'See work opportunities and active jobs.',
    browse: 'Search open customer tasks and show interest.',
    jobs: 'Track applications and assigned work.',
    earnings: 'Completed work and payout placeholders.'
  };

  return subtitles[tab];
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
    paddingBottom: 116
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  smallAction: {
    minHeight: 40
  },
  infoList: {
    gap: theme.spacing.md
  },
  infoRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  infoDot: {
    backgroundColor: theme.colors.accent,
    borderRadius: 999,
    height: 10,
    marginTop: 5,
    width: 10
  },
  infoCopy: {
    flex: 1,
    gap: theme.spacing.xxs
  },
  infoTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '900'
  },
  notificationCard: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md
  },
  notificationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between'
  },
  notificationTitle: {
    color: theme.colors.text,
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: '900'
  },
  availabilityCard: {
    alignItems: 'flex-start',
    backgroundColor: theme.colors.accentMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    padding: theme.spacing.md
  },
  availabilityCopy: {
    flex: 1,
    gap: theme.spacing.xxs
  },
  availabilityTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: '900'
  },
  segmentedControl: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.sm
  },
  segmentButton: {
    width: '100%'
  },
  searchBox: {
    gap: theme.spacing.xs
  },
  searchLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.bodySmall,
    fontWeight: '900'
  },
  searchInput: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    minHeight: 50,
    paddingHorizontal: theme.spacing.md
  },
  profileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.ink,
    borderRadius: 999,
    height: 54,
    justifyContent: 'center',
    width: 54
  },
  avatarText: {
    color: '#ffffff',
    fontSize: theme.typography.body,
    fontWeight: '900'
  },
  profileCopy: {
    flex: 1,
    gap: theme.spacing.xxs
  },
  profileTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: '900'
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  actionFlex: {
    flex: 1,
    minWidth: 140
  },
  completionCard: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  },
  completionTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  completionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '900'
  },
  completionPercent: {
    color: theme.colors.accentDark,
    fontSize: theme.typography.body,
    fontWeight: '900'
  },
  progressTrack: {
    backgroundColor: theme.colors.border,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden'
  },
  progressFill: {
    backgroundColor: theme.colors.accent,
    height: 8,
    width: '70%'
  },
  toggleCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    padding: theme.spacing.md
  },
  toggleCopy: {
    flex: 1,
    gap: theme.spacing.xxs
  },
  toggleTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '900'
  },
  managementPanel: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  },
  managementTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '900'
  },
  managementRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  managementDot: {
    backgroundColor: theme.colors.accent,
    borderRadius: 999,
    height: 7,
    width: 7
  },
  checklistRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  },
  checklistText: {
    color: theme.colors.text,
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: '800'
  },
  loadingStrip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  },
  loadingBar: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: 999,
    height: 10,
    width: '62%'
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    fontWeight: '800'
  },
  meta: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    lineHeight: 19
  }
});
