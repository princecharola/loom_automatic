import React from 'react';
import { NavLink } from 'react-router-dom';

export function TopNav() {
  return (
    <nav className="top-nav card">
      <h2>Loom Automation</h2>
      <div className="top-nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/machines" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Machines
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Alerts
        </NavLink>
      </div>
    </nav>
  );
}
