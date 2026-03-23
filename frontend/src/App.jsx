import { useEffect, useMemo, useState } from 'react';
import { fetchAlerts, fetchSummary } from './services/api';
import { socket } from './services/socket';
import { StatCard } from './components/StatCard';
import { SpeedChart } from './components/SpeedChart';
import { AlertList } from './components/AlertList';

export default function App() {
  const [summary, setSummary] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    async function bootstrap() {
      const [summaryData, alertData] = await Promise.all([fetchSummary(), fetchAlerts()]);
      setSummary(summaryData);
      setReadings(summaryData);
      setAlerts(alertData);
    }

    bootstrap();

    socket.on('machine:reading', (reading) => {
      setReadings((current) => [...current.slice(-49), reading]);
      setSummary((current) => {
        const filtered = current.filter((item) => item.machineId !== reading.machineId);
        return [...filtered, reading].sort((a, b) => a.machineId.localeCompare(b.machineId));
      });
    });

    socket.on('machine:alert', (alert) => {
      setAlerts((current) => [alert, ...current].slice(0, 20));
    });

    return () => {
      socket.off('machine:reading');
      socket.off('machine:alert');
    };
  }, []);

  const stats = useMemo(() => {
    const totalMachines = summary.length;
    const running = summary.filter((item) => item.status === 'running').length;
    const stopped = summary.filter((item) => item.status === 'stopped').length;
    const avgSpeed = totalMachines
      ? Math.round(summary.reduce((sum, item) => sum + item.speed, 0) / totalMachines)
      : 0;

    return { totalMachines, running, stopped, avgSpeed };
  }, [summary]);

  return (
    <div className="dashboard">
      <header>
        <h1>Loom Machine Monitoring Dashboard</h1>
        <p>Real-time view of machine speed, status, and alerts.</p>
      </header>

      <section className="stats-grid">
        <StatCard title="Machines" value={stats.totalMachines} accent="#0f172a" />
        <StatCard title="Running" value={stats.running} accent="#16a34a" />
        <StatCard title="Stopped" value={stats.stopped} accent="#dc2626" />
        <StatCard title="Avg Speed" value={`${stats.avgSpeed} RPM`} accent="#4f46e5" />
      </section>

      <section className="content-grid">
        <SpeedChart readings={readings} />
        <AlertList alerts={alerts} />
      </section>

      <section className="card table-card">
        <h3>Latest Machine Status</h3>
        <table>
          <thead>
            <tr>
              <th>Machine</th>
              <th>Speed</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item) => (
              <tr key={item.machineId}>
                <td>{item.machineId}</td>
                <td>{item.speed}</td>
                <td>
                  <span className={`badge ${item.status}`}>{item.status}</span>
                </td>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
