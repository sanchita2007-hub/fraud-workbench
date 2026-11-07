import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network, Mail, Lock, ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Abhi ke liye hum direct dashboard bhej rahe hain
    // Baad mein yahan backend se token aayega
    console.log("Logging in with:", email, password);
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <Network size={32} color="#3B82F6" /> FraudGraph AI
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to your investigation workspace.</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-auth-submit">
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}