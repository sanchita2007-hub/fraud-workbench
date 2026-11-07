import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Mail, Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Investigator');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const res = await axios.post('http://127.0.0.1:8000/api/auth/login', { email, password });
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("userName", res.data.user.name);
        localStorage.setItem("userRole", res.data.user.role);
        navigate('/dashboard');
      } else {
        // SIGNUP
        await axios.post('http://127.0.0.1:8000/api/auth/signup', { name, email, password, role });
        alert("Account created successfully! Please login.");
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <Network size={32} color="#3B82F6" /> FraudGraph AI
        </div>

        <div className="auth-tabs">
          <button type="button" className={`tab-btn ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(""); }}>Login</button>
          <button type="button" className={`tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(""); }}>Sign Up</button>
        </div>

        <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: '#EF4444', padding: '10px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}

          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {!isLogin && (
            <div className="input-group select-group">
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Investigator">Fraud Investigator</option>
                <option value="Analyst">Data Analyst</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}