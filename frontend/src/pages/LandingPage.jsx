import React, { useEffect, useState } from 'react';
import { Building2, CalendarCheck, CheckCircle2, LayoutDashboard } from 'lucide-react';
import api from '../services/api';
import '../index.css';

const LandingPage = () => {
  const [backendStatus, setBackendStatus] = useState('Checking connection...');

  useEffect(() => {
    api.get('/test')
      .then(res => setBackendStatus('Connected to Central API'))
      .catch(err => setBackendStatus('Backend connection offline'));
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo-container">
          <Building2 className="logo-icon" size={32} />
          <span className="logo-text">CampusBook</span>
        </div>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#facilities">Facilities</a>
          <a href="#contact">Contact</a>
          <button className="btn-primary-sm" onClick={() => window.location.href='/login'}>Login to Portal</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="badge">Centralized Management System</div>
          <h1 className="hero-title">Manage Venue Booking <br/>Across All Departments.</h1>
          <p className="hero-subtitle">
            A unified scheduling platform for B.E. Engineering, Law, Pharmacy, and Diploma departments. Eliminate conflicts and streamline requests.
          </p>
          <div className="hero-actions">
            <button className="btn-primary">
              <CalendarCheck size={20} /> Request Auditorium 
            </button>
            <button className="btn-secondary">View Schedule</button>
          </div>
        </div>
        
        {/* Abstract Campus Blobs */}
        <div className="glass-decoration blob-1"></div>
        <div className="glass-decoration blob-2"></div>
      </header>

      {/* Features Outline */}
      <section className="features-section">
        <div className="feature-card highlight">
          <div className="feature-icon-wrapper">
            <LayoutDashboard size={28} className="feature-icon" />
          </div>
          <h3>Centralized Dashboard</h3>
          <p>Real-time visibility of auditorium availability across the entire campus.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <CheckCircle2 size={28} className="feature-icon" />
          </div>
          <h3>Conflict Resolution</h3>
          <p>Automated safeguards prevent double-booking across different departments.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper">
            <Building2 size={28} className="feature-icon" />
          </div>
          <h3>Department Coordination</h3>
          <p>Seamless approval workflows managed by campus administration.</p>
        </div>
      </section>

      {/* Status Footer */}
      <footer className="status-footer">
        <div className={`status-indicator ${backendStatus.includes('offline') ? 'offline' : 'online'}`}>
          <span className="pulse-dot"></span>
          {backendStatus}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
