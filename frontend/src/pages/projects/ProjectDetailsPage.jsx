import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { requestService } from '../../services/requestService';
import { useAuth } from '../../hooks/useAuth';
import SkillBadge from '../../components/common/SkillBadge';
import UserAvatar from '../../components/common/UserAvatar';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import ProjectDiscussionBoard from '../../components/projects/ProjectDiscussionBoard';
import ProjectKanbanBoard from '../../components/projects/ProjectKanbanBoard';
import { bookmarkService } from '../../services/bookmarkService';
import {
  Users,
  Calendar,
  Layers,
  GitBranch,
  ExternalLink,
  Target,
  Send,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Shield,
  Trash2,
  Clock,
  Bookmark,
  Sparkles,
} from 'lucide-react';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Join Request Modal state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Remove member dialog
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getProjectById(id);
      setProject(data);
      setIsBookmarked(Boolean(data.is_bookmarked));
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setBookmarkLoading(true);
      const next = !isBookmarked;
      setIsBookmarked(next);
      const res = await bookmarkService.toggleBookmark(project.id);
      if (res && res.data) {
        setIsBookmarked(res.data.is_bookmarked);
      }
    } catch (err) {
      setIsBookmarked(isBookmarked);
    } finally {
      setBookmarkLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id, user]);

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    setJoinError('');

    try {
      setSubmittingJoin(true);
      await requestService.submitJoinRequest(project.id, joinMessage);
      setJoinSuccess(true);
      setTimeout(() => {
        setIsJoinModalOpen(false);
        setJoinSuccess(false);
        setJoinMessage('');
        fetchProjectDetails();
      }, 1500);
    } catch (err) {
      setJoinError(err.message || 'Failed to submit join request');
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      setRemovingMember(true);
      await projectService.removeMember(project.id, memberToRemove.user_id);
      setMemberToRemove(null);
      await fetchProjectDetails();
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    } finally {
      setRemovingMember(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading project specifications..." />;
  }

  if (error || !project) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <ErrorState title="Project Not Found" message={error} onRetry={fetchProjectDetails} />
      </div>
    );
  }

  const {
    title,
    summary,
    description,
    category,
    desired_team_size,
    current_members,
    available_capacity,
    collaboration_type,
    repository_url,
    status,
    goals,
    created_at,
    owner_id,
    owner_name,
    owner_university,
    owner_department,
    owner_github,
    skills = [],
    members = [],
    is_owner,
    is_member,
    user_request,
    matched_skills = [],
    match_percentage = 0,
  } = project;

  const isFull = available_capacity <= 0;

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Breadcrumb / Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/projects" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          ← Back to Projects
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={handleToggleBookmark}
            disabled={bookmarkLoading}
            className="btn btn-outline btn-sm"
            style={{
              color: isBookmarked ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: isBookmarked ? 'var(--accent)' : 'var(--border-card)',
            }}
          >
            <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
            <span>{isBookmarked ? 'Saved to Watchlist' : 'Bookmark Project'}</span>
          </button>

          {is_owner && (
            <Link to="/my-projects" className="btn btn-secondary btn-sm">
              Manage in My Projects
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content Column */}
        <div>
          {/* Skill Match Alert */}
          {user && match_percentage > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: match_percentage >= 60 ? 'var(--success-subtle)' : 'var(--primary-subtle)',
                border: `1px solid ${match_percentage >= 60 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
                marginBottom: '1.5rem',
              }}
            >
              <Sparkles size={16} style={{ color: match_percentage >= 60 ? 'var(--success)' : 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                <strong>{match_percentage}% Skill Match:</strong> Your profile matches {matched_skills.length} of {skills.length} required skill{skills.length === 1 ? '' : 's'} ({matched_skills.map((s) => s.name).join(', ')}).
              </span>
            </div>
          )}

          {/* Header Card */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge badge-neutral">
                <Layers size={12} />
                <span>{category}</span>
              </span>
              <span className="badge badge-primary">
                {collaboration_type.replace('_', ' ')}
              </span>
              <span className={`badge ${status === 'recruiting' ? 'badge-success' : 'badge-neutral'}`}>
                {status}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', marginBottom: '1rem', lineHeight: 1.25 }}>
              {title}
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {summary}
            </p>

            {repository_url && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <a
                  href={repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <GitBranch size={15} />
                  <span>Repository Link</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          {/* Detailed Description */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Project Description</h3>
            <div
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {description}
            </div>
          </div>

          {/* Project Goals */}
          {goals && (
            <div className="card" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Target size={18} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '1.2rem' }}>Milestones & Goals</h3>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {goals}
              </p>
            </div>
          )}

          {/* Required Skills */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Desired Skills & Tech Stack</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {skills.length > 0 ? (
                skills.map((s) => <SkillBadge key={s.id || s.name} name={s.name} />)
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-subtle)' }}>
                  No specific skills listed for this project.
                </p>
              )}
            </div>
          </div>

          {/* Current Team Members Roster */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Current Team Roster</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {current_members} of {desired_team_size} slots filled
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {members.map((member) => (
                <div
                  key={member.membership_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UserAvatar name={member.name} size="sm" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link
                          to={`/profile/${member.user_id}`}
                          style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}
                        >
                          {member.name}
                        </Link>
                        {member.role === 'Owner' && (
                          <span className="badge badge-accent" style={{ fontSize: '0.675rem', padding: '0.1rem 0.4rem' }}>
                            Owner
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-subtle)' }}>
                        {member.department} • {member.university}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      {member.role}
                    </span>

                    {/* Owner can remove non-owner members */}
                    {is_owner && member.user_id !== owner_id && (
                      <button
                        type="button"
                        onClick={() => setMemberToRemove(member)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)', padding: '0.3rem' }}
                        title="Remove member"
                        aria-label="Remove member"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks & Milestones Board */}
          <ProjectKanbanBoard
            projectId={project.id}
            members={members}
            isMember={is_member}
            isOwner={is_owner}
          />

          {/* Discussions & Community Board */}
          <ProjectDiscussionBoard
            projectId={project.id}
            isMember={is_member}
            isOwner={is_owner}
            user={user}
          />
        </div>

        {/* Sidebar Column: Team Capacity & Join Action */}
        <div>
          {/* Action / Capacity Box */}
          <div className="card" style={{ marginBottom: '1.5rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Team Collaboration</h3>

            {/* Capacity indicator */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Capacity</span>
                <span style={{ fontWeight: 600 }}>{current_members} / {desired_team_size} Members</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (current_members / desired_team_size) * 100)}%`,
                    height: '100%',
                    backgroundColor: isFull ? 'var(--warning)' : 'var(--primary)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', display: 'block', marginTop: '0.35rem' }}>
                {available_capacity > 0
                  ? `${available_capacity} team spot${available_capacity > 1 ? 's' : ''} currently open`
                  : 'Team is currently at full capacity'}
              </span>
            </div>

            {/* Action State */}
            {is_owner ? (
              <div className="alert alert-info" style={{ marginBottom: 0 }}>
                <Shield size={16} style={{ flexShrink: 0 }} />
                <span>You are the project owner. Manage join requests from your dashboard.</span>
              </div>
            ) : is_member ? (
              <div className="alert alert-success" style={{ marginBottom: 0 }}>
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>You are an active member of this project team.</span>
              </div>
            ) : user_request && user_request.status === 'pending' ? (
              <div className="alert alert-info" style={{ marginBottom: 0 }}>
                <Clock size={16} style={{ flexShrink: 0 }} />
                <span>Your join request has been submitted and is currently pending owner review.</span>
              </div>
            ) : isFull ? (
              <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>This project has reached its maximum team size.</span>
              </div>
            ) : status !== 'recruiting' ? (
              <div className="alert alert-neutral" style={{ marginBottom: 0 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>This project is currently marked as {status}.</span>
              </div>
            ) : user ? (
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="btn btn-primary"
                style={{ width: '100%', height: '42px' }}
              >
                <UserPlus size={16} />
                <span>Request to Join Team</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ width: '100%', height: '42px' }}
              >
                Log In to Apply
              </Link>
            )}

            {/* Owner Profile Card */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Project Lead
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                <UserAvatar name={owner_name} size="md" />
                <div>
                  <Link
                    to={`/profile/${owner_id}`}
                    style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}
                  >
                    {owner_name}
                  </Link>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {owner_university}
                  </span>
                </div>
              </div>

              {owner_github && (
                <div style={{ marginTop: '0.75rem' }}>
                  <a
                    href={owner_github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <span>View GitHub Profile</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Join Request Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title={`Apply to Join: ${title}`}
      >
        {joinSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle size={40} style={{ color: 'var(--success)', margin: '0 auto 0.75rem' }} />
            <h4>Join Request Submitted!</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              The project owner will review your application and skills.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendJoinRequest}>
            {joinError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{joinError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="joinMessage" className="form-label">
                <span>Message to Project Lead (Optional)</span>
              </label>
              <textarea
                id="joinMessage"
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="Introduce yourself, mention your relevant skills, and explain what you want to build..."
                rows={4}
                className="form-textarea"
                maxLength={1000}
              />
              <span className="form-hint">
                Explain which role or technology you can help with.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsJoinModalOpen(false)}
                disabled={submittingJoin}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingJoin}
              >
                <Send size={14} />
                <span>{submittingJoin ? 'Sending...' : 'Submit Application'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Remove Member Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this project?`}
        confirmText="Remove Member"
        loading={removingMember}
      />
    </div>
  );
}

