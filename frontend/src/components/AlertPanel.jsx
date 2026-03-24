import { AnimatePresence, motion } from 'framer-motion';

export function AlertPanel({ alerts }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">Recent Alerts</h3>
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-lg p-3 border ${alert.type === 'critical' ? 'bg-rose-900/40 border-rose-600' : 'bg-amber-900/30 border-amber-600'}`}
          >
            <p className="font-semibold">{alert.type.toUpperCase()}</p>
            <p className="text-sm">{alert.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
