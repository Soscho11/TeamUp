import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this content.',
  onRetry,
}) {
  return (
    <div className="empty-state" style={{ padding: '3.5rem 1rem' }}>
      <div
        className="empty-state-icon"
        style={{
          backgroundColor: 'var(--danger-subtle)',
          color: 'var(--danger)',
        }}
      >
        <AlertCircle size={28} />
      </div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{title}</h3>
      <p style={{ maxWidth: '420px', fontSize: '0.9rem', marginBottom: '1rem', color: '#fca5a5' }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
