import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, message = '', fullScreen = false }) {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: fullScreen ? '0' : '2.5rem 1rem',
      }}
    >
      <Loader2
        size={size}
        className="spin"
        style={{
          color: 'var(--primary)',
          animation: 'spin 1s linear infinite',
        }}
      />
      {message && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{message}</p>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}

