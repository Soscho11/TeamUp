import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import UserAvatar from '../../components/common/UserAvatar';
import SkillBadge from '../../components/common/SkillBadge';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import {
  Inbox,
  Send,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Users,
} from 'lucide-react';

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Withdraw request confirmation
  const [requestToWithdraw, setRequestToWithdraw] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const [received, sent] = await Promise.all([
        requestService.getReceivedRequests(),
        requestService.getSentRequests(),
      ]);
      setReceivedRequests(received || []);
      setSentRequests(sent || []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId, status) => {
    try {
      setActionLoading(requestId);
      await requestService.updateRequestStatus(requestId, status);
      await fetchRequests();
    } catch (err) {
      alert(err.message || `Failed to update request to ${status}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async () => {
    if (!requestToWithdraw) return;
    try {
      setActionLoading(requestToWithdraw.id);
      await requestService.updateRequestStatus(requestToWithdraw.id, 'withdrawn');
      setRequestToWithdraw(null);
      await fetchRequests();
    } catch (err) {
      alert(err.message || 'Failed to withdraw application');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'pending':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={12} />
            <span>Pending</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle size={12} />
            <span>Accepted</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <XCircle size={12} />
            <span>Rejected</span>
          </span>
        );
      case 'withdrawn':
        return (
          <span className="badge badge-neutral">Withdrawn</span>
        );
      default:
        return <span className="badge badge-neutral">{st}</span>;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading join requests..." />;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <ErrorState title="Error Loading Requests" message={error} onRetry={fetchRequests} />
      </div>
    );
  }

  const pendingReceivedCount = receivedRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="container" style={{ padding: '2.5rem 1rem', maxWidth: '960px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Join Requests & Applications</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review applicant submissions for your projects and track applications you sent to other teams.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-card)',
          marginBottom: '2rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('received')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'received' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'received' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.95rem',
            padding: '0.75rem 0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-1px',
          }}
        >
          <Inbox size={17} />
          <span>Received Applications</span>
          {pendingReceivedCount > 0 && (
            <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>
              {pendingReceivedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sent' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'sent' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.95rem',
            padding: '0.75rem 0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-1px',
          }}
        >
          <Send size={17} />
          <span>Sent Applications</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            ({sentRequests.length})
          </span>
        </button>
      </div>

      {/* Tab 1: Received Requests */}
      {activeTab === 'received' && (
        <div>
          {receivedRequests.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Inbox}
                title="No Applications Received"
                description="When students submit join requests to your projects, they will appear here for your review."
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {receivedRequests.map((req) => (
                <div key={req.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {/* Applicant Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <UserAvatar name={req.applicant_name} size="md" />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Link
                            to={`/profile/${req.applicant_id}`}
                            style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}
                          >
                            {req.applicant_name}
                          </Link>
                          {getStatusBadge(req.status)}
                        </div>
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                          {req.applicant_department} • {req.applicant_university}
                        </span>
                      </div>
                    </div>

                    {/* Project applied to */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Project:</span>
                      <Link
                        to={`/projects/${req.project_id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: 'var(--accent)',
                        }}
                      >
                        <span>{req.project_title}</span>
                        <ExternalLink size={12} />
                      </Link>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        Capacity: {req.current_members} / {req.desired_team_size} filled
                      </span>
                    </div>
                  </div>

                  {/* Applicant Message */}
                  {req.message && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      "{req.message}"
                    </div>
                  )}

                  {/* Applicant Skills */}
                  {req.applicant_skills && req.applicant_skills.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.4rem' }}>
                        Applicant Skills:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {req.applicant_skills.map((s, i) => (
                          <SkillBadge key={i} name={s.name} proficiency={s.proficiency_level} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.85rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-subtle)',
                    }}
                  >
                    <span>Submitted on {formatDate(req.created_at)}</span>

                    {req.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.65rem' }}>
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(req.id, 'accepted')}
                          disabled={actionLoading === req.id || req.current_members >= req.desired_team_size}
                          className="btn btn-primary btn-sm"
                        >
                          <Check size={14} />
                          <span>Accept Application</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(req.id, 'rejected')}
                          disabled={actionLoading === req.id}
                          className="btn btn-secondary btn-sm"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                        Application is {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sent Requests */}
      {activeTab === 'sent' && (
        <div>
          {sentRequests.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Send}
                title="No Applications Sent"
                description="Browse active projects and apply to join teams that match your skills."
                actionText="Explore Projects"
                actionLink="/projects"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {sentRequests.map((req) => (
                <div key={req.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-neutral">{req.project_category}</span>
                        {getStatusBadge(req.status)}
                      </div>

                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                        <Link to={`/projects/${req.project_id}`} style={{ color: 'var(--text-main)' }}>
                          {req.project_title}
                        </Link>
                      </h3>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        Project Lead: {req.owner_name} ({req.owner_email})
                      </p>
                    </div>

                    {req.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => setRequestToWithdraw(req)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--text-subtle)' }}
                      >
                        Withdraw Application
                      </button>
                    )}
                  </div>

                  {req.message && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '0.25rem' }}>
                        Your application message:
                      </span>
                      "{req.message}"
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-subtle)',
                    }}
                  >
                    <span>Applied on {formatDate(req.created_at)}</span>
                    <Link to={`/projects/${req.project_id}`} style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>View Project Page</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdraw Confirmation */}
      <ConfirmationDialog
        isOpen={Boolean(requestToWithdraw)}
        onClose={() => setRequestToWithdraw(null)}
        onConfirm={handleWithdraw}
        title="Withdraw Application"
        message={`Are you sure you want to withdraw your application for "${requestToWithdraw?.project_title}"?`}
        confirmText="Withdraw"
        isDestructive={false}
        loading={actionLoading === requestToWithdraw?.id}
      />
    </div>
  );
}
