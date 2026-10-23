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
  CheckCircle2,
  GitBranch,
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
        className="bg-grid"
        style={{
          padding: '6rem 0 5rem',
          position: 'relative',
          borderBottom: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        {/* Glow backdrop */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', textAlign: 'center', maxWidth: '880px' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: '#93c5fd',
              fontSize: '0.825rem',
              fontWeight: 600,
              letterSpacing: '0.01em',
              marginBottom: '1.75rem',
              boxShadow: '0 0 20px -2px rgba(37, 99, 235, 0.2)',
            }}
          >
            <Sparkles size={13} style={{ color: 'var(--accent)' }} />
            <span>Student Project Collaboration Platform</span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              marginBottom: '1.5rem',
              lineHeight: 1.12,
            }}
          >
            Find Your Team. <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Build Something Great.
            </span>
          </h1>

          {/* Core Message */}
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              marginBottom: '2.5rem',
              maxWidth: '660px',
              margin: '0 auto 2.5rem',
            }}
          >
            Find the right teammates, turn your ideas into projects, and build something meaningful together.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '3.5rem',
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

          {/* Trust Metric Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2.5rem',
              flexWrap: 'wrap',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
              <span>Skill-Matched Teammates</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
              <span>Capacity Protected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
              <span>Cross-University Network</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
              Built for Software Builders
            </span>
            <h2 style={{ marginBottom: '0.75rem' }}>Engineered for Real Collaboration</h2>
            <p style={{ maxWidth: '580px', margin: '0 auto' }}>
              TeamUp removes the friction of assembling project teams across academic courses and hackathon sprints.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                }}
              >
                <Code size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Skill-Based Discovery</h3>
              <p style={{ fontSize: '0.885rem', lineHeight: 1.55 }}>
                Filter projects by required technical proficiencies like React, Python, or MySQL to discover initiatives where your strengths create direct impact.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                <Target size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Capacity & Role Control</h3>
              <p style={{ fontSize: '0.885rem', lineHeight: 1.55 }}>
                Manage team sizes with strict database constraints. Avoid overcrowded teams and ensure every contributor has defined ownership.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--success-subtle)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Campus Identity</h3>
              <p style={{ fontSize: '0.885rem', lineHeight: 1.55 }}>
                Evaluate applications with verified university and department credentials, GitHub repository portfolios, and technical proficiencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
              Workflow
            </span>
            <h2 style={{ marginBottom: '0.75rem' }}>How TeamUp Works</h2>
            <p style={{ maxWidth: '540px', margin: '0 auto' }}>
              A structured lifecycle from pitch to team collaboration.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ backgroundColor: 'var(--bg-card)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.85rem',
                }}
              >
                01 // DISCOVER OR PUBLISH
              </span>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.65rem' }}>Define Project Scope</h3>
              <p style={{ fontSize: '0.885rem' }}>
                Browse ongoing initiatives or publish your own project concept specifying target team size, goals, and technical stacks.
              </p>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg-card)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent)',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.85rem',
                }}
              >
                02 // CONNECT & APPLY
              </span>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.65rem' }}>Apply with Skills</h3>
              <p style={{ fontSize: '0.885rem' }}>
                Submit a join request specifying what you bring to the team. Leads review candidate profiles, code repositories, and technical skills.
              </p>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg-card)' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--success)',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.85rem',
                }}
              >
                03 // COLLABORATE & SHIP
              </span>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.65rem' }}>Form Official Roster</h3>
              <p style={{ fontSize: '0.885rem' }}>
                Accepted applicants become active members on the project team, access collaboration links, and build on schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects (Live from DB) */}
      <section style={{ padding: '5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
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
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
                Active Opportunities
              </span>
              <h2 style={{ marginBottom: '0.35rem' }}>Featured Projects</h2>
              <p>Teams actively recruiting contributors right now.</p>
            </div>
            <Link
              to="/projects"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>View Directory</span>
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
                Publish Project
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Disciplines & Categories */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Explore Collaboration Domains</h2>
            <p>From hackathon prototypes to multi-semester academic engineering.</p>
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
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
