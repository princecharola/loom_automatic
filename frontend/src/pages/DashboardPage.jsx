import React from 'react';
import { StatCard } from '../components/StatCard';
import { SpeedChart } from '../components/SpeedChart';
import { AlertList } from '../components/AlertList';

export function DashboardPage({ machines, alerts, readings }) {
  const totalMachines = machines.length;
  const activeMachines = machines.filter((item) => item.status === 'running').length;
  const avgSpeed = totalMachines
    ? Math.round(machines.reduce((sum, item) => sum + (Number(item.speed) || 0), 0) / totalMachines)
    : 0;
  const productionCount = machines.reduce((sum, item) => sum + Math.max(0, Number(item.speed) || 0), 0) * 3;

  return (
    <>
      <section className="stats-grid">
        <StatCard title="Machine Status" value={`${activeMachines}/${totalMachines} Active`} accent="#16a34a" />
        <StatCard title="Speed (RPM)" value={avgSpeed} accent="#4f46e5" />
        <StatCard title="Alerts" value={alerts.length} accent="#dc2626" />
        <StatCard title="Production Count" value={productionCount} accent="#0369a1" />
      </section>

      <section className="content-grid">
        <SpeedChart readings={readings} />
        <AlertList alerts={alerts} />
      </section>
    </>
  );
}
