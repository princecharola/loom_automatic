import React from 'react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import {
  addMachine,
  editMachine,
  fetchAlerts,
  fetchMachines,
  removeMachine
} from './services/api';
import { socket } from './services/socket';
import { TopNav } from './components/TopNav';
import { DashboardPage } from './pages/DashboardPage';
import { MachinesPage } from './pages/MachinesPage';
import { AlertsPage } from './pages/AlertsPage';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true);
        setError('');
        const [machineData, alertData] = await Promise.all([fetchMachines(), fetchAlerts()]);
        setMachines(machineData);
        setReadings(machineData);
        setAlerts(alertData);
      } catch (loadError) {
        setError(loadError.message || 'Unable to fetch dashboard data from backend.');
      } finally {
        setLoading(false);
      }
    }

    bootstrap();

    socket.on('machine:reading', (reading) => {
      setReadings((current) => [...current.slice(-49), reading]);
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

  async function handleSubmit(event) {
    event.preventDefault();

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
  }

  async function handleDelete(machineId) {
    await removeMachine(machineId);
    setMachines((current) => current.filter((machine) => machine.machineId !== machineId));
    if (editingId === machineId) {
      setEditingId('');
      setFormState(emptyForm);
    }
  }

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <motion.div
          className="dashboard"
          key="dashboard"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <TopNav />

          {loading ? <p className="app-state">Loading dashboard data...</p> : null}
          {error ? <p className="app-state error">{error}</p> : null}

          {!loading && !error ? (
            <Routes>
              <Route path="/" element={<DashboardPage machines={machines} alerts={alerts} readings={readings} />} />
              <Route
                path="/machines"
                element={(
                  <MachinesPage
                    machines={machines}
                    formState={formState}
                    editingId={editingId}
                    setFormState={setFormState}
                    setEditingId={setEditingId}
                    setFormReset={() => setFormState(emptyForm)}
                    onSubmit={handleSubmit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              />
              <Route path="/alerts" element={<AlertsPage alerts={alerts} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </BrowserRouter>
  );
}
