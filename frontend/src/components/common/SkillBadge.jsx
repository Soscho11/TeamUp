import React from 'react';
import { X } from 'lucide-react';

export default function SkillBadge({ name, proficiency, onRemove, variant = 'primary' }) {
  const getVariantClass = () => {
    switch (variant) {
      case 'accent': return 'badge-accent';
      case 'success': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'danger': return 'badge-danger';
      case 'neutral': return 'badge-neutral';
      default: return 'badge-primary';
    }
  };

  return (
    <span
      className={`badge ${getVariantClass()}`}
      style={{
        padding: '0.2rem 0.6rem',
        fontSize: '0.725rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}
    >
      <span>{name}</span>
      {proficiency && (
        <span style={{ opacity: 0.65, fontSize: '0.675rem', fontWeight: 400 }}>• {proficiency}</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(name);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: 0,
            marginLeft: '0.2rem',
            opacity: 0.7,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          aria-label={`Remove skill ${name}`}
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}
