import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import UserAvatar from '../common/UserAvatar';
import NotificationPanel from '../common/NotificationPanel';
import ThemeToggle from '../common/ThemeToggle';
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
            <Users size={18} />
          </div>
          <span>TeamUp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Compass size={15} />
            <span>Explore</span>
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/my-projects"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <FolderGit2 size={15} />
                <span>My Projects</span>
              </NavLink>

              <NavLink
                to="/requests"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Inbox size={15} />
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
                <PlusCircle size={14} />
                <span className="hide-sm">Create Project</span>
              </Link>

              {/* Notification Bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label="Notifications"
                  style={{ position: 'relative', padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent)',
                        boxShadow: '0 0 8px var(--accent)',
                      }}
                    />
                  )}
                </button>

                {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
              </div>

              {/* User Dropdown */}
              <div ref={userRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: '1px solid transparent',
                    padding: '2px',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                >
                  <UserAvatar name={user.name} size="sm" />
                  <ChevronDown size={13} style={{ color: 'var(--text-subtle)' }} />
                </button>

                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      width: '220px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-modal)',
                      zIndex: 150,
                      padding: '0.5rem 0',
                      animation: 'scaleUp 0.15s var(--ease-spring)',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.885rem', color: 'var(--text-main)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 1rem',
                        fontSize: '0.865rem',
                        color: 'var(--text-secondary)',
                      }}
                      className="nav-link"
                    >
                      <User size={14} />
                      <span>My Profile</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 1rem',
                        fontSize: '0.865rem',
                        color: '#f87171',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <LogOut size={14} />
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

          {/* Theme Toggle */}
          <ThemeToggle />

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
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <Link
            to="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link"
          >
            <Compass size={16} />
            <span>Explore Projects</span>
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/my-projects"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link"
              >
                <FolderGit2 size={16} />
                <span>My Projects</span>
              </Link>

              <Link
                to="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link"
              >
                <Inbox size={16} />
                <span>Join Requests</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link"
              >
                <User size={16} />
                <span>Profile</span>
              </Link>

              <Link
                to="/projects/create"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <PlusCircle size={15} />
                <span>Create Project</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '0.25rem' }}
              >
                <LogOut size={15} />
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

          <div style={{ marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
            <ThemeToggle showLabel />
          </div>
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
