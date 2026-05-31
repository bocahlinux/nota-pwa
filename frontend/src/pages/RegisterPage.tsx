import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onRegister, onSwitchToLogin }: { onRegister: () => void; onSwitchToLogin: () => void }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password, passwordConfirm);
      onRegister();
    } catch (err: any) {
      const data = err.response?.data;
      if (data) {
        // Flatten DRF error messages
        const msgs: string[] = [];
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) msgs.push(val.join(' '));
          else msgs.push(String(val));
        }
        setError(msgs.join(' ') || 'Registrasi gagal.');
      } else {
        setError('Registrasi gagal. Cek koneksi internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">📝</div>
        <h1>Daftar Nota</h1>
        <p className="login-subtitle">Buat akun baru untuk mulai mencatat</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password (min. 8 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Konfirmasi Password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>
        <p className="login-switch">
          Sudah punya akun?{' '}
          <button className="link-btn" onClick={onSwitchToLogin}>Masuk</button>
        </p>
      </div>
    </div>
  );
}
