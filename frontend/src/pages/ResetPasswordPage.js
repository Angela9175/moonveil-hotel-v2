import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [token, setToken] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    if (password !== confirm) return setMsg('Passwords do not match');
    if (password.length < 6) return setMsg('Password must be at least 6 characters');
    setBusy(true);
    try {
      const r = await api.reset(token, password);
      setMsg(r.message + ' Redirecting to login…');
      setTimeout(() => nav('/login'), 1500);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h2>Reset Password</h2>
        {msg && <div className="info">{msg}</div>}

        <label>Reset token
          <input
            className="input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </label>

        <label>New password
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label>Confirm password
          <input
            className="input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>

        <button className="btn btn-gold btn-lg" disabled={busy}>
          {busy ? 'Resetting…' : 'Reset password'}
        </button>

        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}