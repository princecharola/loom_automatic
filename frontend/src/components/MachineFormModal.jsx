import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const defaults = { name: '', status: 'OFF', speed: 0, temperature: 25 };

export function MachineFormModal({ open, initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(defaults);

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm(defaults);
  }, [initialData, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.form
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(form);
            }}
          >
            <h3 className="mb-4 text-xl font-semibold text-white">{initialData?._id ? 'Edit Machine' : 'Add Machine'}</h3>
            <div className="grid gap-3">
              <input className="rounded-lg bg-slate-800 px-4 py-2 text-white" placeholder="Machine name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
              <select className="rounded-lg bg-slate-800 px-4 py-2 text-white" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                <option value="ON">ON</option>
                <option value="OFF">OFF</option>
                <option value="ERROR">ERROR</option>
              </select>
              <input className="rounded-lg bg-slate-800 px-4 py-2 text-white" type="number" min="0" placeholder="Speed" value={form.speed} onChange={(e) => setForm((s) => ({ ...s, speed: Number(e.target.value) }))} />
              <input className="rounded-lg bg-slate-800 px-4 py-2 text-white" type="number" min="0" placeholder="Temperature" value={form.temperature} onChange={(e) => setForm((s) => ({ ...s, temperature: Number(e.target.value) }))} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="rounded-lg border border-slate-500 px-4 py-2 text-slate-200">Cancel</button>
              <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-700">Save</button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
