import React from 'react';

export function MachinesPage({
  machines,
  formState,
  editingId,
  setFormState,
  setEditingId,
  setFormReset,
  onSubmit,
  onEdit,
  onDelete
}) {
  return (
    <section className="card table-card">
      <h3>Latest Machine Status</h3>
      <form className="machine-form" onSubmit={onSubmit}>
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
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setEditingId('');
              setFormReset();
            }}
          >
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
                  <button type="button" className="secondary" onClick={() => onEdit(item)}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={() => onDelete(item.machineId)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
