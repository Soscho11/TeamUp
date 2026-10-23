import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import UserAvatar from '../../components/common/UserAvatar';
import SkillBadge from '../../components/common/SkillBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { GitBranch, Globe, ExternalLink, FolderGit2, Layers } from 'lucide-react';

export default function UserProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPublicProfile() {
      try {
        setLoading(true);
        setError('');
        const data = await userService.getUserById(id);
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    }

    fetchPublicProfile();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading student profile..." />;
  }

  if (error || !profile) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <ErrorState title="Profile Not Found" message={error} />
      </div>
    );
  }

  const {
    name,
    university,
    department,
    bio,
    github_url,
    portfolio_url,
    skills = [],
    created_projects = [],
  } = profile;

  return (
    <div className="container" style={{ padding: '2.5rem 1rem', maxWidth: '860px' }}>
      <Link to="/projects" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0, marginBottom: '1.5rem' }}>
        ← Back to Projects
      </Link>

      {/* Profile Header */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <UserAvatar name={name} size="lg" />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{name}</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            {department} • {university}
          </p>

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.75rem' }}>
            {github_url && (
              <a
                href={github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <GitBranch size={14} />
                <span>GitHub</span>
                <ExternalLink size={10} />
              </a>
            )}

            {portfolio_url && (
              <a
                href={portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Globe size={14} />
                <span>Portfolio</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>About</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {bio}
          </p>
        </div>
      )}

      {/* Skills */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Technical Proficiencies</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {skills.length > 0 ? (
            skills.map((s) => (
              <SkillBadge key={s.id || s.name} name={s.name} proficiency={s.proficiency_level} />
            ))
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-subtle)' }}>
              No technical skills listed yet.
            </p>
          )}
        </div>
      </div>

      {/* Created Projects */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Projects by {name}</h3>
        {created_projects.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
            This student has not published any projects yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {created_projects.map((p) => (
              <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-neutral">
                      <Layers size={11} />
                      <span>{p.category}</span>
                    </span>
                    <span className={`badge ${p.status === 'recruiting' ? 'badge-success' : 'badge-neutral'}`}>
                      {p.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                    <Link to={`/projects/${p.id}`} style={{ color: 'var(--text-main)' }}>
                      {p.title}
                    </Link>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.summary}</p>
                </div>

                <Link to={`/projects/${p.id}`} className="btn btn-outline btn-sm">
                  <span>View Project</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
