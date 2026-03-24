import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login: storeSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const session = await signup(form);
      storeSession(session);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <input className="w-full bg-slate-800 rounded p-2" placeholder="Name" value={form.name} onChange={(e)=>setForm((f)=>({...f,name:e.target.value}))} />
        <input className="w-full bg-slate-800 rounded p-2" placeholder="Email" value={form.email} onChange={(e)=>setForm((f)=>({...f,email:e.target.value}))} />
        <input type="password" className="w-full bg-slate-800 rounded p-2" placeholder="Password" value={form.password} onChange={(e)=>setForm((f)=>({...f,password:e.target.value}))} />
        {error && <p className="text-rose-400 text-sm">{error}</p>}
        <button className="w-full bg-indigo-600 rounded p-2">Create Account</button>
        <p className="text-sm text-slate-300">Already have account? <Link className="text-indigo-400" to="/login">Login</Link></p>
      </form>
    </div>
  );
}
