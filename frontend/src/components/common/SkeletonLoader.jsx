import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 3 }) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid-3">
        {items.map((_, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="skeleton" style={{ height: '24px', width: '70%' }} />
            <div className="skeleton" style={{ height: '16px', width: '40%' }} />
            <div className="skeleton" style={{ height: '50px', width: '100%' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div className="skeleton" style={{ height: '20px', width: '60px', borderRadius: '9999px' }} />
              <div className="skeleton" style={{ height: '20px', width: '80px', borderRadius: '9999px' }} />
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton" style={{ height: '16px', width: '45%' }} />
              <div className="skeleton" style={{ height: '16px', width: '25%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '40px', width: '100%' }} />
      ))}
    </div>
  );
}

