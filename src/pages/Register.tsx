// src/pages/Register.tsx
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react'; // FIX: Type-only import
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient } from '../api/client';
import { hashPassword } from '../utils/auth';
import { useAppDispatch } from '../hooks/redux';
import { setCredentials } from '../store/authSlice';
import { Button, Input } from '../components/UI';
import logo from '../assets/logo.png';
import type { SafeUser } from '../types';



export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    cellNumber: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // FIX: Strictly typed ChangeEvent
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.cellNumber.length < 10) {
      setError('Please enter a valid cell number');
      return;
    }

    setIsLoading(true);

    try {
      const existingUsers = await apiClient.getUserByEmail(formData.email);
      if (existingUsers.length > 0) {
        throw new Error('Email is already in use');
      }

      const passwordHash = await hashPassword(formData.password);

      const newUser = await apiClient.createUser({
        id: crypto.randomUUID(),
        name: formData.name,
        surname: formData.surname,
        cellNumber: formData.cellNumber,
        email: formData.email,
        passwordHash,
      });

      // FIX: Safely omit passwordHash without unused variable errors
      const safeUser = { ...newUser } as Partial<typeof newUser>;
      delete safeUser.passwordHash;
      
      dispatch(setCredentials({ user: safeUser as SafeUser, token: `token-${newUser.id}` }));
      
      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });

    } catch (err: unknown) {
      if (err instanceof Error) {
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
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join ShopList today</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}> 
            <Input
              id="name"
              label="Name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              id="surname"
              label="Surname"
              placeholder="Surname"
              value={formData.surname}
              onChange={handleChange}
              required
            />
         

          {/* Rest of the inputs */}
          <Input
            id="cellNumber"
            type="tel"
            label="Cell Number"
            placeholder="Cell Number"
            value={formData.cellNumber}
            onChange={handleChange}
            maxLength={10}
            required
          />

          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="your@gmail.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Button type="submit" isLoading={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
            Sign up
          </Button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};