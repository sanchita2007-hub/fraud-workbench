import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, ShieldAlert, GitMerge, FolderCheck, HelpCircle } from 'lucide-react';
import './Documentation.css';

export default function Documentation() {
  const navigate = useNavigate();

  return (
    <div className="doc-container">
      {/* Navbar */}
      <nav className="doc-nav">
        <button onClick={() => navigate('/')} className="btn-back">
          <ArrowLeft size={18} /> Back to Home
        </button>
        <h2>Platform Documentation</h2>
      </nav>

      <main className="doc-content">
        <div className="doc-header">
          <h1>How FraudGraph AI Works</h1>
          <p>Follow this step-by-step guide to navigate the Investigation Workspace.</p>
        </div>

        {/* Step-by-Step Guide */}
        <div className="steps-grid">
          
          <div className="step-card">
            <div className="step-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <UploadCloud size={28} />
            </div>
            <h3>1. Data Ingestion</h3>
            <p>Upload your transaction CSV files. The system uses <strong>Pandas</strong> to validate schema and stores data securely in <strong>PostgreSQL</strong>.</p>
          </div>

          <div className="step-card">
            <div className="step-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
              <ShieldAlert size={28} />
            </div>
            <h3>2. Anomaly Detection</h3>
            <p>Click <strong>"Run Detection Engine"</strong>. Our Python rules scan for Circular Transfers and Rapid Structuring, generating explainable alerts.</p>
          </div>

          <div className="step-card">
            <div className="step-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <GitMerge size={28} />
            </div>
            <h3>3. Graph Exploration</h3>
            <p>Search any Account ID in the <strong>Graph Explorer</strong>. Visualize how money is looping between accounts and devices using Neo4j.</p>
          </div>

          <div className="step-card">
            <div className="step-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
              <FolderCheck size={28} />
            </div>
            <h3>4. Case Management</h3>
            <p>Convert alerts into Cases. Investigators can attach evidence, mark <strong>False Positives</strong> (to train the system), or Confirm Fraud.</p>
          </div>
        </div>

        {/* Glossary Section */}
        <div className="glossary-section">
          <h2><HelpCircle size={24} /> Key Terminologies</h2>
          
          <div className="glossary-item">
            <h4>Circular Transfer (Loop)</h4>
            <p>When money is moved A → B → C → A in a closed loop to hide the illegal source of funds (Money Laundering).</p>
          </div>
          
          <div className="glossary-item">
            <h4>False Positive</h4>
            <p>When the system flags a transaction as suspicious, but a human investigator determines it was a normal transaction.</p>
          </div>

          <div className="glossary-item">
            <h4>Shared Device</h4>
            <p>When multiple different bank accounts are accessed from the same physical device (e.g., one iPhone), indicating a possible fraud ring.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '16px' }}>
            Ready to Investigate? Launch Workbench
          </button>
        </div>
      </main>
    </div>
  );
}