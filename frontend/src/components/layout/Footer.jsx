import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand & mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="brand">
              <div className="brand-icon">
                <Users size={18} />
              </div>
              <span>TeamUp</span>
            </div>
            <p style={{ fontSize: '0.9rem', maxWidth: '340px' }}>
              A student project collaboration platform helping university students discover project ideas, find teammates based on skills, and build impactful software together.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                <Code2 size={12} />
                <span>Open for Collaboration</span>
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                <Shield size={12} />
                <span>Student Verified</span>
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/projects" className="nav-link">Explore Projects</Link>
              </li>
              <li>
                <Link to="/projects/create" className="nav-link">Create a Project</Link>
              </li>
              <li>
                <Link to="/dashboard" className="nav-link">Student Dashboard</Link>
              </li>
              <li>
                <Link to="/my-projects" className="nav-link">My Projects</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Popular Fields</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/projects?category=Web+Development" className="nav-link">Web Development</Link>
              </li>
              <li>
                <Link to="/projects?category=AI+%26+Machine+Learning" className="nav-link">AI & Machine Learning</Link>
              </li>
              <li>
                <Link to="/projects?category=Cybersecurity" className="nav-link">Cybersecurity</Link>
              </li>
              <li>
                <Link to="/projects?category=Mobile+App" className="nav-link">Mobile Applications</Link>
              </li>
            </ul>
          </div>

          {/* Universities */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Universities</h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              Connecting engineering and science students across BUET, DU, NSU, BRAC, IUT, and universities worldwide.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} TeamUp. Find Your Team. Build Something Great.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>Built for students and hackathons</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
