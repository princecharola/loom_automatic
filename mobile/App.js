import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { fetchMachineAlerts, fetchMachineSummary } from './src/services/api';
import { socket } from './src/services/socket';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MachinesScreen } from './src/screens/MachinesScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

const tabIcons = {
  Dashboard: '📊',
  Machines: '🧵',
  Alerts: '🚨'
};

function TabIcon({ routeName, focused }) {
  return <Text style={{ fontSize: focused ? 18 : 16 }}>{tabIcons[routeName]}</Text>;
}

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

  const sharedProps = useMemo(() => ({ machines, alerts }), [machines, alerts]);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 62
          },
          tabBarActiveTintColor: colors.textPrimary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 12,
            paddingBottom: 4
          },
          tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />
        })}
      >
        <Tab.Screen name="Dashboard">
          {() => <DashboardScreen {...sharedProps} />}
        </Tab.Screen>
        <Tab.Screen name="Machines">
          {() => <MachinesScreen machines={machines} />}
        </Tab.Screen>
        <Tab.Screen name="Alerts">
          {() => <AlertsScreen alerts={alerts} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
