import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      const r = await api.forgot(email);
      setMsg(r.message);
      if (r.resetToken) setToken(r.resetToken);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h2>Forgot Password</h2>

        {msg && <div className="info">{msg}</div>}

        <label>Email
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <button className="btn btn-gold btn-lg" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset link'}
        </button>

        {token && (
          <div className="info small" style={{ marginTop: 16 }}>
            <p><strong>Dev token (copy this):</strong></p>
            <code style={{ wordBreak: 'break-all', display: 'block' }}>{token}</code>
            <p style={{ marginTop: 10 }}>
              <Link to={`/reset-password?token=${token}`}>Continue to reset →</Link>
            </p>
          </div>
        )}

        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}