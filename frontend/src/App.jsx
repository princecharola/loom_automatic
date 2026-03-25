import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  addMachine,
  editMachine,
  fetchAlerts,
  fetchMachines,
  removeMachine
} from './services/api';
import { socket } from './services/socket';
import { DashboardPage } from './pages/DashboardPage';
import { MachinesPage } from './pages/MachinesPage';

const emptyForm = {
  machineId: '',
  name: '',
  location: '',
  status: 'stopped',
  speed: 0
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

  useEffect(() => {
    async function bootstrap() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [machineData, alertData] = await Promise.all([fetchMachines(), fetchAlerts()]);
        setMachines(machineData);
        setReadings(machineData);
        setAlerts(alertData);
      } catch (error) {
        setErrorMessage(error.message || 'Unable to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();

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
      if (editingId) {
        const updated = await editMachine(editingId, formState);
        setMachines((current) =>
          current.map((machine) => (machine.machineId === editingId ? updated : machine))
        );
        setEditingId('');
        setFormState(emptyForm);
        return;
      }

      const created = await addMachine(formState);
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
      status: machine.status,
      speed: machine.speed
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

  return (
    <div className="app-shell">
      <aside className="sidebar card">
        <h2>LoomOps</h2>
        <p className="sidebar-copy">Automation monitoring</p>
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
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
