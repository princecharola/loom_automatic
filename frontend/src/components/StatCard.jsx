export function StatCard({ title, value, accent }) {
  return (
    <div className="card stat-card">
      <span className="label">{title}</span>
      <strong className="value" style={{ color: accent }}>{value}</strong>
    </div>
  );
}
