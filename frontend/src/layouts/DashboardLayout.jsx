import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      <aside className="lg:w-64 border-r border-slate-800 p-6 space-y-6">
        <h1 className="text-xl font-bold">Loom Automation</h1>
        <nav className="space-y-2">
          <NavLink className="block rounded px-3 py-2 bg-slate-900" to="/dashboard">
            Dashboard
          </NavLink>
        </nav>
        <div className="text-sm text-slate-400">Signed in as {user?.name}</div>
        <button onClick={logout} className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-500">
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
