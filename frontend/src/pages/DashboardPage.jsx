import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertPanel } from '../components/AlertPanel.jsx';
import { MachineCard } from '../components/MachineCard.jsx';
import { MachineForm } from '../components/MachineForm.jsx';
import { createMachine, deleteMachine, fetchAlerts, fetchDashboard, updateMachine } from '../services/api.js';
import { createSocket } from '../services/socket.js';
import { useAuth } from '../context/AuthContext.jsx';

export function DashboardPage() {
  const [machines, setMachines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selected, setSelected] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    async function load() {
      const [dashboard, alertList] = await Promise.all([fetchDashboard(), fetchAlerts()]);
      setMachines(dashboard.machines);
      setAlerts(alertList);
    }

    load();

    const socket = createSocket(token);
    socket.on('machine:update', (machine) => {
      setMachines((current) => {
        const rest = current.filter((m) => m._id !== machine._id);
        return [machine, ...rest];
      });
    });
    socket.on('machine:delete', ({ id }) => setMachines((current) => current.filter((m) => m._id !== id)));
    socket.on('alert:new', (alert) => setAlerts((current) => [alert, ...current].slice(0, 20)));

    return () => socket.disconnect();
  }, [token]);

  const totals = useMemo(() => {
    const on = machines.filter((m) => m.status === 'on').length;
    const avgTemp = machines.length
      ? Math.round((machines.reduce((sum, m) => sum + m.temperature, 0) / machines.length) * 10) / 10
      : 0;
    return { total: machines.length, on, off: machines.length - on, avgTemp };
  }, [machines]);

  const handleSubmit = async (payload) => {
    if (selected) {
      await updateMachine(selected._id, payload);
      setSelected(null);
      return;
    }
    await createMachine(payload);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[['Machines', totals.total], ['ON', totals.on], ['OFF', totals.off], ['Avg Temp', `${totals.avgTemp}°C`]].map(([k, v]) => (
          <div key={k} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm">{k}</p>
            <p className="text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </motion.div>

      <MachineForm selected={selected} onSubmit={handleSubmit} onCancel={() => setSelected(null)} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
          {machines.map((machine) => (
            <MachineCard
              key={machine._id}
              machine={machine}
              onEdit={setSelected}
              onDelete={deleteMachine}
            />
          ))}
        </div>
        <AlertPanel alerts={alerts} />
      </div>
    </div>
  );
}
