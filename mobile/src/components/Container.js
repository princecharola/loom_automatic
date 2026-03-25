import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function Container({ title, subtitle, headerAction, children }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {headerAction ? <View style={styles.actionSlot}>{headerAction}</View> : null}
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  headerCopy: {
    flex: 1
  },
  actionSlot: {
    justifyContent: 'center'
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 14
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14
  }
});
