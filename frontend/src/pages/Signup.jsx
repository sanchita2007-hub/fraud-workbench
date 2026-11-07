import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network, Mail, Lock, User, ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Investigator');

  const handleSignup = (e) => {
    e.preventDefault();
    // Abhi ke liye direct login bhej rahe hain
    console.log("Signing up with:", name, email, password, role);
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <Network size={32} color="#3B82F6" /> FraudGraph AI
        </div>
        <h2>Create an Account</h2>
        <p className="auth-subtitle">Join the next-gen fraud investigation team.</p>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

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

          <div className="input-group select-group">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Investigator">Fraud Investigator</option>
              <option value="Analyst">Data Analyst</option>
            </select>
          </div>

          <button type="submit" className="btn-auth-submit">
            Sign Up <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
}