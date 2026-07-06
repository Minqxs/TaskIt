import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { AppModal } from '../components/AppModal';
import { BookingCard } from '../components/BookingCard';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { MetricCard } from '../components/MetricCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressTimeline } from '../components/ProgressTimeline';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { theme } from '../theme';
import type { Booking, BookingAction, BookingProviderApplication, Provider } from '../types';

interface BookingDetailsScreenProps {
  actions: BookingAction[];
  booking: Booking | null;
  disabled?: boolean;
  editForm: {
    title: string;
    description: string;
    category: string;
    preferredDate: string;
    preferredTime: string;
    durationHours: string;
    offeredPrice: string;
    notes: string;
  };
  isEditOpen: boolean;
  provider: Provider | null;
  providerApplications: BookingProviderApplication[];
  onBack: () => void;
  onChangeEditField: (field: keyof BookingDetailsScreenProps['editForm'], value: string) => void;
  onCloseEdit: () => void;
  onAssignProvider: (applicationId: string) => void;
  onSubmitEdit: () => void;
}

export function BookingDetailsScreen({
  actions,
  booking,
  disabled = false,
  editForm,
  isEditOpen,
  provider,
  providerApplications,
  onBack,
  onChangeEditField,
  onCloseEdit,
  onAssignProvider,
  onSubmitEdit
}: BookingDetailsScreenProps) {
  const [selectedApplication, setSelectedApplication] = useState<BookingProviderApplication | null>(null);

  if (!booking) {
    return (
      <View style={styles.centered}>
        <EmptyState title="Task not found" message="Go back to your tasks and try again." />
        <PrimaryButton label="Back to tasks" onPress={onBack} />
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader
          actionLabel="Back"
          eyebrow="Task details"
          onAction={onBack}
          subtitle="Review provider interest, assignment, payment status, and the next action."
          title={booking.description.split('\n')[0] || 'Task'}
        />

        <BookingCard actions={actions} booking={booking} disabled={disabled} />

        <SectionCard title="Task progress" subtitle="A simple view of where this booking is in the workflow.">
          <ProgressTimeline steps={getBookingTimeline(booking.status, providerApplications.length, Boolean(provider))} />
        </SectionCard>

        <View style={styles.metricGrid}>
          <MetricCard helper="Task budget" label="Total" tone="accent" value={`R ${Number(booking.totalAmount).toFixed(0)}`} />
          <MetricCard helper="Customer held/released state" label="Payment" value={booking.paymentStatus} />
        </View>

        <SectionCard title="Assigned provider" subtitle="The task becomes active after a provider is selected.">
          {provider ? (
            <>
              <View style={styles.providerSummary}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{provider.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.providerCopy}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  <Text style={styles.meta}>R {Number(provider.hourlyRate).toFixed(2)} / hour</Text>
                  <Text style={styles.meta}>Rating {provider.rating} / 5</Text>
                </View>
              </View>
            </>
          ) : (
            <EmptyState title="No provider selected yet" message="Interested providers will appear below. You choose who gets assigned." />
          )}
        </SectionCard>

        <SectionCard title="Interested providers" subtitle="Compare providers before assigning the task.">
          {providerApplications.length === 0 ? (
            <EmptyState
              title="No provider interest yet."
              message="Providers who show interest in this task will appear here."
            />
          ) : (
            providerApplications.map((application) => (
              <View key={application.id} style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <View style={styles.avatarSmall}>
                    <Text style={styles.avatarTextSmall}>{application.provider.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.applicationTitle}>
                    <Text style={styles.providerName}>{application.provider.name}</Text>
                    <Text style={styles.meta}>
                      R {Number(application.provider.hourlyRate).toFixed(2)} / hour
                    </Text>
                  </View>
                  <StatusBadge label={getApplicationStatusLabel(application.status)} />
                </View>
                <View style={styles.providerStats}>
                  <View style={styles.statPill}>
                    <Text style={styles.statValue}>{application.provider.rating} / 5</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Text style={styles.statValue}>Ready</Text>
                    <Text style={styles.statLabel}>Availability</Text>
                  </View>
                </View>
                {application.provider.city || application.provider.district ? (
                  <Text style={styles.meta}>
                    {[application.provider.district, application.provider.city].filter(Boolean).join(', ')}
                  </Text>
                ) : null}
                <StatusBadge label={application.provider.isVerified ? 'Verified' : 'Pending verification'} />
                <View style={styles.applicationActions}>
                  <PrimaryButton
                    label="Provider Details"
                    onPress={() => setSelectedApplication(application)}
                    variant="secondary"
                  />
                  <PrimaryButton
                    disabled={disabled || !canAssignProvider(booking.status, application.status)}
                    label={application.status === 'Selected' ? 'Selected' : 'Select Provider'}
                    onPress={() => onAssignProvider(application.id)}
                  />
                </View>
              </View>
            ))
          )}
        </SectionCard>
      </ScrollView>

      <AppModal onClose={onCloseEdit} title="Edit Task" visible={isEditOpen}>
        <FormField
          autoCapitalize="sentences"
          label="Task title"
          onChangeText={(value) => onChangeEditField('title', value)}
          placeholder="Task title"
          value={editForm.title}
        />
        <FormField
          autoCapitalize="sentences"
          label="Task description"
          multiline
          numberOfLines={4}
          onChangeText={(value) => onChangeEditField('description', value)}
          placeholder="Describe what needs to be done"
          value={editForm.description}
        />
        <FormField
          label="Category"
          onChangeText={(value) => onChangeEditField('category', value)}
          placeholder="Cleaning"
          value={editForm.category}
        />
        <FormField
          label="Preferred date"
          onChangeText={(value) => onChangeEditField('preferredDate', value)}
          placeholder="YYYY-MM-DD"
          value={editForm.preferredDate}
        />
        <FormField
          label="Preferred time"
          onChangeText={(value) => onChangeEditField('preferredTime', value)}
          placeholder="HH:mm"
          value={editForm.preferredTime}
        />
        <FormField
          keyboardType="number-pad"
          label="Duration hours"
          onChangeText={(value) => onChangeEditField('durationHours', value)}
          placeholder="2"
          value={editForm.durationHours}
        />
        <FormField
          keyboardType="decimal-pad"
          label="Offered price"
          onChangeText={(value) => onChangeEditField('offeredPrice', value)}
          placeholder="250"
          value={editForm.offeredPrice}
        />
        <FormField
          autoCapitalize="sentences"
          label="Notes"
          multiline
          numberOfLines={3}
          onChangeText={(value) => onChangeEditField('notes', value)}
          placeholder="Optional notes"
          value={editForm.notes}
        />
        <PrimaryButton disabled={disabled} label="Save changes" onPress={onSubmitEdit} />
      </AppModal>

      <AppModal
        onClose={() => setSelectedApplication(null)}
        title="Provider Details"
        visible={selectedApplication !== null}
      >
        {selectedApplication ? (
          <>
            <Text style={styles.providerName}>{selectedApplication.provider.name}</Text>
            <Text style={styles.meta}>R {Number(selectedApplication.provider.hourlyRate).toFixed(2)} / hour</Text>
            <Text style={styles.meta}>Rating {selectedApplication.provider.rating} / 5</Text>
            {selectedApplication.provider.city || selectedApplication.provider.district ? (
              <Text style={styles.meta}>
                {[selectedApplication.provider.district, selectedApplication.provider.city].filter(Boolean).join(', ')}
              </Text>
            ) : null}
            <StatusBadge label={selectedApplication.provider.isVerified ? 'Verified' : 'Pending verification'} />
            <StatusBadge label={getApplicationStatusLabel(selectedApplication.status)} />
            <PrimaryButton
              disabled={disabled || !canAssignProvider(booking.status, selectedApplication.status)}
              label={selectedApplication.status === 'Selected' ? 'Selected' : 'Select Provider'}
              onPress={() => {
                onAssignProvider(selectedApplication.id);
                setSelectedApplication(null);
              }}
            />
          </>
        ) : null}
      </AppModal>
    </>
  );
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

function canAssignProvider(bookingStatus: string, applicationStatus: string): boolean {
  return (
    (bookingStatus === 'Pending' || bookingStatus === 'AwaitingCustomerSelection') &&
    applicationStatus === 'PendingCustomerDecision'
  );
}

function getBookingTimeline(status: string, interestCount: number, hasProvider: boolean) {
  const posted = true;
  const interested = interestCount > 0 || status !== 'Pending';
  const selected = hasProvider || ['Accepted', 'InProgress', 'Completed'].includes(status);
  const inProgress = status === 'InProgress' || status === 'Completed';
  const completed = status === 'Completed';

  return [
    {
      complete: posted,
      label: 'Posted',
      description: 'Your task is visible to eligible providers.'
    },
    {
      active: !interested,
      complete: interested,
      label: 'Providers interested',
      description: interested ? `${interestCount} provider${interestCount === 1 ? '' : 's'} responded.` : 'Waiting for providers to show interest.'
    },
    {
      active: interested && !selected,
      complete: selected,
      label: 'Provider selected',
      description: selected ? 'A provider has been assigned.' : 'Choose the provider you want to work with.'
    },
    {
      active: selected && !inProgress,
      complete: inProgress,
      label: 'In progress',
      description: inProgress ? 'The task has started.' : 'The provider can start after assignment.'
    },
    {
      active: inProgress && !completed,
      complete: completed,
      label: 'Completed',
      description: completed ? 'Task marked complete.' : 'Confirm completion when the work is done.'
    }
  ];
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl
  },
  centered: {
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: 'center',
    padding: theme.spacing.lg
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  providerName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900'
  },
  providerSummary: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md
  },
  providerCopy: {
    flex: 1,
    gap: theme.spacing.xxs
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.ink,
    borderRadius: 999,
    height: 56,
    justifyContent: 'center',
    width: 56
  },
  avatarText: {
    color: '#ffffff',
    fontSize: theme.typography.body,
    fontWeight: '900'
  },
  avatarSmall: {
    alignItems: 'center',
    backgroundColor: theme.colors.accentMuted,
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  avatarTextSmall: {
    color: theme.colors.accentDark,
    fontSize: theme.typography.bodySmall,
    fontWeight: '900'
  },
  applicationCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg
  },
  applicationHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  applicationTitle: {
    flex: 1,
    gap: theme.spacing.xs
  },
  providerStats: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  statPill: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    padding: theme.spacing.sm
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.typography.bodySmall,
    fontWeight: '900'
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase'
  },
  applicationActions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20
  }
});
