import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Network, ArrowRight, Activity, Lock, Zap, CheckCircle, Database } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Background Glowing Orbs */}
      <div className="glow-circle glow-1"></div>
      <div className="glow-circle glow-2"></div>
      <div className="grid-overlay"></div>

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="logo">
          <Network size={28} color="#3B82F6" className="logo-icon" /> FraudGraph AI
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/login')} className="btn-login">Log In</button>
          <button onClick={() => navigate('/login')} className="btn-signup">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-badge">
          <Zap size={14} color="#F59E0B" /> Next-Gen Financial Security Platform
        </div>
        
        <h1 className="hero-title">
          Detect Fraud Before It <br />
          <span className="gradient-text">Happens.</span>
        </h1>
        
        <p className="hero-subtitle">
          Uncover hidden relationships, circular money transfers, and shared devices using our advanced Graph Neural Network and Human-in-the-loop Investigation Workspace.
        </p>

        <div className="hero-buttons">
          <button onClick={() => navigate('/login')} className="btn-primary-large">
            Launch Workbench <ArrowRight size={20} />
          </button>
          
          {/* YAHAN UPDATE KIYA HAI */}
          <button onClick={() => navigate('/docs')} className="btn-secondary-large">
            View Documentation
          </button>
        </div>

        {/* Trust Badges */}
        <div className="trust-badges">
          <div className="trust-item"><CheckCircle size={16} color="#10B981"/> Graph Database (Neo4j)</div>
          <div className="trust-item"><CheckCircle size={16} color="#10B981"/> Explainable Alerts</div>
          <div className="trust-item"><CheckCircle size={16} color="#10B981"/> Real-time NetworkX Engine</div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Activity color="#3B82F6" size={24} />
            </div>
            <h3>Real-time Detection</h3>
            <p>Instantly flag circular transfers, layering, and structuring anomalies as transaction data flows in.</p>
          </div>
          
          <div className="feature-card">
            <div className="icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <Network color="#10B981" size={24} />
            </div>
            <h3>Interactive Graph</h3>
            <p>Visualize complex networks of accounts, devices, and beneficiaries in 2D with intuitive node exploration.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <ShieldCheck color="#EF4444" size={24} />
            </div>
            <h3>Explainable AI</h3>
            <p>Every alert comes with a traceable evidence trail and human-led feedback loop for case resolution.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <h2>99.9%</h2>
            <p>Detection Accuracy</p>
          </div>
          <div className="stat-item">
            <h2>&lt; 2s</h2>
            <p>Graph Processing Time</p>
          </div>
          <div className="stat-item">
            <h2>100%</h2>
            <p>Evidence Traceability</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 FraudGraph AI. Built for Enterprise Fraud Investigation.</p>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Database size={16} /> <span>Powered by Neo4j & FastAPI</span>
          <Lock size={16} style={{ marginLeft: '10px' }} /> <span>Bank-grade Security</span>
        </div>
      </footer>
    </div>
  );
}