import { motion } from 'framer-motion';
import { Pencil, Power, Trash2, Thermometer } from 'lucide-react';

export function MachineCard({ machine, onEdit, onDelete }) {
  const statusClass =
    machine.status === 'ON' ? 'bg-emerald-500/20 text-emerald-300' : machine.status === 'OFF' ? 'bg-slate-600/30 text-slate-200' : 'bg-red-500/20 text-red-300';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{machine.name}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{machine.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
        <div className="rounded-xl bg-slate-800 p-3">
          <p className="mb-2 text-xs uppercase text-slate-400">Speed</p>
          <p className="text-xl font-bold">{machine.speed}</p>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <p className="mb-2 text-xs uppercase text-slate-400">Temperature</p>
          <p className="flex items-center gap-1 text-xl font-bold">
            <Thermometer className="h-4 w-4" />
            {machine.temperature}°C
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => onEdit(machine)} className="rounded-lg border border-brand-500 px-3 py-2 text-xs text-brand-500 hover:bg-brand-500/10">
          <Pencil className="mr-1 inline h-3 w-3" /> Edit
        </button>
        <button onClick={() => onDelete(machine._id)} className="rounded-lg border border-red-400 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10">
          <Trash2 className="mr-1 inline h-3 w-3" /> Delete
        </button>
        <div className="ml-auto rounded-lg bg-slate-700 px-3 py-2 text-xs text-slate-200">
          <Power className="mr-1 inline h-3 w-3" /> {new Date(machine.lastUpdated).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}
