/**
 * Principal email/password sign-in. On success the auth store updates and the
 * root index redirects to the admin dashboard. Error copy is derived from the
 * error `code` via the centralized mapper.
 */
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from 'react-native';

import { toUiError } from '@/api/errorMessages';
import { Button, Header, Icon, Input } from '@/components/ui';
import { usePrincipalLogin } from '@/hooks/useAuth';
import { colors, radius, spacing, typography } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PrincipalLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const login = usePrincipalLogin();
  const apiError = login.error ? toUiError(login.error) : null;

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = emailValid && password.length > 0;
  const emailError = touched && !emailValid ? 'Enter a valid email address.' : undefined;

  async function handleLogin() {
    setTouched(true);
    if (!canSubmit) return;
    const session = await login
      .mutateAsync({ email: email.trim(), password })
      .catch(() => null);
    if (session) router.replace('/');
  }

  return (
    <View style={styles.safe}>
      <Header title="Principal sign in" onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Icon name="teacher" size={28} color={colors.primary} />
            </View>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.sub}>Sign in to manage your school.</Text>
          </View>

          {/* Top-level API error (e.g. invalid credentials / network). */}
          {apiError ? (
            <View style={styles.banner}>
              <Icon name="danger" size={18} color={colors.danger} />
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>{apiError.title}</Text>
                <Text style={styles.bannerMsg}>{apiError.message}</Text>
              </View>
            </View>
          ) : null}

          <Input
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            textContentType="emailAddress"
            returnKeyType="next"
            placeholder="principal@school.com"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched(true)}
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={emailError}
          />
          <Input
            ref={passwordRef}
            label="Password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            textContentType="password"
            returnKeyType="done"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
            rightIcon={
              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
              </Pressable>
            }
          />

          <Button
            label="Sign in"
            fullWidth
            size="lg"
            loading={login.isPending}
            disabled={!canSubmit}
            onPress={handleLogin}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { padding: spacing.xl, gap: spacing.lg },
  hero: { gap: spacing.xs, marginBottom: spacing.xs },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heading: { ...typography.h2, color: colors.textPrimary },
  sub: { ...typography.body, color: colors.textSecondary },
  banner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerText: { flex: 1, gap: 2 },
  bannerTitle: { ...typography.label, color: colors.danger },
  bannerMsg: { ...typography.caption, color: colors.textSecondary },
});
