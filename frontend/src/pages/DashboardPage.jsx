import React from 'react';
import { StatCard } from '../components/StatCard';
import { SpeedChart } from '../components/SpeedChart';
import { AlertList } from '../components/AlertList';

export function DashboardPage({
  machines,
  alerts,
  readings,
  stats,
  isLoading,
  errorMessage,
  alertFilterType,
  alertFilterMachine,
  onFilterTypeChange,
  onFilterMachineChange
}) {
  if (isLoading) {
    return <div className="card status-card">Loading live loom data...</div>;
  }

  return (
    <section className="dashboard">
      <header>
        <h1>Loom Machine Monitoring Dashboard</h1>
        <p>Real-time view of machine status, speed, alerts, and production throughput.</p>
      </header>

      {errorMessage ? <div className="card status-card error">{errorMessage}</div> : null}

      <section className="stats-grid">
        <StatCard title="Machine Status" value={`${stats.running}/${stats.totalMachines} Running`} accent="#16a34a" />
        <StatCard title="Avg Speed" value={`${stats.avgSpeed} RPM`} accent="#4f46e5" />
        <StatCard title="Alerts" value={stats.criticalAlerts} accent="#dc2626" />
        <StatCard title="Production Count" value={stats.productionCount} accent="#0f172a" />
      </section>

      <section className="card alert-filters">
        <h3>Alert Filters</h3>
        <div className="filter-controls">
          <select value={alertFilterType} onChange={(event) => onFilterTypeChange(event.target.value)}>
            <option value="all">All severities</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
          </select>
          <input
            type="text"
            value={alertFilterMachine}
            onChange={(event) => onFilterMachineChange(event.target.value)}
            placeholder="Filter by machine ID"
          />
        </div>
      </section>

      <section className="content-grid">
        <SpeedChart readings={readings} />
        <AlertList alerts={alerts} />
      </section>

      <section className="card status-summary">
        <h3>Current Machine Breakdown</h3>
        <p>
          Running: <strong>{stats.running}</strong> • Stopped: <strong>{stats.stopped}</strong> • Total tracked:{' '}
          <strong>{machines.length}</strong>
        </p>
      </section>
    </section>
  );
}
