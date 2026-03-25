import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { PressableScaleButton } from '../components/PressableScaleButton';
import { colors } from '../theme/colors';

export function LoginScreen({ onSubmit, isLoading, errorMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const disabled = isLoading || !email.trim() || !password;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Loom Monitoring</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="operator@loom.com"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <PressableScaleButton
          label={isLoading ? 'Signing in...' : 'Sign in'}
          onPress={() => onSubmit({ email, password })}
          variant={disabled ? 'disabled' : 'primary'}
          disabled={disabled}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    gap: 14
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700'
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 4
  },
  fieldGroup: {
    gap: 6
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  error: {
    color: colors.critical,
    fontWeight: '500'
  }
});
