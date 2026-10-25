// src/pages/ShareList.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Share2, Copy } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchUserLists } from '../store/listsSlice';
import { apiClient } from '../api/client';
import { Button } from '../components/UI';

export const ShareList = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { lists, status } = useAppSelector((state) => state.lists);
  const dispatch = useAppDispatch();

  const [selectedListId, setSelectedListId] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Fetch lists on mount if not already loaded in Redux
  useEffect(() => {
    if (user && status === 'idle') {
      dispatch(fetchUserLists(user.id));
    }
  }, [dispatch, user, status]);

  // PRINCIPAL ENGINEER FIX: Derive state during render instead of using a cascading useEffect
  const currentListId = selectedListId || (lists.length > 0 ? lists[0].id : '');
  const activeList = lists.find((l) => l.id === currentListId);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeList || !inviteEmail) return;

    // Prevent inviting the same person twice
    if (activeList.sharedWith.includes(inviteEmail)) {
      toast.error('This person already has access.');
      return;
    }

    setIsInviting(true);
    try {
      const updatedSharedWith = [...activeList.sharedWith, inviteEmail];
      
      await apiClient.updateList(activeList.id, { sharedWith: updatedSharedWith });
      
      toast.success(`Invited ${inviteEmail}!`);
      setInviteEmail('');
      
      // Refresh Redux state to reflect the new collaborator
      if (user) dispatch(fetchUserLists(user.id));
    } catch {
      toast.error('Failed to invite user.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeList) return;
    const link = `${window.location.origin}/shared/${activeList.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  // Loading & Empty States
  if (status === 'loading') return <div className="page-content">Loading...</div>;

  if (lists.length === 0) {
    return (
      <div className="page-content">
        <h1 className="page-title">Share List</h1>
        <p className="text-muted">You need to create a list before you can share it.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Good lists are better together.</h1>
        <p className="page-subtitle">Invite your people. Keep everyone on the same shopping list.</p>
      </div>

      {/* List Selector Header */}
      <div className="share-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="list-icon-wrapper">
            <Share2 size={20} />
          </div>
          <div>
            <select 
              className="form-input" 
              style={{ border: 'none', background: 'transparent', fontSize: '1.1rem', fontWeight: 600, padding: 0, cursor: 'pointer' }}
              value={currentListId}
              onChange={(e) => setSelectedListId(e.target.value)}
            >
              {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>
              {activeList?.items.length} items · {activeList?.sharedWith.length} collaborators
            </p>
          </div>
        </div>
      </div>

      <div className="create-list-grid">
        
        {/* LEFT COLUMN */}
        <div>
          {/* Invite Panel */}
          <div className="panel">
            <h2 className="panel-title">Invite people</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1.5rem' }}>A shared fridge starts with a shared list.</p>
            
            <form onSubmit={handleInvite} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Add a name or email address" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <Button type="submit" isLoading={isInviting} style={{ padding: '0 1.5rem' }}>
                Send invite
              </Button>
            </form>
          </div>

          {/* People with Access Panel */}
          <div className="panel">
            <h2 className="panel-title">People with access</h2>
            
            {/* Owner */}
            <div className="person-row">
              <div className="person-info">
                <div className="person-avatar owner">{user?.name[0]}{user?.surname[0]}</div>
                <div className="person-details">
                  <h4>{user?.name} {user?.surname} (you)</h4>
                  <p>{user?.email}</p>
                </div>
              </div>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Owner</span>
            </div>

            {/* Shared Users */}
            {activeList?.sharedWith.map((email, index) => (
              <div key={index} className="person-row">
                <div className="person-info">
                  <div className="person-avatar">{email[0].toUpperCase()}</div>
                  <div className="person-details">
                    <h4>{email.split('@')[0]}</h4>
                    <p>{email}</p>
                  </div>
                </div>
                <select className="form-input" style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <option>Can edit</option>
                  <option>Can view</option>
                </select>
              </div>
            ))}

            {activeList?.sharedWith.length === 0 && (
              <p className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No one else has access yet.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Share Link Panel */}
          <div className="panel">
            <h2 className="panel-title">Share a link</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '-1rem', marginBottom: '1rem' }}>An easy way to bring everyone along.</p>
            
            <div className="copy-link-box">
              <span>{window.location.origin}/shared/{activeList?.id.substring(0, 8)}...</span>
              <button type="button" onClick={handleCopyLink} style={{ color: 'var(--primary-pink)' }}>
                <Copy size={16} />
              </button>
            </div>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Your link won't give access to anyone who hasn't been invited.
            </p>
          </div>

          {/* Settings Panel */}
          <div className="panel">
            <h2 className="panel-title">Sharing settings</h2>
            
            <div className="setting-item" style={{ padding: '0.75rem 0' }}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>Editors can invite others</strong>
                <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Let collaborators grow the group.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item" style={{ padding: '0.75rem 0', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>Notify me about changes</strong>
                <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Stay in the loop as items change.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};