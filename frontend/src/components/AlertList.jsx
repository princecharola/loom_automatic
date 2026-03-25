import React from 'react';
import { motion } from 'framer-motion';

export function AlertList({ alerts, canManage = false, onAcknowledgeAlert, onResolveAlert }) {
  return (
    <motion.div
      className="card alert-card"
      whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    >
      <h3>Active & Recent Alerts</h3>
      {alerts.length === 0 ? <p className="empty-row">No active alerts.</p> : null}
      <ul>
        {alerts.map((alert) => (
          <li key={alert._id || `${alert.machineId}-${alert.createdAt}`} className={`alert-item ${alert.type}`}>
            <div>
              <strong>{alert.machineId}</strong>
              <p>{alert.message}</p>
            </div>
            <div className="alert-meta">
              <span className={`status-pill ${alert.type}`}>{alert.type}</span>
              <span className="alert-status">{alert.status || 'open'}</span>
              <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
              {canManage && alert._id ? (
                <div className="alert-actions">
                  <button type="button" className="secondary" onClick={() => onAcknowledgeAlert(alert._id)}>
                    Ack
                  </button>
                  <button type="button" onClick={() => onResolveAlert(alert._id)}>
                    Resolve
                  </button>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
