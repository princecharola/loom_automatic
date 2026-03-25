import React from 'react';
import { AlertList } from '../components/AlertList';

export function AlertsPage({ alerts }) {
  return (
    <section className="content-grid single-column">
      <AlertList alerts={alerts} />
    </section>
  );
}
