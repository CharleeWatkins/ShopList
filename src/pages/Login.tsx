// src/pages/Login.tsx
import { useState } from 'react';
import type { FormEvent } from 'react'; // FIX: Type-only import
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient, ApiError } from '../api/client';
import { verifyPassword } from '../utils/auth';
import { useAppDispatch } from '../hooks/redux';
import { setCredentials } from '../store/authSlice';
import { Button, Input } from '../components/UI';
import type { SafeUser } from '../types';
import logo from '../assets/logo.png';

// FIX: Strict type for router location state
interface LocationState {
  from?: { pathname: string };
}

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // FIX: Replaced 'any' with strict type
  const from = (location.state as LocationState)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const users = await apiClient.getUserByEmail(email);
      
      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = users[0];
      const isValid = await verifyPassword(password, user.passwordHash);
      
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // FIX: Safely omit passwordHash without triggering unused variable linter errors
      const safeUser = { ...user } as Partial<typeof user>;
      delete safeUser.passwordHash;
      
      dispatch(setCredentials({ user: safeUser as SafeUser, token: `token-${user.id}` }));
      toast.success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });

    } catch (err: unknown) {
      if (err instanceof ApiError || err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-wrapper">
  <img src={logo} alt="ShopList Logo" style={{ height: '40px' }} />
</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="your@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" style={{ fontSize: '0.875rem' }}>Forgot Password?</a>
          </div>

          <Button type="submit" isLoading={isLoading} style={{ width: '100%' }}>
            Login
          </Button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};