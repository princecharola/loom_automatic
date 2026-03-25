import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../components/AppCard';
import { Container } from '../components/Container';
import { colors } from '../theme/colors';

function alertTypeColor(type) {
  if (type === 'critical' || type === 'error') return colors.critical;
  return colors.warning;
}

export function AlertsScreen({ alerts }) {
  return (
    <Container title="Alerts" subtitle="Warning and critical updates">
      <ScrollView contentContainerStyle={styles.content}>
        {alerts.map((alert) => (
          <AppCard key={alert._id || `${alert.machineId}-${alert.createdAt}`}>
            <View style={styles.row}>
              <View style={styles.meta}>
                <Text style={styles.machineId}>{alert.machineId}</Text>
                <Text style={styles.message}>{alert.message}</Text>
              </View>
              <View style={styles.right}>
                <Text style={[styles.badge, { color: alertTypeColor(alert.type) }]}>{alert.type}</Text>
                <Text style={styles.time}>{new Date(alert.createdAt).toLocaleTimeString()}</Text>
              </View>
            </View>
          </AppCard>
        ))}
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
    fontWeight: '700',
    textTransform: 'capitalize'
  },
  time: {
    color: colors.textSecondary,
    fontSize: 12
  }
});
