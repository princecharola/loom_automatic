import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchMachineAlerts, fetchMachineSummary } from './src/services/api';
import { socket } from './src/services/socket';

export default function App() {
  const [machines, setMachines] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function bootstrap() {
      setMachines(await fetchMachineSummary());
      setAlerts(await fetchMachineAlerts());
    }

    bootstrap();

    socket.on('machine:reading', (reading) => {
      setMachines((current) => {
        const filtered = current.filter((item) => item.machineId !== reading.machineId);
        return [reading, ...filtered];
      });
    });

    socket.on('machine:alert', (alert) => {
      setAlerts((current) => [alert, ...current].slice(0, 20));
    });

    return () => {
      socket.off('machine:reading');
      socket.off('machine:alert');
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Loom Monitoring</Text>
        <Text style={styles.subtitle}>Live machine data and alerts</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Machines</Text>
          {machines.map((machine) => (
            <View style={styles.row} key={machine.machineId}>
              <View>
                <Text style={styles.machineId}>{machine.machineId}</Text>
                <Text>{machine.status}</Text>
              </View>
              <Text style={styles.speed}>{machine.speed} RPM</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          {alerts.map((alert) => (
            <View style={styles.alertRow} key={alert._id || `${alert.machineId}-${alert.createdAt}`}>
              <Text style={styles.alertTitle}>{alert.machineId}</Text>
              <Text>{alert.message}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  content: {
    padding: 20,
    gap: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    color: '#475569',
    marginBottom: 8
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  machineId: {
    fontWeight: '700'
  },
  speed: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '700'
  },
  alertRow: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    gap: 4
  },
  alertTitle: {
    fontWeight: '700'
  }
});
