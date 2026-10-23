import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import UserAvatar from '../common/UserAvatar';
import NotificationPanel from '../common/NotificationPanel';
import {
  Users,
  Compass,
  PlusCircle,
  LayoutDashboard,
  FolderGit2,
  Inbox,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Users size={20} />
          </div>
          <span>TeamUp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Compass size={17} />
            <span>Explore</span>
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/my-projects"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <FolderGit2 size={17} />
                <span>My Projects</span>
              </NavLink>

              <NavLink
                to="/requests"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Inbox size={17} />
                <span>Requests</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/projects/create" className="btn btn-primary btn-sm">
                <PlusCircle size={15} />
                <span className="hide-sm">Create Project</span>
              </Link>

              {/* Notification Bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label="Notifications"
                  style={{ position: 'relative', padding: '0.45rem' }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent)',
                      }}
                    />
                  )}
                </button>

                {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
              </div>

              {/* User Menu */}
              <div ref={userRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                >
                  <UserAvatar name={user.name} size="sm" />
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </button>

                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      width: '210px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 150,
                      padding: '0.5rem 0',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.65rem 1rem',
                        borderBottom: '1px solid var(--border-card)',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-main)',
                      }}
                      className="nav-link"
                    >
                      <User size={15} />
                      <span>My Profile</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.875rem',
                        color: '#f87171',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="btn btn-ghost btn-sm show-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{ padding: '0.45rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-card)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link
            to="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
          >
            <Compass size={18} />
            <span>Explore Projects</span>
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/my-projects"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link"
              >
                <FolderGit2 size={18} />
                <span>My Projects</span>
              </Link>

              <Link
                to="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link"
              >
                <Inbox size={18} />
                <span>Join Requests</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link"
              >
                <User size={18} />
                <span>Profile</span>
              </Link>

              <Link
                to="/projects/create"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <PlusCircle size={16} />
                <span>Create Project</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        .show-mobile { display: none; }
        @media (max-width: 768px) {
          .hide-sm { display: none; }
          .show-mobile { display: flex; }
        }
      `}</style>
    </header>
  );
}
