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
    <span className={`badge ${getVariantClass()}`}>
      <span>{name}</span>
      {proficiency && (
        <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>• {proficiency}</span>
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
          }}
          aria-label={`Remove skill ${name}`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
