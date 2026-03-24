import { NavLink } from 'react-router-dom';
import { GaugeCircle, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-800 bg-slate-900 p-5">
          <h1 className="mb-8 text-2xl font-bold text-brand-500">LoomOps</h1>
          <nav className="space-y-2">
            <NavLink to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-800">
              <GaugeCircle className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/alerts" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-800">
              <AlertTriangle className="h-4 w-4" /> Alerts
            </NavLink>
          </nav>
          <div className="mt-8 rounded-lg bg-slate-800 p-3 text-sm">
            Logged in as <span className="font-semibold">{user?.name}</span>
          </div>
          <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
