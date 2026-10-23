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
  PieChart as PieIcon,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
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

  // Analytics Chart Data
  const statOverviewData = [
    { name: 'Projects Owned', count: stats.createdProjectsCount || 0, fill: '#3b82f6' },
    { name: 'Active Teams', count: stats.activeMembershipsCount || 0, fill: '#10b981' },
    { name: 'Received Reqs', count: stats.pendingReceivedCount || 0, fill: '#f59e0b' },
    { name: 'Sent Reqs', count: stats.sentRequestsCount || 0, fill: '#8b5cf6' },
  ];

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
          borderColor: 'var(--border-card)',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <h1 style={{ fontSize: '1.6rem' }}>Welcome back, {user?.name}</h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {user?.department} • {user?.university}
          </p>

          {/* Profile completion */}
          <div style={{ marginTop: '1rem', maxWidth: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <span>Profile Completion</span>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{profileCompletion}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${profileCompletion}%`,
                  height: '100%',
                  backgroundColor: profileCompletion === 100 ? 'var(--success)' : 'var(--accent)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            {profileCompletion < 100 && (
              <Link
                to="/profile"
                style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'inline-block', marginTop: '0.35rem' }}
              >
                Complete profile to increase collaboration matches →
              </Link>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/projects/create" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Create Project</span>
          </Link>
          <Link to="/projects" className="btn btn-secondary">
            <FolderGit2 size={16} />
            <span>Discover Teams</span>
          </Link>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>PROJECTS OWNED</p>
              <h3 style={{ fontSize: '1.75rem' }}>{stats.createdProjectsCount || 0}</h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)' }}>
              <FolderGit2 size={20} />
            </div>
          </div>
          <Link to="/my-projects" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem' }}>
            <span>Manage projects</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>ACTIVE MEMBERSHIPS</p>
              <h3 style={{ fontSize: '1.75rem' }}>{stats.activeMembershipsCount || 0}</h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--success-subtle)', color: 'var(--success)', borderRadius: 'var(--radius-sm)' }}>
              <Users size={20} />
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-block', marginTop: '0.75rem' }}>
            External collaborator roles
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>REQUESTS RECEIVED</p>
              <h3 style={{ fontSize: '1.75rem' }}>{stats.pendingReceivedCount || 0}</h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--warning-subtle)', color: 'var(--warning)', borderRadius: 'var(--radius-sm)' }}>
              <Inbox size={20} />
            </div>
          </div>
          <Link to="/requests" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem' }}>
            <span>Review applicants</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>REQUESTS SENT</p>
              <h3 style={{ fontSize: '1.75rem' }}>{stats.sentRequestsCount || 0}</h3>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', borderRadius: 'var(--radius-sm)' }}>
              <Send size={20} />
            </div>
          </div>
          <Link to="/requests" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem' }}>
            <span>Track applications</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Analytics Chart & Pending Requests Row */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Recharts Analytics Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem' }}>Collaboration Activity Metrics</h3>
          </div>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox size={18} style={{ color: 'var(--warning)' }} />
              <h3 style={{ fontSize: '1.1rem' }}>Pending Applicant Requests</h3>
            </div>
            <Link to="/requests" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
              View All
            </Link>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {receivedRequests.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-subtle)' }}>
                No pending join requests to review right now.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {receivedRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '0.85rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserAvatar name={req.applicant_name} size="sm" />
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            {req.applicant_name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginLeft: '0.5rem' }}>
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

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        onClick={() => handleRequestStatus(req.id, 'accepted')}
                        disabled={actionLoading === req.id}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.775rem' }}
                      >
                        <Check size={13} />
                        <span>Accept</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRequestStatus(req.id, 'rejected')}
                        disabled={actionLoading === req.id}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.775rem' }}
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
          <Link to="/requests" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
            View Application History
          </Link>
        </div>

        {memberships.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Users}
              title="No Team Memberships Yet"
              description="You have not joined any project teams yet. Discover recruiting initiatives and submit an application."
              actionText="Explore Projects"
              actionLink="/projects"
            />
          </div>
        ) : (
          <div className="grid-3">
            {memberships.map((m) => (
              <div key={m.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary">{m.role || 'Member'}</span>
                    <span className="badge badge-neutral">{m.category}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{m.title}</h4>
                  <p style={{ fontSize: '0.85rem' }}>Project Owner: {m.owner_name}</p>
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
            <p style={{ fontSize: '0.85rem' }}>New opportunities recruiting university teammates.</p>
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
