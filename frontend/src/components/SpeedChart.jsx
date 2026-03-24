import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      className="card chart-card"
      whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    >
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
    </motion.div>
  );
}
