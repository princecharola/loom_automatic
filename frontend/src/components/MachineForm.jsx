import { useState } from 'react';

const initial = { name: '', status: 'on', speed: 80, temperature: 65 };

export function MachineForm({ onSubmit, selected, onCancel }) {
  const [form, setForm] = useState(selected || initial);

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
    if (!selected) setForm(initial);
  };

  return (
    <form onSubmit={submit} className="grid md:grid-cols-5 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
      <input
        className="bg-slate-800 rounded px-3 py-2"
        placeholder="Machine name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <select
        className="bg-slate-800 rounded px-3 py-2"
        value={form.status}
        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
      >
        <option value="on">ON</option>
        <option value="off">OFF</option>
      </select>
      <input
        type="number"
        className="bg-slate-800 rounded px-3 py-2"
        value={form.speed}
        onChange={(e) => setForm((f) => ({ ...f, speed: Number(e.target.value) }))}
      />
      <input
        type="number"
        className="bg-slate-800 rounded px-3 py-2"
        value={form.temperature}
        onChange={(e) => setForm((f) => ({ ...f, temperature: Number(e.target.value) }))}
      />
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded bg-emerald-600 w-full" type="submit">
          {selected ? 'Update' : 'Add'}
        </button>
        {selected && (
          <button className="px-3 py-2 rounded bg-slate-700" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
