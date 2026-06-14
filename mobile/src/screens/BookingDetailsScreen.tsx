import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppModal } from '../components/AppModal';
import { BookingCard } from '../components/BookingCard';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionCard } from '../components/SectionCard';
import { theme } from '../theme';
import type { Booking, BookingAction, Provider } from '../types';

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
  onBack: () => void;
  onChangeEditField: (field: keyof BookingDetailsScreenProps['editForm'], value: string) => void;
  onCloseEdit: () => void;
  onSubmitEdit: () => void;
}

export function BookingDetailsScreen({
  actions,
  booking,
  disabled = false,
  editForm,
  isEditOpen,
  provider,
  onBack,
  onChangeEditField,
  onCloseEdit,
  onSubmitEdit
}: BookingDetailsScreenProps) {
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
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Task details</Text>
            <Text style={styles.title}>{booking.description.split('\n')[0] || 'Task'}</Text>
          </View>
          <PrimaryButton label="Back" onPress={onBack} variant="ghost" />
        </View>

        <BookingCard actions={actions} booking={booking} disabled={disabled} />

        <SectionCard title="Assigned provider">
          {provider ? (
            <>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.meta}>R {Number(provider.hourlyRate).toFixed(2)} / hour</Text>
              <Text style={styles.meta}>Rating {provider.rating} / 5</Text>
            </>
          ) : (
            <EmptyState title="Waiting for provider" message="Waiting for a service provider to accept this task." />
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
    </>
  );
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
  header: {
    alignItems: 'flex-start',
    gap: theme.spacing.sm
  },
  headerText: {
    gap: theme.spacing.xs
  },
  eyebrow: {
    color: theme.colors.accentDark,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase'
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900'
  },
  providerName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20
  }
});
