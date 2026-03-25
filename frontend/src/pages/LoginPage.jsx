import React, { useState } from 'react';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'operator', label: 'Operator' },
  { value: 'viewer', label: 'Viewer' }
];

export function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('viewer');

  function handleSubmit(event) {
    event.preventDefault();
    onLogin({
      name: username.trim() || 'Guest User',
      role
    });
  }

  return (
    <div className="login-shell">
      <section className="card login-card">
        <h1>Welcome to LoomOps</h1>
        <p>Sign in to access the monitoring dashboard.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
            />
          </label>

          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit">Continue</button>
        </form>
      </section>
    </div>
  );
}
