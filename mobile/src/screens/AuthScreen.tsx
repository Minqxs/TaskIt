import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppModal } from '../components/AppModal';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { QuickChips } from '../components/QuickChips';
import { StatusBanner } from '../components/StatusBanner';
import { theme } from '../theme';
import type { AuthForm, RegisterForm, UserRole } from '../types';

interface AuthScreenProps {
  error: string;
  form: AuthForm;
  isBusy: boolean;
  isRegisterOpen: boolean;
  message: string;
  registerError: string;
  registerForm: RegisterForm;
  onChangeField: <K extends keyof AuthForm>(field: K, value: AuthForm[K]) => void;
  onChangeRegisterField: <K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) => void;
  onCloseRegister: () => void;
  onLogin: () => void;
  onOpenRegister: () => void;
  onRegister: () => void;
  onRegisterRoleChange: (role: UserRole) => void;
}

export function AuthScreen({
  error,
  form,
  isBusy,
  isRegisterOpen,
  message,
  registerError,
  registerForm,
  onChangeField,
  onChangeRegisterField,
  onCloseRegister,
  onLogin,
  onOpenRegister,
  onRegister,
  onRegisterRoleChange
}: AuthScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>HomeTask SA</Text>
          <Text style={styles.title}>Trusted home services, booked with confidence.</Text>
          <Text style={styles.subtitle}>
            Customers post tasks, providers show interest, and the customer chooses who gets assigned.
          </Text>
          <View style={styles.heroPills}>
            <Text style={styles.heroPill}>Post tasks</Text>
            <Text style={styles.heroPill}>Find work</Text>
            <Text style={styles.heroPill}>Track progress</Text>
          </View>
        </View>

        <View style={styles.loginCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Log in to continue managing bookings and provider offers.</Text>
          </View>

          {message ? <StatusBanner message={message} tone="success" /> : null}
          {error ? <StatusBanner message={error} tone="error" /> : null}

          <FormField
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={(value) => onChangeField('email', value)}
            placeholder="you@example.com"
            textContentType="emailAddress"
            value={form.email}
          />
          <FormField
            label="Password"
            onChangeText={(value) => onChangeField('password', value)}
            placeholder="Password"
            secureTextEntry
            textContentType="password"
            value={form.password}
          />

          <PrimaryButton disabled={isBusy} label={isBusy ? 'Logging in...' : 'Log in'} onPress={onLogin} />
          <PrimaryButton disabled={isBusy} label="Create account" onPress={onOpenRegister} variant="secondary" />
        </View>
      </ScrollView>

      <AppModal onClose={onCloseRegister} title="Create Account" visible={isRegisterOpen}>
        {registerError ? <StatusBanner message={registerError} tone="error" /> : null}

        <View style={styles.modalIntro}>
          <Text style={styles.cardSubtitle}>Choose the account type that matches how you will use HomeTask SA.</Text>
          <QuickChips
            items={['Customer', 'Service Provider']}
            onSelect={(role) => onRegisterRoleChange(role === 'Service Provider' ? 'ServiceProvider' : 'Customer')}
            selected={registerForm.role === 'ServiceProvider' ? 'Service Provider' : 'Customer'}
          />
        </View>

        <FormField
          autoCapitalize="words"
          label="Name"
          onChangeText={(value) => onChangeRegisterField('fullName', value)}
          placeholder="Your name"
          textContentType="name"
          value={registerForm.fullName}
        />
        <FormField
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => onChangeRegisterField('email', value)}
          placeholder="you@example.com"
          textContentType="emailAddress"
          value={registerForm.email}
        />
        <FormField
          label="Password"
          onChangeText={(value) => onChangeRegisterField('password', value)}
          placeholder="Password"
          secureTextEntry
          textContentType="newPassword"
          value={registerForm.password}
        />
        <FormField
          label="Confirm password"
          onChangeText={(value) => onChangeRegisterField('confirmPassword', value)}
          placeholder="Confirm password"
          secureTextEntry
          textContentType="newPassword"
          value={registerForm.confirmPassword}
        />
        {registerForm.role === 'ServiceProvider' ? (
          <FormField
            keyboardType="decimal-pad"
            label="Hourly rate"
            onChangeText={(value) => onChangeRegisterField('hourlyRate', value)}
            placeholder="120"
            value={registerForm.hourlyRate}
          />
        ) : null}

        <PrimaryButton disabled={isBusy} label={isBusy ? 'Creating account...' : 'Create account'} onPress={onRegister} />
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl
  },
  hero: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg
  },
  eyebrow: {
    color: theme.colors.accentDark,
    fontSize: theme.typography.caption,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.hero,
    fontWeight: '900',
    lineHeight: 43,
    maxWidth: 540
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 17,
    lineHeight: 24,
    maxWidth: 420
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  heroPill: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    color: theme.colors.grayDark,
    fontSize: theme.typography.bodySmall,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  loginCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    maxWidth: 520,
    padding: theme.spacing.lg,
    width: '100%',
    ...theme.shadow.card
  },
  cardHeader: {
    gap: theme.spacing.xs
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900'
  },
  cardSubtitle: {
    color: theme.colors.muted,
    fontSize: theme.typography.body,
    lineHeight: 21
  },
  modalIntro: {
    gap: theme.spacing.sm
  }
});
