import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import CreateProjectPage from './pages/projects/CreateProjectPage';
import MyProjectsPage from './pages/projects/MyProjectsPage';
import RequestsPage from './pages/requests/RequestsPage';
import ProfilePage from './pages/profile/ProfilePage';
import UserProfilePage from './pages/profile/UserProfilePage';

function NotFound() {
  return (
    <div
      className="container"
      style={{
        padding: '5rem 1rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ maxWidth: '440px', color: 'var(--text-muted)' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <a href="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
        Return to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                <Route path="/profile/:id" element={<UserProfilePage />} />

                {/* Protected Student Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/create"
                  element={
                    <ProtectedRoute>
                      <CreateProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-projects"
                  element={
                    <ProtectedRoute>
                      <MyProjectsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests"
                  element={
                    <ProtectedRoute>
                      <RequestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
