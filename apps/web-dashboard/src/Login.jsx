import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Chrome, ShieldCheck, UserPlus } from 'lucide-react';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(isSignUp ? 'Sign up failed. Try a different email.' : 'Invalid email or password. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setError('Google Sign-In failed.');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-logo" style={{ background: 'transparent' }}>
            <img src="/logo.png" alt="Form-Fit Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h1>
          <p>{isSignUp ? 'Sign up to create your Form-Fit Dashboard' : 'Sign in to access your Form-Fit Dashboard'}</p>
        </div>

        <form onSubmit={handleEmailAuth} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                id="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                id="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn primary-btn" disabled={loading}>
            {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
            {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button onClick={handleGoogleLogin} className="login-btn google-btn">
          <Chrome size={18} />
          Sign in with Google
        </button>

        <div className="login-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
            <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
              {isSignUp ? ' Sign In' : ' Sign Up'}
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f4f8;
          font-family: 'Inter', sans-serif;
        }
        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .login-logo {
          width: 70px;
          height: 70px;
          background: #3b82f6;
          color: white;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .login-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 8px;
        }
        .login-header p {
          color: #718096;
          font-size: 14px;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 8px;
        }
        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }
        .input-wrapper input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 2px solid #edf2f7;
          border-radius: 12px;
          font-size: 15px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .input-wrapper input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .error-message {
          padding: 10px;
          background: #fff5f5;
          color: #c53030;
          border-radius: 8px;
          font-size: 13px;
          text-align: center;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.1s, background 0.2s;
        }
        .login-btn:active {
          transform: scale(0.98);
        }
        .primary-btn {
          background: #3b82f6;
          color: white;
        }
        .primary-btn:hover {
          background: #2563eb;
        }
        .primary-btn:disabled {
          background: #93c5fd;
          cursor: not-allowed;
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 20px 0;
          color: #a0aec0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #edf2f7;
        }
        .divider span {
          margin: 0 10px;
          font-size: 12px;
          font-weight: 600;
        }
        .google-btn {
          background: white;
          color: #4a5568;
          border: 2px solid #edf2f7;
        }
        .google-btn:hover {
          background: #f7fafc;
        }
        .login-footer {
          margin-top: 25px;
          text-align: center;
          font-size: 14px;
          color: #718096;
        }
        .login-footer a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Login;
