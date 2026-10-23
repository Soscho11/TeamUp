import React from 'react';
import { Link } from 'react-router-dom';
import SkillBadge from '../common/SkillBadge';
import UserAvatar from '../common/UserAvatar';
import { Users, Calendar, ArrowRight, Layers } from 'lucide-react';

export default function ProjectCard({ project }) {
  const {
    id,
    title,
    summary,
    category,
    status,
    desired_team_size,
    current_members,
    available_capacity,
    owner_name,
    owner_university,
    skills = [],
    created_at,
  } = project;

  const getStatusBadge = (st) => {
    switch (st) {
      case 'recruiting':
        return <span className="badge badge-success">Recruiting</span>;
      case 'in_progress':
        return <span className="badge badge-primary">In Progress</span>;
      case 'completed':
        return <span className="badge badge-accent">Completed</span>;
      case 'cancelled':
        return <span className="badge badge-neutral">Cancelled</span>;
      default:
        return <span className="badge badge-neutral">{st}</span>;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <span className="badge badge-neutral">
            <Layers size={11} />
            <span>{category}</span>
          </span>
          {getStatusBadge(status)}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', lineHeight: 1.35 }}>
          <Link to={`/projects/${id}`} style={{ color: 'var(--text-main)' }}>
            {title}
          </Link>
        </h3>

        {/* Summary */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {summary}
        </p>

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
            {skills.slice(0, 4).map((skill) => (
              <SkillBadge key={skill.id || skill.name} name={skill.name} />
            ))}
            {skills.length > 4 && (
              <span className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
                +{skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          {/* Owner info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserAvatar name={owner_name} size="sm" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {owner_name}
              </span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                {owner_university || 'University'}
              </span>
            </div>
          </div>

          {/* Capacity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Users size={14} />
            <span>
              {current_members}/{desired_team_size}
            </span>
          </div>
        </div>

        {/* Action Link */}
        <Link
          to={`/projects/${id}`}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <span>
            {available_capacity > 0 && status === 'recruiting'
              ? `${available_capacity} spot${available_capacity > 1 ? 's' : ''} available`
              : 'View Details'}
          </span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
