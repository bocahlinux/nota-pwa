import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import './index.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [refresh, setRefresh] = useState(0);

  if (loading) {
    return (
      <div className="splash">
        <div className="splash-logo">📝</div>
        <p>Memuat Nota...</p>
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onLogin={() => setRefresh(r => r + 1)}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={() => setRefresh(r => r + 1)}
        onSwitchToRegister={() => setAuthView('register')}
      />
    );
  }

  return <HomePage key={refresh} />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
