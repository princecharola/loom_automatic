import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Container } from '../components/Container';
import { AppCard } from '../components/AppCard';
import { colors } from '../theme/colors';

function MetricCard({ icon, label, value, accent }) {
  return (
    <AppCard style={styles.metricCard}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
    </AppCard>
  );
}

export function DashboardScreen({ machines, alerts }) {
  const metrics = useMemo(() => {
    const totalMachines = machines.length;
    const activeMachines = machines.filter((machine) => machine.status === 'running').length;
    const alertCount = alerts.length;

    return { totalMachines, activeMachines, alertCount };
  }, [machines, alerts]);

  return (
    <Container title="Dashboard" subtitle="Operational overview of your loom floor">
      <View style={styles.grid}>
        <MetricCard icon="🧵" label="Total Machines" value={metrics.totalMachines} accent={colors.primary} />
        <MetricCard icon="✅" label="Active Machines" value={metrics.activeMachines} accent={colors.success} />
        <MetricCard icon="⚠️" label="Alerts" value={metrics.alertCount} accent={colors.warning} />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12
  },
  metricCard: {
    gap: 8
  },
  icon: {
    fontSize: 22
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500'
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700'
  }
});
