import React from 'react';

const GRADIENTS = [
  'linear-gradient(135deg, #2563eb, #3b82f6)',
  'linear-gradient(135deg, #0284c7, #38bdf8)',
  'linear-gradient(135deg, #059669, #34d399)',
  'linear-gradient(135deg, #7c3aed, #a78bfa)',
  'linear-gradient(135deg, #d97706, #fbbf24)',
];

export default function UserAvatar({ name = '', size = 'md', className = '' }) {
  const getInitials = (text) => {
    if (!text) return 'U';
    const parts = text.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Derive stable gradient from name
  const charCodeSum = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradient = GRADIENTS[charCodeSum % GRADIENTS.length];

  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '';

  return (
    <div
      className={`avatar ${sizeClass} ${className}`}
      style={{ background: gradient }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
