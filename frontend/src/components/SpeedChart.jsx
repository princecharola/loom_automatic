import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export function SpeedChart({ readings }) {
  const chartData = readings.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    speed: item.speed,
    machineId: item.machineId
  }));

  return (
    <div className="card chart-card">
      <h3>Speed Trend</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData.slice(-20)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="speed" stroke="#4f46e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
