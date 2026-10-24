import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, isDark, toggleTheme } = useTheme();

  const titleText = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label={titleText}
      title={titleText}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: showLabel ? '0.6rem 0.85rem' : '0.45rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'transparent',
        border: '1px solid var(--border-card)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        fontSize: '0.85rem',
        fontWeight: 500,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDark ? '#fcd34d' : '#2563eb',
          transition: 'transform 0.2s ease',
        }}
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </span>
      {showLabel && (
        <span style={{ color: 'var(--text-main)' }}>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
