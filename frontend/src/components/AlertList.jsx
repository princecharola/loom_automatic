export function AlertList({ alerts }) {
  return (
    <div className="card alert-card">
      <h3>Active & Recent Alerts</h3>
      <ul>
        {alerts.map((alert) => (
          <li key={alert._id || `${alert.machineId}-${alert.createdAt}`} className={`alert-item ${alert.type}`}>
            <div>
              <strong>{alert.machineId}</strong>
              <p>{alert.message}</p>
            </div>
            <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
