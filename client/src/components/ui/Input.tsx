/**
 * Input — labeled text field with validation/error state and helper text.
 *
 * Works standalone or with react-hook-form (pass value/onChangeText/onBlur via
 * a Controller). Keeps accessible labels and a large touch target.
 */
import { forwardRef, type ReactNode, useState } from 'react';
import {
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from '@/theme';

/** Event param types derived from the installed RN version's TextInput props. */
type FocusHandler = NonNullable<TextInputProps['onFocus']>;
type BlurHandler = NonNullable<TextInputProps['onBlur']>;

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** Error message; when set, the field renders in the error state. */
  error?: string;
  /** Helper text shown below the field when there is no error. */
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  /** Extra style applied to the inner TextInput (e.g. letter spacing). */
  inputStyle?: StyleProp<TextStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    containerStyle,
    inputStyle,
    onFocus,
    onBlur,
    editable = true,
    accessibilityLabel,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  const handleFocus: FocusHandler = (e) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur: BlurHandler = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const borderColor = hasError
    ? colors.danger
    : focused
      ? colors.inputBorderFocused
      : colors.inputBorder;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          { borderColor },
          !editable && styles.disabled,
        ]}
      >
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          style={[styles.input, inputStyle]}
          editable={editable}
          placeholderTextColor={colors.placeholder}
          accessibilityLabel={accessibilityLabel ?? label}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
      </View>
      {hasError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  field: {
    minHeight: touchTarget.comfortable,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.inputBackground,
    borderWidth: 1.5,
    borderRadius: radius.lg,
  },
  disabled: {
    backgroundColor: colors.disabledBackground,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    ...typography.small,
    color: colors.danger,
  },
  helper: {
    ...typography.small,
    color: colors.textMuted,
  },
});
