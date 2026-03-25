import React, { useMemo, useState } from 'react';

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
  canManage = false
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredMachines = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return machines;
    }

    return machines.filter((machine) =>
      [machine.machineId, machine.name, machine.location].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(q)
      )
    );
  }, [machines, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMachines.slice(start, start + pageSize);
  }, [filteredMachines, page]);

  const totalPages = Math.max(1, Math.ceil(filteredMachines.length / pageSize));

  return (
    <section className="dashboard">
      <header>
        <h1>Machine Directory</h1>
        <p>Create, update, and monitor machine operational details.</p>
      </header>

      {errorMessage ? <div className="card status-card error">{errorMessage}</div> : null}

      <section className="card table-card">
        <h3>Latest Machine Status</h3>

        <div className="toolbar-row">
          <input
            placeholder="Search machine, name, location"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {canManage ? (
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
            <input
              value={formState.type}
              onChange={(event) => onChangeForm((current) => ({ ...current, type: event.target.value }))}
              placeholder="Type"
            />
            <input
              value={formState.assignedOperators}
              onChange={(event) =>
                onChangeForm((current) => ({ ...current, assignedOperators: event.target.value }))
              }
              placeholder="Operators (comma separated)"
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
        ) : (
          <p className="empty-row">Read-only view. Log in as ADMIN to manage machines.</p>
        )}

        <table>
          <thead>
            <tr>
              <th>Machine</th>
              <th>Name</th>
              <th>Location</th>
              <th>Type</th>
              <th>Speed</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-row">
                  No machines found. Adjust search/filter criteria.
                </td>
              </tr>
            ) : null}
            {paginated.map((item) => (
              <tr key={item.machineId}>
                <td>{item.machineId}</td>
                <td>{item.name}</td>
                <td>{item.location}</td>
                <td>{item.type || 'loom'}</td>
                <td>{item.speed}</td>
                <td>
                  <span className={`badge ${item.status}`}>{item.status}</span>
                </td>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
                <td>
                  {canManage ? (
                    <div className="table-actions">
                      <button type="button" className="secondary" onClick={() => onEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="danger" onClick={() => onDelete(item.machineId)}>
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span className="empty-row">No access</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-row">
          <button type="button" className="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="secondary"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      </section>
    </section>
  );
}
