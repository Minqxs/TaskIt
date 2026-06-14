import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
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
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Customer</Text>
          <Text style={styles.title}>Create Task</Text>
        </View>
        <PrimaryButton label="Back" onPress={onBack} variant="ghost" />
      </View>

      {error ? <StatusBanner message={error} tone="error" /> : null}

      <SectionCard title="Task details">
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

        <View style={styles.categoryGroup}>
          <Text style={styles.label}>Service category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <PrimaryButton
                key={category}
                label={category}
                onPress={() => onChangeField('category', category)}
                style={styles.categoryButton}
                variant={form.category === category ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </View>

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
        <Text style={styles.helperText}>
          Providers will see this pending task and can accept it from their bookings screen.
        </Text>
      </SectionCard>

      <PrimaryButton disabled={isBusy} label={isBusy ? 'Creating task...' : 'Submit task'} onPress={onSubmit} />
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
    fontSize: 30,
    fontWeight: '900'
  },
  categoryGroup: {
    gap: theme.spacing.xs
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700'
  },
  categoryGrid: {
    gap: theme.spacing.sm
  },
  categoryButton: {
    width: '100%'
  },
  helperText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18
  }
});
