// src/components/AppLayout.tsx
import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, User, Bell, Search, Cloud, Menu, X, Share2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { logout } from '../store/authSlice';
import { clearListsState } from '../store/listsSlice';
import { useUrlSync } from '../hooks/useUrlSync';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { search, updateUrl } = useUrlSync();

  // Hamburger Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearListsState());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const initials = user ? `${user.name[0]}${user.surname[0]}` : 'U';

  return (
    <div className="app-layout">
      
      {/* Mobile Overlay (Clicking this closes the menu) */}
      <div 
        className={`sidebar-overlay ${isMenuOpen ? 'open' : ''}`} 
        onClick={closeMenu}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img src={logo} alt="ShopList Logo" style={{ height: '35px', objectFit: 'contain' }} />
          
          {/* Close button for mobile inside the sidebar */}
          <button 
            className="hamburger-btn" 
            onClick={closeMenu} 
            style={{ display: isMenuOpen ? 'flex' : 'none' }}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Home size={20} /> Home
          </NavLink>
          <NavLink to="/create-list" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <PlusCircle size={20} /> Create List
          </NavLink>
          <NavLink to="/share-list" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Share2 size={20} /> Share List
          </NavLink>
          <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <User size={20} /> Profile
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-navbar">
          
          {/* Hamburger Button (Visible on Mobile) */}
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="search-bar">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search lists by name..." 
              value={search}
              onChange={(e) => updateUrl({ search: e.target.value })}
            />
          </div>
          
          <div className="nav-actions">
            <span className="sync-status" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Cloud size={16} /> All changes saved
            </span>
            <button className="icon-btn">
              <Bell size={20} color="var(--text-muted)" />
            </button>
            <button className="user-avatar" onClick={handleLogout} title="Click to logout">
              {initials}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};