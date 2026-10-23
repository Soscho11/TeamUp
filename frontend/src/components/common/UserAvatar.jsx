import React from 'react';

export default function UserAvatar({ name = '', size = 'md', className = '' }) {
  const getInitials = (text) => {
    if (!text) return 'U';
    const parts = text.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '';

  return (
    <div className={`avatar ${sizeClass} ${className}`} aria-label={name}>
      {getInitials(name)}
    </div>
  );
}
