import { motion } from 'framer-motion';

export function MachineCard({ machine, onEdit, onDelete }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{machine.name}</h3>
        <span className={`text-xs px-2 py-1 rounded ${machine.status === 'on' ? 'bg-emerald-600' : 'bg-slate-600'}`}>
          {machine.status.toUpperCase()}
        </span>
      </div>
      <p>Speed: {machine.speed} RPM</p>
      <p>Temp: {machine.temperature} °C</p>
      <div className="flex gap-2 pt-2">
        <button className="px-3 py-1 text-sm rounded bg-indigo-600" onClick={() => onEdit(machine)}>
          Edit
        </button>
        <button className="px-3 py-1 text-sm rounded bg-rose-600" onClick={() => onDelete(machine._id)}>
          Delete
        </button>
      </div>
    </motion.div>
  );
}
