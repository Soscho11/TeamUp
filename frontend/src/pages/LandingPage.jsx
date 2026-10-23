import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/projects/ProjectCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import {
  Users,
  Compass,
  PlusCircle,
  Code,
  Sparkles,
  ShieldCheck,
  Target,
  ArrowRight,
  Terminal,
  Cpu,
  Globe,
  Database,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const data = await projectService.getProjects({ limit: 3, status: 'recruiting' });
        setFeaturedProjects(data.projects || []);
      } catch (err) {
        console.error('Failed to load featured projects:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 0 4rem',
          background: 'radial-gradient(ellipse at 50% -10%, rgba(37, 99, 235, 0.18), transparent 70%)',
          borderBottom: '1px solid var(--border-card)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: 'var(--accent)',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={14} />
            <span>Student Project Collaboration Platform</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
              lineHeight: 1.15,
            }}
          >
            Find Your Team. <br />
            <span style={{ color: 'var(--accent)' }}>Build Something Great.</span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
            }}
          >
            Find the right teammates, turn your ideas into projects, and build something meaningful together.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/projects" className="btn btn-primary btn-lg">
              <Compass size={18} />
              <span>Explore Projects</span>
            </Link>

            <Link to="/projects/create" className="btn btn-secondary btn-lg">
              <PlusCircle size={18} />
              <span>Create a Project</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section style={{ padding: '4.5rem 0', borderBottom: '1px solid var(--border-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ marginBottom: '0.75rem' }}>Engineered for University Students</h2>
            <p style={{ maxWidth: '580px', margin: '0 auto' }}>
              Connect with developers, designers, and researchers whose skills directly complement your own.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Code size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Skill-Based Matching</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Filter projects by required technical proficiencies like React, Python, or MySQL to find roles where you can make immediate contributions.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Target size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Organized Team Formation</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Say goodbye to chaotic chat group inquiries. Manage structured applicant requests, capacities, and role assignments in one place.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--success-subtle)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Verified Campus Network</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Collaborate with peers from your university and neighboring institutions with visible department, GitHub, and portfolio credentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '4.5rem 0', borderBottom: '1px solid var(--border-card)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ marginBottom: '0.75rem' }}>How TeamUp Works</h2>
            <p style={{ maxWidth: '540px', margin: '0 auto' }}>
              A straightforward process from concept to team collaboration.
            </p>
          </div>

          <div className="grid-3" style={{ position: 'relative' }}>
            <div className="card" style={{ backgroundColor: 'var(--bg-main)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                STEP 01
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.65rem' }}>Discover or Propose</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Browse existing initiatives across web, AI, and cybersecurity, or publish your own project concept with specific skill requirements.
              </p>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg-main)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.75rem' }}>
                STEP 02
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.65rem' }}>Apply with Skills</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Send a join request explaining what you bring to the team. Project owners review applicant profiles, skills, and portfolios.
              </p>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg-main)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.75rem' }}>
                STEP 03
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.65rem' }}>Collaborate & Ship</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Once accepted, join the official roster, access project repositories, and ship your academic or hackathon build on schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects (Live from DB) */}
      <section style={{ padding: '4.5rem 0', borderBottom: '1px solid var(--border-card)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ marginBottom: '0.5rem' }}>Featured Projects</h2>
              <p>Active projects currently seeking teammates.</p>
            </div>
            <Link
              to="/projects"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>View All Projects</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : featuredProjects.length > 0 ? (
            <div className="grid-3">
              {featuredProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>No featured projects found at this time.</p>
              <Link to="/projects/create" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Create First Project
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Disciplines & Categories */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Explore Collaboration Domains</h2>
            <p>From hackathon sprints to full-semester capstone engineering.</p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.85rem',
              maxWidth: '860px',
              margin: '0 auto',
            }}
          >
            {[
              { label: 'Web Development', icon: Globe },
              { label: 'AI & Machine Learning', icon: Cpu },
              { label: 'Cybersecurity', icon: Lock },
              { label: 'Mobile App', icon: Terminal },
              { label: 'Cloud & DevOps', icon: Database },
              { label: 'Data Science', icon: Target },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.label}
                  to={`/projects?category=${encodeURIComponent(cat.label)}`}
                  className="card card-interactive"
                  style={{
                    padding: '0.85rem 1.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    textDecoration: 'none',
                    color: 'var(--text-main)',
                  }}
                >
                  <Icon size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
