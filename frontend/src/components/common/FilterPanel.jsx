import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'Web Development',
  'Mobile App',
  'AI & Machine Learning',
  'Cybersecurity',
  'Cloud & DevOps',
  'Data Science',
  'IoT & Hardware',
  'Game Development',
  'Blockchain',
  'Other',
];

const STATUSES = [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function FilterPanel({
  category,
  onCategoryChange,
  status,
  onStatusChange,
  skill,
  onSkillChange,
  sortBy,
  onSortChange,
  onReset,
  hasActiveFilters,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <Filter size={15} />
        <span>Filters:</span>
      </div>

      {/* Category selector */}
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="form-select"
        style={{ width: 'auto', minWidth: '160px', height: '36px', fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Status selector */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="form-select"
        style={{ width: 'auto', minWidth: '130px', height: '36px', fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
      >
        <option value="">All Statuses</option>
        {STATUSES.map((st) => (
          <option key={st.value} value={st.value}>
            {st.label}
          </option>
        ))}
      </select>

      {/* Skill search */}
      <input
        type="text"
        value={skill}
        onChange={(e) => onSkillChange(e.target.value)}
        placeholder="Filter by skill (e.g. React)..."
        className="form-input"
        style={{ width: 'auto', minWidth: '170px', height: '36px', fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
      />

      {/* Sort By */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="form-select"
        style={{ width: 'auto', minWidth: '130px', height: '36px', fontSize: '0.85rem', padding: '0.35rem 0.75rem', marginLeft: 'auto' }}
      >
        <option value="created_at">Newest First</option>
        <option value="title">Project Title</option>
        <option value="desired_team_size">Team Size</option>
      </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="btn btn-ghost btn-sm"
          style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
