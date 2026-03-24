import { AnimatePresence, motion } from 'framer-motion';

export function AlertToast({ alerts }) {
  return (
    <div className="fixed right-4 top-4 z-50 w-80 space-y-3">
      <AnimatePresence>
        {alerts.slice(0, 3).map((alert) => (
          <motion.div
            key={alert._id}
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24 }}
            className={`rounded-xl border px-4 py-3 text-sm text-white shadow-lg ${
              alert.level === 'critical' ? 'border-red-500 bg-red-600/90' : 'border-amber-400 bg-amber-500/90'
            }`}
          >
            <p className="font-semibold">{alert.machineName}</p>
            <p>{alert.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
