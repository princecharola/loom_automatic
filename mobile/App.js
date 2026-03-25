import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TextInput, View, StyleSheet } from 'react-native';
import { fetchMachineAlerts, fetchMachineSummary, loginMobile, setMobileToken } from './src/services/api';
import { socket } from './src/services/socket';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MachinesScreen } from './src/screens/MachinesScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { colors } from './src/theme/colors';
import { PressableScaleButton } from './src/components/PressableScaleButton';

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
  const [auth, setAuth] = useState({ token: '', user: null });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const refresh = useCallback(async () => {
    setMachines(await fetchMachineSummary());
    setAlerts(await fetchMachineAlerts());
  }, []);

  useEffect(() => {
    refresh();

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
  }, [refresh]);

  const sharedProps = useMemo(() => ({ machines, alerts, onRefresh: refresh }), [machines, alerts, refresh]);

  async function handleLogin() {
    try {
      const data = await loginMobile(loginForm);
      setMobileToken(data.token);
      setAuth({ token: data.token, user: data.user });
      await refresh();
    } catch (error) {
      setAuth({ token: '', user: null });
    }
  }

  if (!auth.token) {
    return (
      <View style={styles.loginPage}>
        <Text style={styles.loginTitle}>LoomOps Mobile</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={loginForm.email}
          autoCapitalize="none"
          onChangeText={(value) => setLoginForm((current) => ({ ...current, email: value }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={loginForm.password}
          onChangeText={(value) => setLoginForm((current) => ({ ...current, password: value }))}
        />
        <PressableScaleButton label="Login" onPress={handleLogin} />
      </View>
    );
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
          {() => <DashboardScreen {...sharedProps} />}
        </Tab.Screen>
        <Tab.Screen name="Machines">
          {() => <MachinesScreen machines={machines} onRefresh={refresh} />}
        </Tab.Screen>
        <Tab.Screen name="Alerts">
          {() => <AlertsScreen alerts={alerts} onRefresh={refresh} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loginPage: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
    gap: 12
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10
  }
});
