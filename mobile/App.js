import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { fetchMachineAlerts, fetchMachineSummary, login } from './src/services/api';
import { socket } from './src/services/socket';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MachinesScreen } from './src/screens/MachinesScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { colors } from './src/theme/colors';
import { clearStoredToken, getStoredToken, persistToken } from './src/services/authStorage';
import { registerForPushNotificationsAsync, sendInAppAlertNotification } from './src/services/notifications';

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
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [pushStatus, setPushStatus] = useState('Waiting for permission...');

  useEffect(() => {
    async function loadToken() {
      try {
        const storedToken = await getStoredToken();
        if (storedToken) {
          setToken(storedToken);
        }
      } finally {
        setInitializing(false);
      }
    }

    loadToken();
  }, []);

  const loadMonitoringData = useCallback(
    async ({ withLoading = false } = {}) => {
      if (!token) {
        return;
      }

      if (withLoading) {
        setRefreshing(true);
      }

      try {
        const [summary, machineAlerts] = await Promise.all([
          fetchMachineSummary(token),
          fetchMachineAlerts(token)
        ]);

        setMachines(summary);
        setAlerts(machineAlerts);
      } finally {
        if (withLoading) {
          setRefreshing(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    loadMonitoringData({ withLoading: true });

    socket.on('machine:reading', (reading) => {
      setMachines((current) => {
        const filtered = current.filter((item) => item.machineId !== reading.machineId);
        return [reading, ...filtered];
      });
    });

    socket.on('machine:alert', (alert) => {
      setAlerts((current) => [alert, ...current].slice(0, 20));
      sendInAppAlertNotification(alert);
    });

    registerForPushNotificationsAsync()
      .then((pushToken) => {
        if (pushToken) {
          setPushStatus('Enabled');
          return;
        }

        setPushStatus('Permission denied');
      })
      .catch(() => {
        setPushStatus('Unable to register on this device');
      });

    return () => {
      socket.off('machine:reading');
      socket.off('machine:alert');
    };
  }, [loadMonitoringData, token]);

  const handleLogin = async ({ email, password }) => {
    setAuthError('');
    setAuthLoading(true);

    try {
      const response = await login({ email, password });
      await persistToken(response.token);
      setToken(response.token);
    } catch (error) {
      setAuthError(error.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearStoredToken();
    setToken(null);
    setMachines([]);
    setAlerts([]);
    setPushStatus('Waiting for permission...');
  };

  const sharedProps = useMemo(
    () => ({
      machines,
      alerts,
      refreshing,
      onRefresh: () => loadMonitoringData({ withLoading: true })
    }),
    [alerts, loadMonitoringData, machines, refreshing]
  );

  if (initializing) {
    return null;
  }

  if (!token) {
    return <LoginScreen onSubmit={handleLogin} isLoading={authLoading} errorMessage={authError} />;
  }

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
          {() => (
            <DashboardScreen
              {...sharedProps}
              pushStatus={pushStatus}
              onLogout={handleLogout}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Machines">
          {() => <MachinesScreen {...sharedProps} />}
        </Tab.Screen>
        <Tab.Screen name="Alerts">
          {() => <AlertsScreen {...sharedProps} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
