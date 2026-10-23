import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import UserAvatar from '../../components/common/UserAvatar';
import SkillBadge from '../../components/common/SkillBadge';
import FormField from '../../components/common/FormField';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import {
  User,
  GitBranch,
  Globe,
  Plus,
  Save,
  CheckCircle,
  AlertCircle,
  FolderGit2,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'Express.js',
  'MySQL',
  'Python',
  'Machine Learning',
  'TensorFlow',
  'Docker',
  'Cybersecurity',
  'Flutter',
  'TypeScript',
  'Figma',
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    department: '',
    bio: '',
    github_url: '',
    portfolio_url: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Skills state
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');
  const [savingSkills, setSavingSkills] = useState(false);
  const [skillsSuccess, setSkillsSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getMyProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        university: data.university || '',
        department: data.department || '',
        bio: data.bio || '',
        github_url: data.github_url || '',
        portfolio_url: data.portfolio_url || '',
      });
      setSkills(data.skills || []);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      setSavingProfile(true);
      const updated = await userService.updateMyProfile(formData);
      updateUser({
        name: updated.name,
        university: updated.university,
        department: updated.department,
      });
      setProfileSuccess('Profile information updated successfully');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSkill = (skillName, proficiency = 'intermediate') => {
    if (!skillName.trim()) return;
    const trimmed = skillName.trim();
    if (!skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, { name: trimmed, proficiency_level: proficiency }]);
    }
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillName) => {
    setSkills(skills.filter((s) => s.name.toLowerCase() !== skillName.toLowerCase()));
  };

  const handleSaveSkills = async () => {
    try {
      setSavingSkills(true);
      setSkillsSuccess('');
      const updated = await userService.updateMySkills(skills);
      setSkills(updated.skills || []);
      setSkillsSuccess('Technical skills saved successfully');
      setTimeout(() => setSkillsSuccess(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save skills');
    } finally {
      setSavingSkills(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading student profile..." />;
  }

  if (error || !profile) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <ErrorState title="Error Loading Profile" message={error} onRetry={fetchProfile} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1rem', maxWidth: '960px' }}>
      {/* Top Profile Summary Header */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <UserAvatar name={formData.name || user?.name} size="lg" />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{formData.name}</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            {formData.department} • {formData.university}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            {profile.email}
          </span>
        </div>

        <Link to={`/profile/${profile.id}`} className="btn btn-outline btn-sm">
          <span>View Public Profile</span>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        {/* Left Column: Edit Profile Details */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Personal Information</h3>

            {profileSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <FormField
                label="Full Name"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField
                  label="University"
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  required
                />

                <FormField
                  label="Department"
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>

              <FormField
                label="Biography & Interests"
                id="bio"
                type="textarea"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your interests, career ambitions, and past projects..."
                hint="Max 2,000 characters."
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField
                  label="GitHub Profile URL"
                  id="github_url"
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  placeholder="https://github.com/username"
                />

                <FormField
                  label="Portfolio / Website URL"
                  id="portfolio_url"
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://myportfolio.dev"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
                style={{ marginTop: '0.5rem' }}
              >
                <Save size={15} />
                <span>{savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Manage Skills */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Technical Skills</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                {skills.length} / 30 skills
              </span>
            </div>

            {skillsSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>{skillsSuccess}</span>
              </div>
            )}

            {/* Current Skills list */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.5rem', minHeight: '40px' }}>
              {skills.length === 0 ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                  No skills listed yet. Add some below to help team leaders find you.
                </span>
              ) : (
                skills.map((s) => (
                  <SkillBadge
                    key={s.name}
                    name={s.name}
                    proficiency={s.proficiency_level}
                    onRemove={handleRemoveSkill}
                  />
                ))
              )}
            </div>

            {/* Add Custom Skill Form */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Add New Skill
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Flutter, Docker..."
                  className="form-input"
                  style={{ flex: 2 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(newSkillName, newSkillProficiency);
                    }
                  }}
                />
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="form-select"
                  style={{ flex: 1 }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleAddSkill(newSkillName, newSkillProficiency)}
                  className="btn btn-secondary"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Quick suggestions */}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '0.4rem' }}>
                Suggested skills:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {POPULAR_SKILLS.filter(
                  (ps) => !skills.some((s) => s.name.toLowerCase() === ps.toLowerCase())
                )
                  .slice(0, 6)
                  .map((ps) => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => handleAddSkill(ps, 'intermediate')}
                      className="btn btn-ghost btn-sm"
                      style={{
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.75rem',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      + {ps}
                    </button>
                  ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSkills}
              disabled={savingSkills}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <Save size={15} />
              <span>{savingSkills ? 'Saving...' : 'Save Skills Cloud'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
