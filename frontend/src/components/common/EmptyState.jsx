import React from 'react';
import { FolderSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description = 'There are no records matching your criteria.',
  actionText,
  actionLink,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{title}</h3>
      <p style={{ maxWidth: '420px', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {description}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}
      {actionText && onAction && (
        <button type="button" onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
}
