import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../components/AppCard';
import { Container } from '../components/Container';
import { PressableScaleButton } from '../components/PressableScaleButton';
import { colors } from '../theme/colors';

function alertTypeStyle(type) {
  if (type === 'critical' || type === 'error') return { text: colors.critical, bg: colors.criticalSoft };
  return { text: colors.warning, bg: colors.warningSoft };
}

export function AlertsScreen({ alerts, refreshing, onRefresh }) {
  return (
    <Container
      title="Alerts"
      subtitle="Warning and critical updates"
      headerAction={<PressableScaleButton label="Refresh" variant="subtle" onPress={onRefresh} disabled={refreshing} />}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {alerts.map((alert) => {
          const alertStyle = alertTypeStyle(alert.type);

          return (
            <AppCard key={alert._id || `${alert.machineId}-${alert.createdAt}`}>
              <View style={styles.row}>
                <View style={styles.meta}>
                  <Text style={styles.machineId}>{alert.machineId}</Text>
                  <Text style={styles.message}>{alert.message}</Text>
                </View>
                <View style={styles.right}>
                  <View style={[styles.badge, { backgroundColor: alertStyle.bg }]}> 
                    <Text style={[styles.badgeText, { color: alertStyle.text }]}>{alert.type}</Text>
                  </View>
                  <Text style={styles.time}>{new Date(alert.createdAt).toLocaleTimeString()}</Text>
                </View>
              </View>
            </AppCard>
          );
        })}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  meta: {
    flex: 1,
    gap: 6
  },
  machineId: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16
  },
  message: {
    color: colors.textSecondary
  },
  right: {
    alignItems: 'flex-end',
    gap: 4
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  badgeText: {
    fontWeight: '700',
    textTransform: 'capitalize'
  },
  time: {
    color: colors.textSecondary,
    fontSize: 12
  }
});
