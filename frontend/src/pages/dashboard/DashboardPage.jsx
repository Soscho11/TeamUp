import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { projectService } from '../../services/projectService';
import { requestService } from '../../services/requestService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import ProjectCard from '../../components/projects/ProjectCard';
import UserAvatar from '../../components/common/UserAvatar';
import EmptyState from '../../components/common/EmptyState';
import {
  FolderGit2,
  Users,
  Inbox,
  Send,
  PlusCircle,
  ArrowRight,
  Check,
  X,
  ExternalLink,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await projectService.getDashboard();
      setData(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRequestStatus = async (requestId, status) => {
    try {
      setActionLoading(requestId);
      await requestService.updateRequestStatus(requestId, status);
      await fetchDashboard();
    } catch (err) {
      alert(err.message || `Failed to ${status} request`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading student dashboard..." />;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <ErrorState title="Dashboard Error" message={error} onRetry={fetchDashboard} />
      </div>
    );
  }

  const {
    profileCompletion = 0,
    stats = {},
    createdProjects = [],
    receivedRequests = [],
    sentRequests = [],
    memberships = [],
    recentProjects = [],
  } = data || {};

  const statOverviewData = [
    { name: 'Projects Owned', count: stats.createdProjectsCount || 0, fill: '#3b82f6' },
    { name: 'Active Teams', count: stats.activeMembershipsCount || 0, fill: '#10b981' },
    { name: 'Received Reqs', count: stats.pendingReceivedCount || 0, fill: '#f59e0b' },
    { name: 'Sent Reqs', count: stats.sentRequestsCount || 0, fill: '#8b5cf6' },
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(21, 29, 46, 0.95), rgba(13, 18, 28, 0.95))',
          borderColor: 'var(--border-card)',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          padding: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.65rem' }}>Welcome back, {user?.name}</h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {user?.department} • {user?.university}
          </p>

          {/* Profile completion meter */}
          <div style={{ marginTop: '1.25rem', maxWidth: '340px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-subtle)', fontWeight: 500 }}>Profile Completeness</span>
              <span style={{ fontWeight: 700, color: profileCompletion === 100 ? 'var(--success)' : 'var(--accent)' }}>
                {profileCompletion}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${profileCompletion}%`,
                  height: '100%',
                  background: profileCompletion === 100 ? 'var(--success)' : 'linear-gradient(90deg, #3b82f6, #38bdf8)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            {profileCompletion < 100 && (
              <Link
                to="/profile"
                style={{ fontSize: '0.775rem', color: 'var(--accent)', display: 'inline-block', marginTop: '0.4rem', fontWeight: 500 }}
              >
                Complete profile for higher matching visibility →
              </Link>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/projects/create" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Create Project</span>
          </Link>
          <Link to="/projects" className="btn btn-secondary">
            <FolderGit2 size={16} />
            <span>Explore Teams</span>
          </Link>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Projects Owned
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.createdProjectsCount || 0}</h3>
            </div>
            <div style={{ padding: '0.55rem', backgroundColor: 'var(--primary-subtle)', color: '#60a5fa', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <FolderGit2 size={18} />
            </div>
          </div>
          <Link to="/my-projects" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.85rem', fontWeight: 500 }}>
            <span>Manage projects</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Active Teams
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.activeMembershipsCount || 0}</h3>
            </div>
            <div style={{ padding: '0.55rem', backgroundColor: 'var(--success-subtle)', color: '#34d399', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Users size={18} />
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-block', marginTop: '0.85rem' }}>
            External collaborator roles
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Requests Received
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.pendingReceivedCount || 0}</h3>
            </div>
            <div style={{ padding: '0.55rem', backgroundColor: 'var(--warning-subtle)', color: '#fcd34d', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <Inbox size={18} />
            </div>
          </div>
          <Link to="/requests" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.85rem', fontWeight: 500 }}>
            <span>Review applicants</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Requests Sent
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{stats.sentRequestsCount || 0}</h3>
            </div>
            <div style={{ padding: '0.55rem', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
              <Send size={18} />
            </div>
          </div>
          <Link to="/requests" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.85rem', fontWeight: 500 }}>
            <span>Track applications</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Analytics Chart & Pending Requests Row */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Recharts Analytics Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={17} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Collaboration Activity Metrics</h3>
          </div>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d121c',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {statOverviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Join Requests Received */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Inbox size={17} style={{ color: 'var(--warning)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Pending Applicant Requests</h3>
            </div>
            <Link to="/requests" style={{ fontSize: '0.785rem', color: 'var(--accent)', fontWeight: 500 }}>
              View All ({receivedRequests.length})
            </Link>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {receivedRequests.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.885rem' }}>
                No pending join requests to review right now.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {receivedRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <UserAvatar name={req.applicant_name} size="sm" />
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.865rem', color: 'var(--text-main)' }}>
                            {req.applicant_name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginLeft: '0.45rem' }}>
                            {req.applicant_university}
                          </span>
                        </div>
                      </div>
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                        Pending
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Applying for: <strong style={{ color: 'var(--text-main)' }}>{req.project_title}</strong>
                    </div>

                    {req.message && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                        "{req.message}"
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => handleRequestStatus(req.id, 'accepted')}
                        disabled={actionLoading === req.id}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.775rem' }}
                      >
                        <Check size={13} />
                        <span>Accept</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRequestStatus(req.id, 'rejected')}
                        disabled={actionLoading === req.id}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.775rem' }}
                      >
                        <X size={13} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Team Memberships */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>My Active Team Memberships</h3>
          <Link to="/requests" style={{ fontSize: '0.825rem', color: 'var(--accent)', fontWeight: 500 }}>
            Application History
          </Link>
        </div>

        {memberships.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Users}
              title="No Team Memberships Yet"
              description="You have not joined any external project teams yet. Discover recruiting initiatives and submit an application."
              actionText="Explore Projects"
              actionLink="/projects"
            />
          </div>
        ) : (
          <div className="grid-3">
            {memberships.map((m) => (
              <div key={m.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span className="badge badge-primary">{m.role || 'Member'}</span>
                    <span className="badge badge-neutral">{m.category}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{m.title}</h4>
                  <p style={{ fontSize: '0.85rem' }}>Project Lead: {m.owner_name}</p>
                </div>
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                  <Link to={`/projects/${m.id}`} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>Project Overview</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Platform Projects */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3>Recently Published Projects</h3>
            <p style={{ fontSize: '0.85rem' }}>New initiatives seeking university teammates.</p>
          </div>
          <Link to="/projects" className="btn btn-ghost btn-sm">
            <span>Browse All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="card">
            <EmptyState title="No recent projects" description="Be the first to publish a project!" />
          </div>
        ) : (
          <div className="grid-2">
            {recentProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
