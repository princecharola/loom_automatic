import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  acknowledgeAlert,
  addMachine,
  editMachine,
  fetchAlerts,
  fetchMachines,
  login,
  removeMachine,
  resolveAlert
} from './services/api';
import { socket } from './services/socket';
import { DashboardPage } from './pages/DashboardPage';
import { MachinesPage } from './pages/MachinesPage';

const emptyForm = {
  machineId: '',
  name: '',
  location: '',
  type: 'loom',
  assignedOperators: '',
  status: 'stopped',
  speed: 0,
  thresholds: {
    warningSpeed: 80,
    criticalSpeed: 10,
    maxIdleMinutes: 10
  }
};

export default function App() {
  const [machines, setMachines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);
  const [formState, setFormState] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('loom_token') || '';
    const user = localStorage.getItem('loom_user');
    return { token, user: user ? JSON.parse(user) : null };
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  async function bootstrapDashboard() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [machineData, alertData] = await Promise.all([fetchMachines('?limit=50'), fetchAlerts('?limit=20')]);
      setMachines(machineData);
      setReadings(machineData);
      setAlerts(alertData);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    bootstrapDashboard();

    socket.on('machine:reading', (reading) => {
      setReadings((current) => [...current.slice(-99), reading]);
      setMachines((current) => {
        const existing = current.find((item) => item.machineId === reading.machineId);
        if (!existing) {
          return [...current, { ...reading, name: reading.machineId, location: 'Floor 1' }].sort((a, b) =>
            a.machineId.localeCompare(b.machineId)
          );
        }

        return current
          .map((item) => (item.machineId === reading.machineId ? { ...item, ...reading } : item))
          .sort((a, b) => a.machineId.localeCompare(b.machineId));
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

  const stats = useMemo(() => {
    const totalMachines = machines.length;
    const running = machines.filter((item) => item.status === 'running').length;
    const stopped = machines.filter((item) => item.status === 'stopped').length;
    const avgSpeed = totalMachines
      ? Math.round(machines.reduce((sum, item) => sum + (Number(item.speed) || 0), 0) / totalMachines)
      : 0;
    const criticalAlerts = alerts.filter((item) => item.type === 'critical' || item.type === 'error').length;
    const productionCount = readings.length;

    return { totalMachines, running, stopped, avgSpeed, criticalAlerts, productionCount };
  }, [machines, alerts, readings]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setErrorMessage('');
      const payload = {
        ...formState,
        assignedOperators: formState.assignedOperators
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      };

      if (editingId) {
        const updated = await editMachine(editingId, payload);
        setMachines((current) =>
          current.map((machine) => (machine.machineId === editingId ? updated : machine))
        );
        setEditingId('');
        setFormState(emptyForm);
        return;
      }

      const created = await addMachine(payload);
      setMachines((current) => [...current, created].sort((a, b) => a.machineId.localeCompare(b.machineId)));
      setFormState(emptyForm);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save machine details.');
    }
  }

  function handleEdit(machine) {
    setEditingId(machine.machineId);
    setFormState({
      machineId: machine.machineId,
      name: machine.name,
      location: machine.location,
      type: machine.type || 'loom',
      assignedOperators: (machine.assignedOperators || []).join(', '),
      status: machine.status,
      speed: machine.speed,
      thresholds: machine.thresholds || emptyForm.thresholds
    });
    setActiveView('machines');
  }

  function cancelEdit() {
    setEditingId('');
    setFormState(emptyForm);
  }

  async function handleDelete(machineId) {
    try {
      setErrorMessage('');
      await removeMachine(machineId);
      setMachines((current) => current.filter((machine) => machine.machineId !== machineId));
      if (editingId === machineId) {
        cancelEdit();
      }
    } catch (error) {
      setErrorMessage(error.message || 'Unable to remove machine.');
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    try {
      const data = await login(authForm);
      localStorage.setItem('loom_token', data.token);
      localStorage.setItem('loom_user', JSON.stringify(data.user));
      setSession({ token: data.token, user: data.user });
      setErrorMessage('');
      bootstrapDashboard();
    } catch (error) {
      setErrorMessage(error.message || 'Login failed.');
    }
  }

  function handleLogout() {
    localStorage.removeItem('loom_token');
    localStorage.removeItem('loom_user');
    setSession({ token: '', user: null });
  }

  async function handleAcknowledgeAlert(alertId) {
    try {
      const updated = await acknowledgeAlert(alertId);
      setAlerts((current) => current.map((item) => (item._id === alertId ? updated : item)));
    } catch (error) {
      setErrorMessage(error.message || 'Unable to acknowledge alert.');
    }
  }

  async function handleResolveAlert(alertId) {
    try {
      const updated = await resolveAlert(alertId);
      setAlerts((current) => current.map((item) => (item._id === alertId ? updated : item)));
    } catch (error) {
      setErrorMessage(error.message || 'Unable to resolve alert.');
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar card">
        <h2>LoomOps</h2>
        <p className="sidebar-copy">Automation monitoring</p>

        {session.user ? (
          <div className="auth-panel">
            <strong>{session.user.fullName}</strong>
            <small>{session.user.role}</small>
            <button type="button" className="secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
            />
            <button type="submit">Login</button>
          </form>
        )}

        <button type="button" className="secondary" onClick={() => setIsDarkMode((current) => !current)}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        <nav>
          <button
            type="button"
            className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`nav-link ${activeView === 'machines' ? 'active' : ''}`}
            onClick={() => setActiveView('machines')}
          >
            Machines
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'dashboard' ? (
              <DashboardPage
                machines={machines}
                alerts={alerts}
                readings={readings}
                stats={stats}
                isLoading={isLoading}
                errorMessage={errorMessage}
                currentUser={session.user}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResolveAlert={handleResolveAlert}
              />
            ) : (
              <MachinesPage
                machines={machines}
                formState={formState}
                editingId={editingId}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onChangeForm={setFormState}
                onSubmit={handleSubmit}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCancel={cancelEdit}
                canManage={session.user?.role === 'ADMIN'}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
