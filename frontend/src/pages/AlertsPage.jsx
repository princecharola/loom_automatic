import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

export function AlertsPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get('/alerts').then((res) => setAlerts(res.data));
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Alerts</h2>
      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <motion.div
            key={alert._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`rounded-xl border p-4 ${
              alert.level === 'critical' ? 'border-red-500 bg-red-500/10' : 'border-amber-400 bg-amber-500/10'
            }`}
          >
            <p className="font-semibold">{alert.machineName}</p>
            <p className="text-sm text-slate-200">{alert.message}</p>
            <p className="mt-1 text-xs text-slate-400">{new Date(alert.createdAt).toLocaleString()}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
