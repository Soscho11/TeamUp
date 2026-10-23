import React from 'react';
import { Link } from 'react-router-dom';
import SkillBadge from '../common/SkillBadge';
import UserAvatar from '../common/UserAvatar';
import { Users, ArrowUpRight, Layers, Sparkles } from 'lucide-react';

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
  } = project;

  const getStatusBadge = (st) => {
    switch (st) {
      case 'recruiting':
        return (
          <span className="badge badge-success">
            <span className="badge-dot badge-dot-success" />
            <span>Recruiting</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="badge badge-primary">
            <span className="badge-dot badge-dot-primary" />
            <span>In Progress</span>
          </span>
        );
      case 'completed':
        return <span className="badge badge-accent">Completed</span>;
      case 'cancelled':
        return <span className="badge badge-neutral">Cancelled</span>;
      default:
        return <span className="badge badge-neutral">{st}</span>;
    }
  };

  const capacityRatio = Math.min(100, (current_members / desired_team_size) * 100);

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '1.4rem',
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <span className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
            <Layers size={11} />
            <span>{category}</span>
          </span>
          {getStatusBadge(status)}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', lineHeight: 1.35, fontWeight: 700 }}>
          <Link
            to={`/projects/${id}`}
            style={{
              color: 'var(--text-main)',
              transition: 'color var(--transition-fast)',
            }}
          >
            {title}
          </Link>
        </h3>

        {/* Summary */}
        <p
          style={{
            fontSize: '0.865rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
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
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                +{skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.9rem', marginTop: '0.5rem' }}>
        {/* Capacity Progress Bar */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-subtle)', fontWeight: 500 }}>Team Formation</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {current_members}/{desired_team_size} Members
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${capacityRatio}%`,
                height: '100%',
                backgroundColor: available_capacity === 0 ? 'var(--warning)' : 'var(--primary)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Owner and Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <UserAvatar name={owner_name} size="sm" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {owner_name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                {owner_university || 'University'}
              </span>
            </div>
          </div>

          <Link
            to={`/projects/${id}`}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
          >
            <span>View</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
