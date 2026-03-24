import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login: storeSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const session = await login(form);
      storeSession(session);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <input className="w-full bg-slate-800 rounded p-2" placeholder="Email" value={form.email} onChange={(e)=>setForm((f)=>({...f,email:e.target.value}))} />
        <input type="password" className="w-full bg-slate-800 rounded p-2" placeholder="Password" value={form.password} onChange={(e)=>setForm((f)=>({...f,password:e.target.value}))} />
        {error && <p className="text-rose-400 text-sm">{error}</p>}
        <button className="w-full bg-indigo-600 rounded p-2">Login</button>
        <p className="text-sm text-slate-300">No account? <Link className="text-indigo-400" to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
}
