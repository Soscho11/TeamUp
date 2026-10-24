import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import ProjectCard from '../../components/projects/ProjectCard';
import { bookmarkService } from '../../services/bookmarkService';
import {
  FolderGit2,
  PlusCircle,
  Users,
  Inbox,
  Edit,
  Trash2,
  ExternalLink,
  Layers,
  CheckCircle,
  Bookmark,
} from 'lucide-react';

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

const STATUS_OPTIONS = [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function MyProjectsPage() {
  const [activeTab, setActiveTab] = useState('created');
  const [projects, setProjects] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete project state
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit project modal state
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchBookmarks = async () => {
    try {
      setBookmarksLoading(true);
      const res = await bookmarkService.getUserBookmarks();
      setBookmarks(res.data?.projects || []);
    } catch (err) {
      console.error('Failed to load bookmarks:', err.message);
    } finally {
      setBookmarksLoading(false);
    }
  };

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getMyProjects();
      setProjects(data || []);
      // Also pre-fetch bookmarks count
      const bmRes = await bookmarkService.getUserBookmarks();
      setBookmarks(bmRes.data?.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleting(true);
      await projectService.deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      await fetchMyProjects();
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenEdit = (project) => {
    setProjectToEdit(project);
    setEditFormData({
      title: project.title,
      summary: project.summary,
      description: project.description || '',
      category: project.category,
      desired_team_size: project.desired_team_size,
      status: project.status,
    });
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!projectToEdit) return;

    try {
      setSavingEdit(true);
      setEditError('');
      await projectService.updateProject(projectToEdit.id, editFormData);
      setProjectToEdit(null);
      await fetchMyProjects();
    } catch (err) {
      setEditError(err.message || 'Failed to update project');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleQuickStatusChange = async (projectId, newStatus) => {
    try {
      await projectService.updateProject(projectId, { status: newStatus });
      await fetchMyProjects();
    } catch (err) {
      alert(err.message || 'Failed to change status');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your created projects..." />;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <ErrorState title="Error Loading Projects" message={error} onRetry={fetchMyProjects} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>
            {activeTab === 'created' ? 'My Created Projects' : 'Saved Watchlist'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'created'
              ? 'Manage membership rosters, applicant join requests, and project life cycles.'
              : 'Keep track of student projects and teams you have bookmarked.'}
          </p>
        </div>

        {activeTab === 'created' && (
          <Link to="/projects/create" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>New Project</span>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', marginBottom: '1.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('created')}
          className="btn btn-sm"
          style={{
            backgroundColor: activeTab === 'created' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'created' ? 'var(--text-main)' : 'var(--text-muted)',
            boxShadow: activeTab === 'created' ? 'var(--shadow-subtle)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <FolderGit2 size={14} />
          <span>Projects I Lead ({projects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('bookmarks');
            fetchBookmarks();
          }}
          className="btn btn-sm"
          style={{
            backgroundColor: activeTab === 'bookmarks' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'bookmarks' ? 'var(--text-main)' : 'var(--text-muted)',
            boxShadow: activeTab === 'bookmarks' ? 'var(--shadow-subtle)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Bookmark size={14} />
          <span>Saved Watchlist ({bookmarks.length})</span>
        </button>
      </div>

      {activeTab === 'bookmarks' ? (
        bookmarks.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Bookmark}
              title="No Saved Projects"
              description="You have not saved any projects yet. Browse Explore Projects and click the bookmark icon to save them here."
              actionText="Explore Projects"
              actionLink="/projects"
            />
          </div>
        ) : (
          <div className="grid-3">
            {bookmarks.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onBookmarkChange={(id, isSaved) => {
                  if (!isSaved) {
                    setBookmarks((prev) => prev.filter((b) => b.id !== id));
                  }
                }}
              />
            ))}
          </div>
        )
      ) : projects.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderGit2}
            title="No Projects Created Yet"
            description="You have not published any projects yet. Pitch your idea to discover university teammates."
            actionText="Publish Your First Project"
            actionLink="/projects/create"
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {projects.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-neutral">
                      <Layers size={11} />
                      <span>{p.category}</span>
                    </span>

                    {/* Status selector */}
                    <select
                      value={p.status}
                      onChange={(e) => handleQuickStatusChange(p.id, e.target.value)}
                      className="form-select"
                      style={{
                        width: 'auto',
                        padding: '0.15rem 0.6rem',
                        fontSize: '0.775rem',
                        height: '24px',
                        borderRadius: '9999px',
                        backgroundColor:
                          p.status === 'recruiting'
                            ? 'var(--success-subtle)'
                            : p.status === 'in_progress'
                            ? 'var(--primary-subtle)'
                            : 'var(--bg-card-hover)',
                        color:
                          p.status === 'recruiting'
                            ? '#34d399'
                            : p.status === 'in_progress'
                            ? '#60a5fa'
                            : 'var(--text-muted)',
                        borderColor: 'transparent',
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                    <Link to={`/projects/${p.id}`} style={{ color: 'var(--text-main)' }}>
                      {p.title}
                    </Link>
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '750px' }}>
                    {p.summary}
                  </p>
                </div>

                {/* Top action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="btn btn-secondary btn-sm"
                    title="Edit project details"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectToDelete(p)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Bottom Info Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <Users size={16} />
                    <span>
                      <strong>{p.current_members}</strong> of {p.desired_team_size} members
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Inbox size={16} style={{ color: p.pending_requests_count > 0 ? 'var(--warning)' : 'var(--text-subtle)' }} />
                    <span style={{ color: p.pending_requests_count > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                      <strong>{p.pending_requests_count}</strong> pending request{p.pending_requests_count === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {p.pending_requests_count > 0 && (
                    <Link to="/requests" className="btn btn-primary btn-sm">
                      <Inbox size={14} />
                      <span>Review Requests ({p.pending_requests_count})</span>
                    </Link>
                  )}

                  <Link to={`/projects/${p.id}`} className="btn btn-outline btn-sm">
                    <span>View Public Page</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      <Modal
        isOpen={Boolean(projectToEdit)}
        onClose={() => setProjectToEdit(null)}
        title="Edit Project"
      >
        {editError && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <span>{editError}</span>
          </div>
        )}

        <form onSubmit={handleSaveEdit}>
          <FormField
            label="Project Title"
            id="edit_title"
            value={editFormData.title || ''}
            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            required
          />

          <FormField
            label="Short Summary"
            id="edit_summary"
            value={editFormData.summary || ''}
            onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Category"
              id="edit_category"
              type="select"
              value={editFormData.category || ''}
              onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
              options={CATEGORIES}
              required
            />

            <FormField
              label="Desired Team Size"
              id="edit_team_size"
              type="number"
              min={2}
              max={20}
              value={editFormData.desired_team_size || 4}
              onChange={(e) => setEditFormData({ ...editFormData, desired_team_size: e.target.value })}
              required
            />
          </div>

          <FormField
            label="Project Status"
            id="edit_status"
            type="select"
            value={editFormData.status || 'recruiting'}
            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
            options={STATUS_OPTIONS}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setProjectToEdit(null)}
              disabled={savingEdit}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingEdit}
            >
              {savingEdit ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.title}"? All team memberships and join requests will be permanently removed.`}
        confirmText="Delete Project"
        loading={deleting}
      />
    </div>
  );
}

