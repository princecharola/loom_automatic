import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../components/AppCard';
import { Container } from '../components/Container';
import { PressableScaleButton } from '../components/PressableScaleButton';
import { colors } from '../theme/colors';

function statusColor(status) {
  if (status === 'running') return colors.success;
  if (status === 'error') return colors.critical;
  return colors.warning;
}

export function MachinesScreen({ machines, onRefresh }) {
  return (
    <Container title="Machines" subtitle="Live machine status and speed">
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}>
        {machines.map((machine) => (
          <AppCard key={machine.machineId}>
            <View style={styles.row}>
              <View style={styles.meta}>
                <Text style={styles.machineId}>{machine.machineId}</Text>
                <Text style={[styles.status, { color: statusColor(machine.status) }]}>{machine.status}</Text>
              </View>
              <View style={styles.rightMeta}>
                <Text style={styles.speed}>{machine.speed} RPM</Text>
                <PressableScaleButton label="Details" variant="subtle" onPress={() => {}} />
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
    alignItems: 'center'
  },
  meta: {
    gap: 6
  },
  machineId: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 18
  },
  status: {
    textTransform: 'capitalize',
    fontWeight: '600'
  },
  rightMeta: {
    gap: 8,
    alignItems: 'flex-end'
  },
  speed: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700'
  }
});
