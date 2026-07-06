import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressTimeline } from '../components/ProgressTimeline';
import { QuickChips } from '../components/QuickChips';
import { SectionCard } from '../components/SectionCard';
import { StatusBanner } from '../components/StatusBanner';
import { theme } from '../theme';
import type { CreateBookingForm } from '../types';

interface CreateBookingScreenProps {
  error: string;
  form: CreateBookingForm;
  isBusy: boolean;
  onBack: () => void;
  onChangeField: <K extends keyof CreateBookingForm>(field: K, value: CreateBookingForm[K]) => void;
  onSubmit: () => void;
}

const categories = ['Cleaning', 'Ironing', 'Errands', 'Grocery Run', 'Basic Repairs', 'Other'];

export function CreateBookingScreen({
  error,
  form,
  isBusy,
  onBack,
  onChangeField,
  onSubmit
}: CreateBookingScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <AppHeader
        actionLabel="Back"
        eyebrow="Customer"
        onAction={onBack}
        subtitle="Tell providers exactly what you need, when you need it, and what budget you have in mind."
        title="Create task"
      />

      {error ? <StatusBanner message={error} tone="error" /> : null}

      <SectionCard title="Post in 3 steps" subtitle="Keep it simple. You can edit pending tasks later.">
        <ProgressTimeline
          steps={[
            {
              active: true,
              complete: Boolean(form.category && form.title),
              description: 'Choose a service and name the task.',
              label: 'Task basics'
            },
            {
              active: Boolean(form.description),
              complete: Boolean(form.preferredDate && form.preferredTime),
              description: 'Add timing, duration, and useful notes.',
              label: 'Schedule'
            },
            {
              active: Boolean(form.offeredPrice),
              description: 'Review the budget and post for providers.',
              label: 'Review'
            }
          ]}
        />
      </SectionCard>

      <SectionCard title="Task basics" subtitle="A clear title helps the right providers respond.">
        <View style={styles.categoryGroup}>
          <Text style={styles.label}>Service category</Text>
          <QuickChips items={categories} onSelect={(category) => onChangeField('category', category)} selected={form.category} />
        </View>

        <FormField
          autoCapitalize="sentences"
          label="Task title"
          onChangeText={(value) => onChangeField('title', value)}
          placeholder="Kitchen deep clean"
          value={form.title}
        />
        <FormField
          autoCapitalize="sentences"
          label="Task description"
          multiline
          numberOfLines={4}
          onChangeText={(value) => onChangeField('description', value)}
          placeholder="Describe what needs to be done"
          value={form.description}
        />
      </SectionCard>

      <SectionCard title="Schedule and budget" subtitle="Providers use these details to decide if they can help.">
        <FormField
          label="Preferred date"
          onChangeText={(value) => onChangeField('preferredDate', value)}
          placeholder="YYYY-MM-DD"
          value={form.preferredDate}
        />
        <FormField
          label="Preferred time"
          onChangeText={(value) => onChangeField('preferredTime', value)}
          placeholder="HH:mm"
          value={form.preferredTime}
        />
        <FormField
          keyboardType="number-pad"
          label="Estimated duration in hours"
          onChangeText={(value) => onChangeField('durationHours', value)}
          placeholder="2"
          value={form.durationHours}
        />
        <FormField
          keyboardType="decimal-pad"
          label="Offered price"
          onChangeText={(value) => onChangeField('offeredPrice', value)}
          placeholder="250"
          value={form.offeredPrice}
        />
        <FormField
          autoCapitalize="sentences"
          label="Optional notes"
          multiline
          numberOfLines={3}
          onChangeText={(value) => onChangeField('notes', value)}
          placeholder="Access notes, supplies, or timing details"
          value={form.notes}
        />
      </SectionCard>

      <SectionCard title="Review before posting">
        <View style={styles.reviewCard}>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Category</Text>
            <Text style={styles.reviewValue}>{form.category || 'Choose a category'}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>When</Text>
            <Text style={styles.reviewValue}>
              {[form.preferredDate, form.preferredTime].filter(Boolean).join(' at ') || 'Add a date and time'}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Budget</Text>
            <Text style={styles.reviewValue}>{form.offeredPrice ? `R ${form.offeredPrice}` : 'Add your offer'}</Text>
          </View>
        </View>
        <Text style={styles.helperText}>
          Providers will show interest first. You stay in control and choose who gets assigned.
        </Text>
        <PrimaryButton disabled={isBusy} label={isBusy ? 'Posting task...' : 'Post task'} onPress={onSubmit} />
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
  categoryGroup: {
    gap: theme.spacing.xs
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700'
  },
  helperText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  reviewCard: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  },
  reviewRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between'
  },
  reviewLabel: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    fontWeight: '900'
  },
  reviewValue: {
    color: theme.colors.text,
    flex: 1,
    fontSize: theme.typography.bodySmall,
    fontWeight: '800',
    textAlign: 'right'
  }
});
