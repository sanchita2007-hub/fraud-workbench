import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, AlertTriangle, Network, FolderOpen, Search, Download, CheckCircle, XCircle, Check, Trash2, LogOut, Activity } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import './index.css';
import GraphViewer from './components/GraphViewer';
import Landing from './pages/Landing';
import Documentation from './pages/Documentation';
import AuthPage from './pages/AuthPage';

// Yahan aapka naya Render URL set hai
const API_URL = "https://fraud-backend-0h4i.onrender.com";

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#fff',
            border: '1px solid #334155',
          },
        }} 
      />
      
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "Investigator";
  const userRole = localStorage.getItem("userRole") || "Analyst";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo-area">
          <Network size={24} /> FraudGraph AI
        </div>
        <div className="nav-menu">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
            <AlertTriangle size={20} /> Anomaly Alerts
          </div>
          <div className={`nav-item ${activeTab === 'graph' ? 'active' : ''}`} onClick={() => setActiveTab('graph')}>
            <Network size={20} /> Graph Explorer
          </div>
          <div className={`nav-item ${activeTab === 'cases' ? 'active' : ''}`} onClick={() => setActiveTab('cases')}>
            <FolderOpen size={20} /> Case Management
          </div>
          <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            <Activity size={20} /> Audit Logs
          </div>
        </div>
      </div>

      <div className="main-area">
        <div className="topbar">
          <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Financial Fraud Workbench</div>
          
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', lineHeight: '1.2' }}>
                  {userName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {userRole}
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              style={{ background: 'transparent', border: '1px solid #334155', padding: '8px', borderRadius: '8px', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s' }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="content-area">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'alerts' && <Alerts />}
          {activeTab === 'graph' && <GraphExplorer />}
          {activeTab === 'cases' && <Cases />}
          {activeTab === 'audit' && <AuditLogs />}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ transactions: 0, alerts: 0, open_cases: 0, closed_cases: 0 });
  const [chartData, setChartData] = useState({ alerts_by_type: [], recent_activity: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/dashboard/stats`)
      .then(res => setStats(res.data))
      .catch(err => console.error(err));

    axios.get(`${API_URL}/api/dashboard/charts`)
      .then(res => { setChartData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const COLORS = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'];

  return (
    <div>
      <h1 className="page-title">Investigation Dashboard</h1>
      <p className="page-subtitle">Overview of suspicious activities and flagged entities.</p>
      
      <div className="grid-cards" style={{ marginBottom: '30px' }}>
        <div className="stat-card" style={{ borderTop: '3px solid var(--primary)' }}>
          <span className="stat-title">Total Transactions</span>
          <span className="stat-value">{loading ? '...' : stats.transactions}</span>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--danger)' }}>
          <span className="stat-title">Active Alerts</span>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>{loading ? '...' : stats.alerts}</span>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--warning)' }}>
          <span className="stat-title">Open Cases</span>
          <span className="stat-value">{loading ? '...' : stats.open_cases}</span>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--success)' }}>
          <span className="stat-title">Closed Cases</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>{loading ? '...' : stats.closed_cases}</span>
        </div>
      </div>

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Fraud Types Distribution</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData.alerts_by_type} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                    {chartData.alerts_by_type.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', color: 'white', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '12px', marginTop: '10px' }}>
               {chartData.alerts_by_type.map((entry, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                    {entry.name}
                  </div>
               ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Weekly Alert Activity</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.recent_activity}>
                  <XAxis dataKey="name" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1E293B', border: 'none', color: 'white', borderRadius: '8px' }} />
                  <Bar dataKey="alerts" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);

  const fetchAlerts = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/alerts/`)
      .then(res => { setAlerts(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const runDetection = async () => {
    setIsDetecting(true);
    try {
      await axios.post(`${API_URL}/api/alerts/run`);
      toast.success("Detection Engine completed!");
      setTimeout(() => {
        fetchAlerts();
        setIsDetecting(false);
      }, 500);
    } catch (err) {
      toast.error("Detection failed. Backend error.");
      setIsDetecting(false);
    }
  };

  const createCase = async (alertItem) => {
    try {
      await axios.post(`${API_URL}/api/cases/`, {
        title: `Investigation: ${alertItem.alert_type} (${alertItem.account_id})`,
        linked_alert_id: alertItem.id
      });
      
      await axios.post(`${API_URL}/api/audit/`, {
        action: "Created Case",
        user: localStorage.getItem("userName") || "Unknown",
        details: `Alert ID: ${alertItem.id}`
      });

      toast.success("Case created successfully! Check 'Case Management' tab.");
    } catch (error) {
      toast.error("Failed to create case. Check backend.");
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Anomaly Alerts</h1>
          <p className="page-subtitle">AI and Rule-based explanations for flagged transactions.</p>
        </div>
        <button onClick={runDetection} className="btn btn-primary" disabled={isDetecting}>
          <Search size={18} /> {isDetecting ? 'Scanning Database...' : 'Run Detection Engine'}
        </button>
      </div>

      <div className="alert-list" style={{ marginTop: '20px' }}>
        {loading ? <p style={{color: 'var(--text-muted)'}}>Loading...</p> : alerts.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No active alerts found.</p> : null}
        
        {alerts.map((alertItem) => (
          <div key={alertItem.id} className="alert-row">
            <div className="alert-info">
              <h4>{alertItem.alert_type}</h4>
              <p><strong>Account:</strong> {alertItem.account_id}</p>
              <p><strong>Risk Score:</strong> {alertItem.score}</p>
              <p style={{ color: 'var(--text-main)', marginTop: '10px' }}>{alertItem.explanation}</p>
            </div>
            <button onClick={() => createCase(alertItem)} className="btn btn-outline">
              + Create Case
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphExplorer() {
  return (
    <div>
      <h1 className="page-title">Graph Explorer</h1>
      <p className="page-subtitle">Visualize relationships between accounts, devices, and transactions.</p>
      <GraphViewer />
    </div>
  );
}

function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/cases/`)
      .then(res => { setCases(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const markDecision = async (caseId, decision) => {
    try {
      await axios.put(`${API_URL}/api/cases/${caseId}/decision`, { decision });
      
      await axios.post(`${API_URL}/api/audit/`, {
        action: decision,
        user: localStorage.getItem("userName") || "Unknown",
        details: `Case ID: ${caseId}`
      });

      toast.success(`Case marked as: ${decision}`);
      fetchCases();
    } catch (error) {
      toast.error("Failed to update decision");
    }
  };

  const downloadEvidence = async (caseId) => {
    try {
      const res = await axios.get(`${API_URL}/api/cases/${caseId}/export`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Case_${caseId}_Evidence.json`;
      a.click();
      toast.success("Evidence downloaded!");
    } catch (error) { 
      toast.error("Export failed");
    }
  };

  const deleteCase = async (caseId) => {
    if(window.confirm("Are you sure you want to permanently delete this case?")) {
      try {
        await axios.delete(`${API_URL}/api/cases/${caseId}`);
        
        await axios.post(`${API_URL}/api/audit/`, {
          action: "Deleted Case",
          user: localStorage.getItem("userName") || "Unknown",
          details: `Case ID: ${caseId}`
        });

        toast.success("Case deleted successfully!");
        fetchCases();
      } catch (error) {
        toast.error("Failed to delete case.");
      }
    }
  };

  useEffect(() => { fetchCases(); }, []);

  return (
    <div>
      <h1 className="page-title">Case Management</h1>
      <p className="page-subtitle">Manage investigations, attach evidence, and record final decisions.</p>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading cases...</p> : cases.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No cases found. Create one from the Alerts tab.</p> : null}

        {cases.map((c) => (
          <div key={c.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', borderLeft: `4px solid ${c.decision === 'Confirmed Fraud' ? 'var(--danger)' : c.decision === 'False Positive' ? 'var(--success)' : 'var(--primary)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px' }}>{c.title}</h3>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>{c.status}</span>
            </div>
            
            {c.evidence && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
                <p><strong>Linked Alert:</strong> {c.evidence.alert_type}</p>
                <p style={{ color: 'var(--text-muted)' }}><strong>Explanation:</strong> {c.evidence.explanation}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {c.decision ? (
                <p style={{ color: c.decision === 'Confirmed Fraud' ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {c.decision === 'Confirmed Fraud' ? <XCircle size={18}/> : <CheckCircle size={18}/>} {c.decision}
                </p>
              ) : (
                <>
                  <button onClick={() => markDecision(c.id, 'Confirmed Fraud')} className="btn btn-danger">Confirm Fraud</button>
                  <button onClick={() => markDecision(c.id, 'False Positive')} className="btn btn-success">Mark False Positive</button>
                </>
              )}
              
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                <button onClick={() => downloadEvidence(c.id)} className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                  <Download size={16} /> Export Evidence
                </button>
                
                <button onClick={() => deleteCase(c.id)} className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/audit/`)
      .then(res => setLogs(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="page-title">Audit Trail</h1>
      <p className="page-subtitle">Immutable record of all investigator actions.</p>

      <div className="card" style={{ marginTop: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Timestamp</th>
              <th style={{ padding: '12px' }}>User</th>
              <th style={{ padding: '12px' }}>Action</th>
              <th style={{ padding: '12px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No activity recorded yet.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #1E293B' }}>
                  <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{log.user}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: log.action.includes('Fraud') ? 'rgba(239, 68, 68, 0.2)' : log.action.includes('False') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: log.action.includes('Fraud') ? 'var(--danger)' : log.action.includes('False') ? 'var(--success)' : 'var(--primary)',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;