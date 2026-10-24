import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SkillBadge from '../common/SkillBadge';
import UserAvatar from '../common/UserAvatar';
import { Users, ArrowUpRight, Layers, Sparkles, Bookmark } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { bookmarkService } from '../../services/bookmarkService';

export default function ProjectCard({ project, onBookmarkChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(Boolean(project.is_bookmarked));
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

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
    match_percentage = 0,
  } = project;

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setBookmarkLoading(true);
      const nextState = !bookmarked;
      setBookmarked(nextState);
      const res = await bookmarkService.toggleBookmark(id);
      if (res && res.data) {
        setBookmarked(res.data.is_bookmarked);
      }
      if (onBookmarkChange) {
        onBookmarkChange(id, nextState);
      }
    } catch (err) {
      // Revert on error
      setBookmarked(bookmarked);
    } finally {
      setBookmarkLoading(false);
    }
  };

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
        {/* Top Badges & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
              <Layers size={11} />
              <span>{category}</span>
            </span>

            {match_percentage > 0 && (
              <span
                className={`badge ${match_percentage >= 60 ? 'badge-success' : 'badge-primary'}`}
                style={{ fontSize: '0.725rem' }}
                title={`${match_percentage}% of required skills match your profile`}
              >
                <Sparkles size={11} />
                <span>{match_percentage}% Match</span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getStatusBadge(status)}
            <button
              type="button"
              onClick={handleBookmarkToggle}
              disabled={bookmarkLoading}
              title={bookmarked ? 'Remove from bookmarks' : 'Save project'}
              aria-label={bookmarked ? 'Remove from bookmarks' : 'Save project'}
              style={{
                background: 'none',
                border: 'none',
                color: bookmarked ? 'var(--accent)' : 'var(--text-subtle)',
                cursor: 'pointer',
                padding: '3px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color var(--transition-fast), transform var(--transition-fast)',
              }}
            >
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
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
              backgroundColor: 'var(--border-subtle)',
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
