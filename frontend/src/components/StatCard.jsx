import React from 'react';
import { motion } from 'framer-motion';

export function StatCard({ title, value, accent }) {
  return (
    <motion.div
      className="card stat-card"
      whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    >
      <span className="label">{title}</span>
      <strong className="value" style={{ color: accent }}>{value}</strong>
    </motion.div>
  );
}
