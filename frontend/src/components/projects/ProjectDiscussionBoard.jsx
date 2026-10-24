import React, { useState, useEffect } from 'react';
import { discussionService } from '../../services/discussionService';
import UserAvatar from '../common/UserAvatar';
import LoadingSpinner from '../common/LoadingSpinner';
import { MessageSquare, Lock, Send, Trash2, Shield, Users, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectDiscussionBoard({ projectId, isMember, isOwner, user }) {
  const [activeTab, setActiveTab] = useState('public_qa');
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageText, setMessageText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchDiscussions = async (type = activeTab) => {
    try {
      setLoading(true);
      setError('');
      const res = await discussionService.getDiscussions(projectId, type);
      setDiscussions(res.data?.discussions || []);
    } catch (err) {
      setError(err.message || 'Failed to load discussions');
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'team_internal' && !isMember && !isOwner) {
      return;
    }
    fetchDiscussions(activeTab);
  }, [projectId, activeTab]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      setPosting(true);
      await discussionService.createDiscussion(projectId, {
        content: messageText.trim(),
        type: activeTab,
      });
      setMessageText('');
      await fetchDiscussions(activeTab);
    } catch (err) {
      alert(err.message || 'Failed to post message');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (discussionId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await discussionService.deleteDiscussion(discussionId);
      setDiscussions((prev) => prev.filter((d) => d.id !== discussionId));
    } catch (err) {
      alert(err.message || 'Failed to delete message');
    }
  };

  const canAccessTeamTab = isMember || isOwner;

  return (
    <div className="card" style={{ marginTop: '1.75rem' }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Discussions & Community</h3>
        </div>

        <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('public_qa')}
            className="btn btn-sm"
            style={{
              backgroundColor: activeTab === 'public_qa' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'public_qa' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: activeTab === 'public_qa' ? 'var(--shadow-subtle)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <HelpCircle size={13} />
            <span>Public Q&A</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (canAccessTeamTab) setActiveTab('team_internal');
            }}
            disabled={!canAccessTeamTab}
            className="btn btn-sm"
            title={!canAccessTeamTab ? 'Locked: Available only to approved team members' : ''}
            style={{
              backgroundColor: activeTab === 'team_internal' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'team_internal' ? 'var(--text-main)' : canAccessTeamTab ? 'var(--text-muted)' : 'var(--text-subtle)',
              boxShadow: activeTab === 'team_internal' ? 'var(--shadow-subtle)' : 'none',
              cursor: canAccessTeamTab ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {!canAccessTeamTab ? <Lock size={12} /> : <Users size={13} />}
            <span>Team Workspace</span>
          </button>
        </div>
      </div>

      {/* Internal Room Access Notice */}
      {activeTab === 'team_internal' && !canAccessTeamTab ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Lock size={32} style={{ color: 'var(--text-subtle)', marginBottom: '0.75rem' }} />
          <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Private Team Space</h4>
          <p style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto' }}>
            The Team Workspace discussion is exclusively open to accepted contributors and the project owner.
          </p>
        </div>
      ) : (
        <>
          {/* Discussion Messages Stream */}
          {loading ? (
            <div style={{ padding: '2rem 0', textAlign: 'center' }}>
              <LoadingSpinner message="Loading messages..." />
            </div>
          ) : discussions.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
              {activeTab === 'public_qa'
                ? 'No questions posted yet. Have a question about this project? Ask below!'
                : 'Team discussion is clean. Start coordination or share notes here.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {discussions.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <UserAvatar name={d.author_name} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Link
                          to={`/profile/${d.user_id}`}
                          style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}
                        >
                          {d.author_name}
                        </Link>
                        {d.author_role === 'Owner' && (
                          <span className="badge badge-accent" style={{ fontSize: '0.675rem', padding: '0.1rem 0.4rem' }}>
                            Owner
                          </span>
                        )}
                        {d.author_role === 'Team Member' && (
                          <span className="badge badge-primary" style={{ fontSize: '0.675rem', padding: '0.1rem 0.4rem' }}>
                            Member
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          • {d.author_university}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                          {new Date(d.created_at).toLocaleDateString()}
                        </span>

                        {(user && (user.id === d.user_id || isOwner)) && (
                          <button
                            type="button"
                            onClick={() => handleDelete(d.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)', padding: '0.2rem' }}
                            title="Delete message"
                            aria-label="Delete message"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {d.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Message Input Form */}
          {user ? (
            <form onSubmit={handlePost} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={
                  activeTab === 'public_qa'
                    ? 'Ask a question about this project...'
                    : 'Post a team update or coordination note...'
                }
                className="form-input"
                style={{ flex: 1 }}
                disabled={posting}
              />
              <button
                type="submit"
                disabled={posting || !messageText.trim()}
                className="btn btn-primary"
                style={{ flexShrink: 0 }}
              >
                <Send size={14} />
                <span>{posting ? 'Posting...' : 'Post'}</span>
              </button>
            </form>
          ) : (
            <div style={{ marginTop: '1rem', padding: '0.85rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Want to participate in this discussion? </span>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Log in to post
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
