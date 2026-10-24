import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import Modal from '../common/Modal';
import FormField from '../common/FormField';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  CheckSquare,
  PlusCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';

export default function ProjectKanbanBoard({ projectId, members = [], isMember, isOwner }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const canEdit = isMember || isOwner;

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await taskService.getTasks(projectId);
      setTasks(res.data?.tasks || []);
    } catch (err) {
      setError(err.message || 'Failed to load project tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      setFormError('Task title is required');
      return;
    }

    try {
      setCreating(true);
      setFormError('');
      await taskService.createTask(projectId, {
        title: taskForm.title.trim(),
        description: taskForm.description ? taskForm.description.trim() : null,
        priority: taskForm.priority,
        assigned_to: taskForm.assigned_to ? parseInt(taskForm.assigned_to, 10) : null,
        due_date: taskForm.due_date || null,
      });

      setIsModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
        due_date: '',
      });
      await fetchTasks();
    } catch (err) {
      setFormError(err.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (!canEdit) return;
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await taskService.updateTask(taskId, { status: newStatus });
    } catch (err) {
      await fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!canEdit) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await taskService.deleteTask(taskId);
    } catch (err) {
      await fetchTasks();
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const totalCount = tasks.length;
  const completedCount = completedTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="badge badge-danger" style={{ fontSize: '0.675rem' }}>High</span>;
      case 'medium':
        return <span className="badge badge-warning" style={{ fontSize: '0.675rem' }}>Medium</span>;
      default:
        return <span className="badge badge-neutral" style={{ fontSize: '0.675rem' }}>Low</span>;
    }
  };

  const renderTaskCard = (task) => (
    <div
      key={task.id}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <h5 style={{ fontSize: '0.885rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.35 }}>
          {task.title}
        </h5>
        {canEdit && (
          <button
            type="button"
            onClick={() => handleDeleteTask(task.id)}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--text-subtle)', padding: '0.15rem' }}
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {task.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {task.description}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {renderPriorityBadge(task.priority)}
          {task.assignee_name && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <User size={11} />
              <span>{task.assignee_name}</span>
            </span>
          )}
        </div>

        {task.due_date && (
          <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={11} />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </span>
        )}
      </div>

      {/* Task status transitions */}
      {canEdit && (
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
          {task.status !== 'todo' && (
            <button
              type="button"
              onClick={() => handleStatusChange(task.id, 'todo')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', flex: 1 }}
            >
              Move to To Do
            </button>
          )}
          {task.status !== 'in_progress' && (
            <button
              type="button"
              onClick={() => handleStatusChange(task.id, 'in_progress')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', flex: 1 }}
            >
              Start
            </button>
          )}
          {task.status !== 'completed' && (
            <button
              type="button"
              onClick={() => handleStatusChange(task.id, 'completed')}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', flex: 1 }}
            >
              <CheckCircle2 size={12} />
              <span>Complete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="card" style={{ marginTop: '1.75rem' }}>
      {/* Header & Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Milestones & Tasks</h3>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              {totalCount === 0 ? 'No tasks yet' : `${completedCount} of ${totalCount} completed (${completionPercentage}%)`}
            </span>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={14} />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: `${completionPercentage}%`,
              height: '100%',
              backgroundColor: 'var(--success)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Kanban Columns */}
      {loading ? (
        <div style={{ padding: '2rem 0', textAlign: 'center' }}>
          <LoadingSpinner message="Loading task board..." />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Column 1: To Do */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                To Do
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                {todoTasks.length}
              </span>
            </div>
            {todoTasks.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
                No tasks to do
              </div>
            ) : (
              todoTasks.map(renderTaskCard)
            )}
          </div>

          {/* Column 2: In Progress */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                In Progress
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                {inProgressTasks.length}
              </span>
            </div>
            {inProgressTasks.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
                No tasks in progress
              </div>
            ) : (
              inProgressTasks.map(renderTaskCard)
            )}
          </div>

          {/* Column 3: Completed */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Completed
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                {completedTasks.length}
              </span>
            </div>
            {completedTasks.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
                No tasks completed yet
              </div>
            ) : (
              completedTasks.map(renderTaskCard)
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Milestone Task"
      >
        {formError && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateTask}>
          <FormField label="Task Title" required>
            <input
              type="text"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g. Design authentication API schema"
              className="form-input"
            />
          </FormField>

          <FormField label="Description (Optional)">
            <textarea
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Provide context, acceptance criteria, or relevant links..."
              className="form-textarea"
            />
          </FormField>

          <div className="grid-2">
            <FormField label="Priority">
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="form-select"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </FormField>

            <FormField label="Assign To (Optional)">
              <select
                value={taskForm.assigned_to}
                onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                className="form-select"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Due Date (Optional)">
            <input
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              className="form-input"
            />
          </FormField>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
              disabled={creating}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
