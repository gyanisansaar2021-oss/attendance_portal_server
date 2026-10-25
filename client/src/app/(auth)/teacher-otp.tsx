/**
 * Teacher OTP sign-in. Two steps on one screen:
 *   1. Enter phone -> send OTP
 *   2. Enter the 6-digit code -> verify -> session established
 *
 * On success, the auth store updates and the root index redirects to the
 * teacher home. Business logic branches on the error `code`, never on message
 * text — error copy comes from the centralized mapper.
 */
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from 'react-native';

import { toUiError } from '@/api/errorMessages';
import { Button, Header, Icon, Input } from '@/components/ui';
import { useSendTeacherOtp, useVerifyTeacherOtp } from '@/hooks/useAuth';
import { colors, radius, spacing, typography } from '@/theme';

type Step = 'phone' | 'otp';

const RESEND_SECONDS = 30;
const PHONE_MIN_DIGITS = 10;
const OTP_LENGTH = 6;

/** Keep only digits, capped to a max length. */
function digitsOnly(value: string, max: number): string {
  return value.replace(/[^0-9]/g, '').slice(0, max);
}

export default function TeacherOtpScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const otpInputRef = useRef<TextInput>(null);

  const sendOtp = useSendTeacherOtp();
  const verifyOtp = useVerifyTeacherOtp();

  const sendError = sendOtp.error ? toUiError(sendOtp.error) : null;
  const verifyError = verifyOtp.error ? toUiError(verifyOtp.error) : null;

  const phoneValid = phone.length >= PHONE_MIN_DIGITS;
  const otpValid = otp.length === OTP_LENGTH;

  // Resend countdown tick.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const requestOtp = useCallback(async () => {
    const result = await sendOtp.mutateAsync({ phone }).catch(() => null);
    if (result) {
      setStep('otp');
      setResendIn(RESEND_SECONDS);
      setDevOtp(result.devOtp ?? null);
      // Focus the code field once it mounts.
      setTimeout(() => otpInputRef.current?.focus(), 250);
    }
  }, [phone, sendOtp]);

  const verify = useCallback(async () => {
    const session = await verifyOtp.mutateAsync({ phone, otp }).catch(() => null);
    if (session) router.replace('/');
  }, [phone, otp, verifyOtp]);

  return (
    <View style={styles.safe}>
      <Header
        title={step === 'phone' ? 'Teacher sign in' : 'Enter code'}
        onBack={() => (step === 'otp' ? resetToPhone() : router.back())}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'phone' ? (
            <>
              <View style={styles.hero}>
                <View style={styles.heroIcon}>
                  <Icon name="profile" size={26} color={colors.primary} />
                </View>
                <Text style={styles.heading}>What&apos;s your number?</Text>
                <Text style={styles.sub}>We&apos;ll text you a one-time code to sign in.</Text>
              </View>
              <Input
                label="Mobile number"
                keyboardType="phone-pad"
                autoFocus
                textContentType="telephoneNumber"
                returnKeyType="done"
                placeholder="10-digit mobile number"
                value={phone}
                onChangeText={(v) => setPhone(digitsOnly(v, 10))}
                onSubmitEditing={() => phoneValid && requestOtp()}
                error={sendError?.message}
                maxLength={10}
              />
              <Button
                label="Send code"
                fullWidth
                size="lg"
                loading={sendOtp.isPending}
                disabled={!phoneValid}
                onPress={requestOtp}
              />
            </>
          ) : (
            <>
              <View style={styles.hero}>
                <View style={styles.heroIcon}>
                  <Icon name="check-in" size={26} color={colors.primary} />
                </View>
                <Text style={styles.heading}>Enter the 6-digit code</Text>
                <Text style={styles.sub}>Sent to +91 {phone}.</Text>
              </View>

              {devOtp ? (
                <View style={styles.devHint}>
                  <Icon name="info" size={16} color={colors.primary} />
                  <Text style={styles.devHintText}>Dev code: {devOtp}</Text>
                </View>
              ) : null}

              <Input
                ref={otpInputRef}
                label="One-time code"
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                returnKeyType="done"
                placeholder="------"
                value={otp}
                onChangeText={(v) => setOtp(digitsOnly(v, OTP_LENGTH))}
                onSubmitEditing={() => otpValid && verify()}
                error={verifyError?.message}
                maxLength={OTP_LENGTH}
                inputStyle={styles.otpInput}
              />

              <Button
                label="Verify & continue"
                fullWidth
                size="lg"
                loading={verifyOtp.isPending}
                disabled={!otpValid}
                onPress={verify}
              />

              <View style={styles.resendRow}>
                {resendIn > 0 ? (
                  <Text style={styles.resendMuted}>Resend code in {resendIn}s</Text>
                ) : (
                  <Button
                    label="Resend code"
                    variant="ghost"
                    size="sm"
                    loading={sendOtp.isPending}
                    onPress={requestOtp}
                  />
                )}
              </View>

              <Button
                label="Change number"
                variant="ghost"
                fullWidth
                onPress={resetToPhone}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

  function resetToPhone() {
    setStep('phone');
    setOtp('');
    setDevOtp(null);
    verifyOtp.reset();
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
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
  otpInput: {
    letterSpacing: 8,
    fontSize: 20,
    fontWeight: '600',
  },
  devHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  devHintText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  resendRow: {
    alignItems: 'center',
    minHeight: 36,
    justifyContent: 'center',
  },
  resendMuted: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
