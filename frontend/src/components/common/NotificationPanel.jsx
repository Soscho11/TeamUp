import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Check, Bell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationPanel({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.5rem',
        width: '360px',
        maxWidth: '90vw',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '480px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          borderBottom: '1px solid var(--border-card)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
          {unreadCount > 0 && (
            <span className="badge badge-primary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading && notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
            No notifications yet
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.is_read && markAsRead(item.id)}
              style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: item.is_read ? 'transparent' : 'rgba(37, 99, 235, 0.08)',
                cursor: item.is_read ? 'default' : 'pointer',
                transition: 'background-color var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: item.is_read ? 'var(--text-muted)' : 'var(--text-main)' }}>
                  {item.title}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                  {formatTime(item.created_at)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {item.message}
              </p>
              {item.related_project_id && (
                <div style={{ marginTop: '0.25rem' }}>
                  <Link
                    to={`/projects/${item.related_project_id}`}
                    onClick={onClose}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--accent)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span>View Project</span>
                    <ExternalLink size={10} />
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
