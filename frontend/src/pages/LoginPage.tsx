import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onLogin, onSwitchToRegister }: { onLogin: () => void; onSwitchToRegister: () => void }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      onLogin();
    } catch {
      setError('Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">📝</div>
        <h1>Nota</h1>
        <p className="login-subtitle">Aplikasi Catatan Pribadi</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
        <p className="login-switch">
          Belum punya akun?{' '}
          <button className="link-btn" onClick={onSwitchToRegister}>Daftar</button>
        </p>
      </div>
    </div>
  );
}
