import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import FormField from '../../components/common/FormField';
import SkillBadge from '../../components/common/SkillBadge';
import { PlusCircle, AlertCircle, Plus, Layers, Users, GitBranch } from 'lucide-react';

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

const COLLABORATION_TYPES = [
  { value: 'academic', label: 'Academic Course Project' },
  { value: 'hackathon', label: 'Hackathon Competition' },
  { value: 'open_source', label: 'Open Source Initiative' },
  { value: 'startup', label: 'Startup Prototype' },
  { value: 'hobby', label: 'Personal / Hobby Project' },
];

export default function CreateProjectPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    category: 'Web Development',
    desired_team_size: 4,
    collaboration_type: 'academic',
    repository_url: '',
    goals: '',
  });

  const [skills, setSkills] = useState(['React', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const trimmed = skillInput.trim();
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Project title is required';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Project title must be at least 3 characters';
    }

    if (!formData.summary.trim()) {
      errs.summary = 'Short summary is required';
    } else if (formData.summary.trim().length < 10) {
      errs.summary = 'Summary must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Detailed description is required';
    } else if (formData.description.trim().length < 20) {
      errs.description = 'Description must be at least 20 characters';
    }

    const size = parseInt(formData.desired_team_size, 10);
    if (isNaN(size) || size < 2 || size > 20) {
      errs.desired_team_size = 'Team size must be between 2 and 20';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    try {
      setLoading(true);
      const newProject = await projectService.createProject({
        ...formData,
        skills,
      });
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      setApiError(err.message || 'Failed to publish project. Please check the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Create a New Project</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Publish your concept, define desired skills, and assemble your student team.
        </p>
      </div>

      {apiError && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2.25rem' }}>
        {/* Title */}
        <FormField
          label="Project Title"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. CampusRide — Student Carpooling Platform"
          error={errors.title}
          required
        />

        {/* Short Summary */}
        <FormField
          label="Short Summary"
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          placeholder="Brief 1-2 sentence pitch shown on project cards and search results..."
          error={errors.summary}
          hint="Keep it concise and clear (10 to 300 characters)."
          required
        />

        {/* Category & Collaboration Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <FormField
            label="Domain Category"
            id="category"
            type="select"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={CATEGORIES}
            required
          />

          <FormField
            label="Collaboration Type"
            id="collaboration_type"
            type="select"
            value={formData.collaboration_type}
            onChange={(e) => setFormData({ ...formData, collaboration_type: e.target.value })}
            options={COLLABORATION_TYPES}
            required
          />
        </div>

        {/* Team Size */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <FormField
            label="Desired Team Size (including Owner)"
            id="desired_team_size"
            type="number"
            min={2}
            max={20}
            value={formData.desired_team_size}
            onChange={(e) => setFormData({ ...formData, desired_team_size: e.target.value })}
            error={errors.desired_team_size}
            hint="Total students on the team (e.g. 4 means you plus 3 teammates)."
            required
          />

          <FormField
            label="Repository URL (Optional)"
            id="repository_url"
            type="url"
            value={formData.repository_url}
            onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
            placeholder="https://github.com/username/project"
            hint="Link to GitHub, GitLab, or Bitbucket repository."
          />
        </div>

        {/* Full Description */}
        <FormField
          label="Detailed Project Description"
          id="description"
          type="textarea"
          rows={6}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the problem, the proposed solution, target users, and the architecture you envision..."
          error={errors.description}
          required
        />

        {/* Goals */}
        <FormField
          label="Milestones & Goals (Optional)"
          id="goals"
          type="textarea"
          rows={3}
          value={formData.goals}
          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
          placeholder="What do you plan to achieve first? (e.g. prototype for midterm, submission before hackathon deadline)"
        />

        {/* Skills Tag Input */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">
            <span>Required Skills & Technologies</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. React, Express, Python, Docker"
              className="form-input"
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn btn-secondary"
            >
              <Plus size={15} />
              <span>Add</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {skills.map((skill) => (
              <SkillBadge
                key={skill}
                name={skill}
                onRemove={handleRemoveSkill}
              />
            ))}
          </div>
          <span className="form-hint" style={{ marginTop: '0.4rem', display: 'block' }}>
            Press Enter or click Add to append a required skill.
          </span>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ minWidth: '150px' }}
          >
            <PlusCircle size={16} />
            <span>{loading ? 'Publishing...' : 'Publish Project'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
