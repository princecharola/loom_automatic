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
import { StatCard } from './components/StatCard';
import { SpeedChart } from './components/SpeedChart';
import { AlertList } from './components/AlertList';

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

  useEffect(() => {
    async function bootstrap() {
      const [machineData, alertData] = await Promise.all([fetchMachines(), fetchAlerts()]);
      setMachines(machineData);
      setReadings(machineData);
      setAlerts(alertData);
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

  const stats = useMemo(() => {
    const totalMachines = machines.length;
    const running = machines.filter((item) => item.status === 'running').length;
    const stopped = machines.filter((item) => item.status === 'stopped').length;
    const avgSpeed = totalMachines
      ? Math.round(machines.reduce((sum, item) => sum + (Number(item.speed) || 0), 0) / totalMachines)
      : 0;

    return { totalMachines, running, stopped, avgSpeed };
  }, [machines]);

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
    <AnimatePresence mode="wait">
      <motion.div
        className="dashboard"
        key="dashboard"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <header>
          <h1>Loom Machine Monitoring Dashboard</h1>
          <p>Real-time view of machine speed, status, and alerts.</p>
        </header>

        <section className="stats-grid">
          <StatCard title="Machines" value={stats.totalMachines} accent="#0f172a" />
          <StatCard title="Running" value={stats.running} accent="#16a34a" />
          <StatCard title="Stopped" value={stats.stopped} accent="#dc2626" />
          <StatCard title="Avg Speed" value={`${stats.avgSpeed} RPM`} accent="#4f46e5" />
        </section>

        <section className="content-grid">
          <SpeedChart readings={readings} />
          <AlertList alerts={alerts} />
        </section>

        <section className="card table-card">
          <h3>Latest Machine Status</h3>
          <form className="machine-form" onSubmit={handleSubmit}>
            <input
              required
              value={formState.machineId}
              onChange={(event) => setFormState((current) => ({ ...current, machineId: event.target.value }))}
              placeholder="Machine ID"
              disabled={Boolean(editingId)}
            />
            <input
              required
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder="Name"
            />
            <input
              value={formState.location}
              onChange={(event) => setFormState((current) => ({ ...current, location: event.target.value }))}
              placeholder="Location"
            />
            <select
              value={formState.status}
              onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="running">running</option>
              <option value="stopped">stopped</option>
              <option value="error">error</option>
            </select>
            <input
              type="number"
              min="0"
              value={formState.speed}
              onChange={(event) =>
                setFormState((current) => ({ ...current, speed: Number(event.target.value) || 0 }))
              }
              placeholder="Speed"
            />
            <button type="submit">{editingId ? 'Update Machine' : 'Add Machine'}</button>
            {editingId ? (
              <button type="button" className="secondary" onClick={() => {
                setEditingId('');
                setFormState(emptyForm);
              }}>
                Cancel
              </button>
            ) : null}
          </form>
          <table>
            <thead>
              <tr>
                <th>Machine</th>
                <th>Name</th>
                <th>Location</th>
                <th>Speed</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((item) => (
                <tr key={item.machineId}>
                  <td>{item.machineId}</td>
                  <td>{item.name}</td>
                  <td>{item.location}</td>
                  <td>{item.speed}</td>
                  <td>
                    <span className={`badge ${item.status}`}>{item.status}</span>
                  </td>
                  <td>{new Date(item.timestamp).toLocaleString()}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="secondary" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="danger" onClick={() => handleDelete(item.machineId)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </motion.div>
    </AnimatePresence>
  );
}
