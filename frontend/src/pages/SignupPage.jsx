import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 p-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          try {
            await signup(form.name, form.email, form.password);
            navigate('/');
          } catch {
            setError('Signup failed');
          }
        }}
      >
        <h2 className="mb-5 text-2xl font-bold text-white">Create Account</h2>
        {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}
        <div className="space-y-3">
          <input className="w-full rounded-lg bg-slate-800 px-4 py-2 text-white" placeholder="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
          <input className="w-full rounded-lg bg-slate-800 px-4 py-2 text-white" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
          <input className="w-full rounded-lg bg-slate-800 px-4 py-2 text-white" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} required />
          <button className="w-full rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white">Signup</button>
        </div>
        <p className="mt-4 text-sm text-slate-400">Already have account? <Link to="/login" className="text-brand-500">Login</Link></p>
      </motion.form>
    </div>
  );
}
