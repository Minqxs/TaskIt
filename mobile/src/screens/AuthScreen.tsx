import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionCard } from '../components/SectionCard';
import { StatusBanner } from '../components/StatusBanner';
import { theme } from '../theme';
import type { AuthForm, UserRole } from '../types';

interface AuthScreenProps {
  apiBaseUrl: string;
  error: string;
  form: AuthForm;
  isBusy: boolean;
  isRegister: boolean;
  message: string;
  onChangeField: <K extends keyof AuthForm>(field: K, value: AuthForm[K]) => void;
  onLogin: () => void;
  onOAuthLogin: () => void;
  onRegister: () => void;
  onRoleChange: (role: UserRole) => void;
  onToggleMode: () => void;
}

export function AuthScreen({
  apiBaseUrl,
  error,
  form,
  isBusy,
  isRegister,
  message,
  onChangeField,
  onLogin,
  onOAuthLogin,
  onRegister,
  onRoleChange,
  onToggleMode
}: AuthScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Mobile marketplace MVP</Text>
        <Text style={styles.title}>HomeTask SA</Text>
        <Text style={styles.subtitle}>
          Customer booking, provider onboarding, and job status tracking now live in a clearer Expo structure.
        </Text>
      </View>

      {message ? <StatusBanner message={message} tone="info" /> : null}
      {error ? <StatusBanner message={error} tone="error" /> : null}

      <SectionCard
        subtitle="Choose a role, then sign in or register against the running API."
        title={isRegister ? 'Create account' : 'Sign in'}
      >
        <View style={styles.roleRow}>
          <PrimaryButton
            label="Customer"
            onPress={() => onRoleChange('Customer')}
            style={styles.roleButton}
            variant={form.role === 'Customer' ? 'primary' : 'secondary'}
          />
          <PrimaryButton
            label="Service provider"
            onPress={() => onRoleChange('ServiceProvider')}
            style={styles.roleButton}
            variant={form.role === 'ServiceProvider' ? 'primary' : 'secondary'}
          />
        </View>

        <FormField
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => onChangeField('email', value)}
          placeholder="you@example.com"
          value={form.email}
        />
        <FormField
          label="Password"
          onChangeText={(value) => onChangeField('password', value)}
          placeholder="Password"
          secureTextEntry
          value={form.password}
        />

        {isRegister ? (
          <>
            <FormField
              autoCapitalize="words"
              label="Full name"
              onChangeText={(value) => onChangeField('fullName', value)}
              placeholder="Full name"
              value={form.fullName}
            />
            <FormField
              keyboardType="phone-pad"
              label="Phone number"
              onChangeText={(value) => onChangeField('phoneNumber', value)}
              placeholder="Phone number"
              value={form.phoneNumber}
            />

            {form.role === 'ServiceProvider' ? (
              <>
                <FormField
                  label="Government ID number"
                  onChangeText={(value) => onChangeField('governmentIdNumber', value)}
                  placeholder="Government ID number"
                  value={form.governmentIdNumber}
                />
                <FormField
                  autoCapitalize="words"
                  label="City"
                  onChangeText={(value) => onChangeField('city', value)}
                  placeholder="City"
                  value={form.city}
                />
                <FormField
                  autoCapitalize="words"
                  label="District"
                  onChangeText={(value) => onChangeField('district', value)}
                  placeholder="District"
                  value={form.district}
                />
                <FormField
                  autoCapitalize="sentences"
                  label="Address line"
                  onChangeText={(value) => onChangeField('addressLine', value)}
                  placeholder="Address line"
                  value={form.addressLine}
                />
                <Text style={styles.helperText}>Provider accounts start in an unverified state.</Text>
              </>
            ) : null}
          </>
        ) : null}

        <PrimaryButton
          disabled={isBusy}
          label={isRegister ? 'Create account' : 'Log in'}
          onPress={isRegister ? onRegister : onLogin}
        />
        <PrimaryButton
          disabled={isBusy}
          label="Continue with Google (mock)"
          onPress={onOAuthLogin}
          variant="secondary"
        />
        <PrimaryButton
          label={isRegister ? 'Already have an account?' : 'Need to create an account?'}
          onPress={onToggleMode}
          variant="ghost"
        />
      </SectionCard>

      <SectionCard subtitle="These seeded users come from the backend seed data." title="Quick start">
        <Text style={styles.quickStartText}>Customer: customer@hometask.sa / Password123!</Text>
        <Text style={styles.quickStartText}>Provider: provider@hometask.sa / Password123!</Text>
        <Text style={styles.apiHint}>API base URL: {apiBaseUrl}</Text>
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
  hero: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.sm
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
    fontSize: 36,
    fontWeight: '900'
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 520
  },
  roleRow: {
    gap: theme.spacing.sm
  },
  roleButton: {
    width: '100%'
  },
  helperText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  quickStartText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  apiHint: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18
  }
});
