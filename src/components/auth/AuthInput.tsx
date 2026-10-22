
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '../../theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  secureToggle?: boolean;
};

export default function AuthInput({
  label,
  error,
  secureToggle = false,
  secureTextEntry,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputBox, error ? styles.invalid : null]}>
        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={
            secureToggle ? !visible : secureTextEntry
          }
        />

        {secureToggle && (
          <Pressable
            onPress={() => setVisible(value => !value)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              visible ? 'Hide password' : 'Show password'
            }
          >
            {visible ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </Pressable>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  inputBox: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  invalid: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
    paddingVertical: spacing.md,
  },
  error: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
  },
});
