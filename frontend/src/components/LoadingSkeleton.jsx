import { motion } from 'framer-motion';

export function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <motion.div
          key={idx}
          className="h-40 rounded-2xl bg-slate-800/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.1 }}
        />
      ))}
    </div>
  );
}
