import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppModal } from '../components/AppModal';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
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
          <Text style={styles.title}>HomeTask SA</Text>
          <Text style={styles.subtitle}>Book trusted help for simple household tasks</Text>
        </View>

        <View style={styles.loginCard}>
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

        <View style={styles.roleGroup}>
          <Text style={styles.roleLabel}>Role</Text>
          <View style={styles.roleRow}>
            <PrimaryButton
              label="Customer"
              onPress={() => onRegisterRoleChange('Customer')}
              style={styles.roleButton}
              variant={registerForm.role === 'Customer' ? 'primary' : 'secondary'}
            />
            <PrimaryButton
              label="Service Provider"
              onPress={() => onRegisterRoleChange('ServiceProvider')}
              style={styles.roleButton}
              variant={registerForm.role === 'ServiceProvider' ? 'primary' : 'secondary'}
            />
          </View>
        </View>

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
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg
  },
  title: {
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: '900'
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 17,
    lineHeight: 24,
    maxWidth: 420
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
  roleGroup: {
    gap: theme.spacing.xs
  },
  roleLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700'
  },
  roleRow: {
    gap: theme.spacing.sm
  },
  roleButton: {
    width: '100%'
  }
});
