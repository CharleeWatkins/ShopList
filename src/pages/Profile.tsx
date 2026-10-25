// src/pages/Profile.tsx
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { Mail, MapPin, CheckCircle} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateUserProfile } from '../store/authSlice';
import { apiClient } from '../api/client';
import { Button, Input } from '../components/UI';

export const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    cellNumber: user?.cellNumber || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDiscard = () => {
    setFormData({
      name: user?.name || '',
      surname: user?.surname || '',
      email: user?.email || '',
      cellNumber: user?.cellNumber || '',
    });
    toast('Changes discarded', { icon: '↩️' });
  };

  const handleSave = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const updatedUser = await apiClient.updateUser(user.id, formData);
      
      const safeUser = { ...updatedUser };
      if ('passwordHash' in safeUser) {
        delete (safeUser as Record<string, unknown>).passwordHash;
      }
      
      dispatch(updateUserProfile(safeUser));
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user ? `${user.name[0]}${user.surname[0]}` : 'U';

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Your profile</h1>
          <p className="page-subtitle">A little about you. Everything just how you like it.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button type="button" variant="secondary" onClick={handleDiscard}>
            Discard changes
          </Button>
          <Button type="button" onClick={() => handleSave()} isLoading={isSaving}>
            Save changes
          </Button>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="avatar-large" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user?.name} {user?.surname}
            <span className="badge" style={{ fontSize: '0.7rem' }}>Personal account</span>
          </h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Making everyday a little more organized.</p>
          <p className="text-muted" style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>Member since {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="create-list-grid">
        
        {/* LEFT COLUMN */}
        <div>
          {/* Personal Info */}
          <div className="panel">
            <h2 className="panel-title">Personal information</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1.5rem' }}>Keep your details up to date.</p>
            
            <div className="form-row">
              <Input id="name" label="First name" value={formData.name} onChange={handleChange} required />
              <Input id="surname" label="Last name" value={formData.surname} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <span style={{ color: '#10b981', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                <CheckCircle size={14} /> Your email address is verified
              </span>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label htmlFor="location" className="form-label">Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="location"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  defaultValue="Cape Town, South Africa"
                  readOnly
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label htmlFor="cellNumber" className="form-label">Cell Number</label>
              <input
                id="cellNumber"
                type="tel"
                className="form-input"
                value={formData.cellNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Shopping Preferences */}
          <div className="panel">
            <h2 className="panel-title">Shopping preferences</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-input" defaultValue="ZAR">
                  <option value="ZAR">ZAR - R Rand</option>
                  <option value="USD">USD - $ Dollar</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Units</label>
                <select className="form-input" defaultValue="metric">
                  <option value="metric">Metric (kg, g, L)</option>
                  <option value="imperial">Imperial (lb, oz)</option>
                </select>
              </div>
            </div>

            <div className="setting-item" style={{ padding: '1rem 0', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>Sort items by category</strong>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Keep produce, dairy, and pantry items together.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Account & Security */}
          <div className="panel">
            <h2 className="panel-title">Account & security</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1.5rem' }}>A secure home for your everyday plans.</p>
            
            <div className="setting-item">
              <div>
                <strong>Password</strong>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Last updated October 12, 2026</p>
              </div>
              <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                Change password
              </Button>
            </div>

            <div className="setting-item" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div>
                <strong>Two-factor authentication</strong>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>An extra layer of protection for your account.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="panel">
            <h2 className="panel-title">Notifications</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1.5rem' }}>Just the updates that matter to you.</p>
            
            <div className="setting-item">
              <div>
                <strong>Shared list activity</strong>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Know when someone adds or checks off an item.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div>
                <strong>Email tips & inspiration</strong>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Fresh ideas for better shopping. No clutter.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};