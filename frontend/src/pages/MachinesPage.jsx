import React from 'react';

const emptyForm = {
  machineId: '',
  name: '',
  location: '',
  status: 'stopped',
  speed: 0
};

export function MachinesPage({
  machines,
  formState,
  editingId,
  isLoading,
  errorMessage,
  onChangeForm,
  onSubmit,
  onEdit,
  onDelete,
  onCancel,
  canManageMachines
}) {
  return (
    <section className="dashboard">
      <header>
        <h1>Machine Directory</h1>
        <p>Create, update, and monitor machine operational details.</p>
      </header>

      {errorMessage ? <div className="card status-card error">{errorMessage}</div> : null}
      {!canManageMachines ? (
        <div className="card status-card">Read-only mode: your role can view machines but cannot modify them.</div>
      ) : null}

      <section className="card table-card">
        <h3>Latest Machine Status</h3>
        {canManageMachines ? (
          <form className="machine-form" onSubmit={onSubmit}>
            <input
              required
              value={formState.machineId}
              onChange={(event) => onChangeForm((current) => ({ ...current, machineId: event.target.value }))}
              placeholder="Machine ID"
              disabled={Boolean(editingId)}
            />
            <input
              required
              value={formState.name}
              onChange={(event) => onChangeForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Name"
            />
            <input
              value={formState.location}
              onChange={(event) => onChangeForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Location"
            />
            <select
              value={formState.status}
              onChange={(event) => onChangeForm((current) => ({ ...current, status: event.target.value }))}
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
                onChangeForm((current) => ({ ...current, speed: Number(event.target.value) || 0 }))
              }
              placeholder="Speed"
            />
            <button type="submit">{editingId ? 'Update Machine' : 'Add Machine'}</button>
            {editingId ? (
              <button type="button" className="secondary" onClick={onCancel}>
                Cancel
              </button>
            ) : null}
          </form>
        ) : null}

        <table>
          <thead>
            <tr>
              <th>Machine</th>
              <th>Name</th>
              <th>Location</th>
              <th>Speed</th>
              <th>Status</th>
              <th>Updated</th>
              {canManageMachines ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {!isLoading && machines.length === 0 ? (
              <tr>
                <td colSpan={canManageMachines ? 7 : 6} className="empty-row">
                  No machines found. Add a machine to start tracking.
                </td>
              </tr>
            ) : null}
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
                {canManageMachines ? (
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
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>

        {canManageMachines && !editingId && machines.length === 0 && !isLoading ? (
          <button
            type="button"
            className="secondary seed-btn"
            onClick={() => onChangeForm(emptyForm)}
          >
            Reset Form
          </button>
        ) : null}
      </section>
    </section>
  );
}
