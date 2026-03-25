import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../components/AppCard';
import { Container } from '../components/Container';
import { PressableScaleButton } from '../components/PressableScaleButton';
import { colors } from '../theme/colors';

function statusStyles(status) {
  if (status === 'running') return { text: colors.success, bg: colors.successSoft };
  if (status === 'error') return { text: colors.critical, bg: colors.criticalSoft };
  return { text: colors.warning, bg: colors.warningSoft };
}

export function MachinesScreen({ machines, refreshing, onRefresh }) {
  return (
    <Container
      title="Machines"
      subtitle="Live machine status and speed"
      headerAction={<PressableScaleButton label="Refresh" variant="subtle" onPress={onRefresh} disabled={refreshing} />}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {machines.map((machine) => {
          const statusStyle = statusStyles(machine.status);

          return (
            <AppCard key={machine.machineId}>
              <View style={styles.row}>
                <View style={styles.meta}>
                  <Text style={styles.machineId}>{machine.machineId}</Text>
                  <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}> 
                    <Text style={[styles.status, { color: statusStyle.text }]}>{machine.status}</Text>
                  </View>
                </View>
                <View style={styles.rightMeta}>
                  <Text style={styles.speed}>{machine.speed} RPM</Text>
                  <PressableScaleButton label="Details" variant="subtle" onPress={() => {}} />
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
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  status: {
    textTransform: 'capitalize',
    fontWeight: '700',
    fontSize: 12
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
