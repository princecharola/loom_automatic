import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import api from '../services/api';
import { socket } from '../services/socket';
import { MachineCard } from '../components/MachineCard';
import { MachineFormModal } from '../components/MachineFormModal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { AlertToast } from '../components/AlertToast';

export function DashboardPage() {
  const [machines, setMachines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/machines'), api.get('/alerts')])
      .then(([machinesRes, alertsRes]) => {
        setMachines(machinesRes.data);
        setAlerts(alertsRes.data);
      })
      .finally(() => setLoading(false));

    socket.connect();
    socket.emit('join:dashboard');

    socket.on('machine:created', (machine) => setMachines((prev) => [machine, ...prev]));
    socket.on('machine:updated', (machine) => setMachines((prev) => prev.map((m) => (m._id === machine._id ? machine : m))));
    socket.on('machine:deleted', ({ id }) => setMachines((prev) => prev.filter((m) => m._id !== id)));
    socket.on('alert:created', (alert) => setAlerts((prev) => [alert, ...prev].slice(0, 50)));

    return () => {
      socket.off('machine:created');
      socket.off('machine:updated');
      socket.off('machine:deleted');
      socket.off('alert:created');
      socket.disconnect();
    };
  }, []);

  const stats = useMemo(() => {
    const total = machines.length;
    const on = machines.filter((m) => m.status === 'ON').length;
    const off = machines.filter((m) => m.status === 'OFF').length;
    const avgTemp = total ? Math.round(machines.reduce((sum, m) => sum + m.temperature, 0) / total) : 0;
    return { total, on, off, avgTemp };
  }, [machines]);

  async function handleSave(data) {
    if (editingMachine?._id) {
      const res = await api.put(`/machines/${editingMachine._id}`, data);
      setMachines((prev) => prev.map((m) => (m._id === editingMachine._id ? res.data.machine : m)));
    } else {
      const res = await api.post('/machines', data);
      setMachines((prev) => [res.data.machine, ...prev]);
    }
    setEditingMachine(null);
    setModalOpen(false);
  }

  async function handleDelete(id) {
    await api.delete(`/machines/${id}`);
    setMachines((prev) => prev.filter((m) => m._id !== id));
  }

  return (
    <div className="space-y-6">
      <AlertToast alerts={alerts} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-4">
        <Stat title="Total Machines" value={stats.total} />
        <Stat title="Running" value={stats.on} color="text-emerald-400" />
        <Stat title="Stopped" value={stats.off} color="text-amber-400" />
        <Stat title="Avg Temp" value={`${stats.avgTemp}°C`} color="text-rose-400" />
      </motion.div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Machine Dashboard</h2>
        <button
          onClick={() => {
            setEditingMachine(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="mr-2 inline h-4 w-4" /> Add Machine
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {machines.map((machine) => (
            <MachineCard
              key={machine._id}
              machine={machine}
              onEdit={(machineData) => {
                setEditingMachine(machineData);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <MachineFormModal open={modalOpen} initialData={editingMachine} onClose={() => setModalOpen(false)} onSubmit={handleSave} />
    </div>
  );
}

function Stat({ title, value, color = 'text-white' }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
