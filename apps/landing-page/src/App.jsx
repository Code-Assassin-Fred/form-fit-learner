import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo-section">
            <img src="/logo.png" alt="Form-Fit Learner Logo" className="logo" />
            <span className="logo-text">Form-Fit Learner</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#about">About</a>
            <button 
              className="btn btn-outline" 
              style={{padding: '8px 20px'}}
              onClick={() => window.location.href = 'http://localhost:5174/login'}
            >
              Sign In
            </button>
            <button className="btn btn-accent" style={{padding: '8px 24px'}}>Get App</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <div className="hero-text-area">
            <h1 className="hero-title">
              Personalized Ergonomics. <br />
              <span className="gradient-text">AI-Driven Comfort.</span>
            </h1>
            <p className="hero-subtitle">
              We use advanced AI to analyze learning postures and generate custom, 3D-printable 
              assistive tools. Empowering every learner to reach their full potential.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-primary">Start New Assessment</button>
              <button className="btn btn-outline">Watch Video</button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">98%</span>
                <span className="stat-label">Accuracy</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">500+</span>
                <span className="stat-label">Tools Printed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">24h</span>
                <span className="stat-label">Design Turnaround</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="glass-card hero-card">
              <img src="/hero-placeholder.png" alt="AI Ergonomic Analysis" className="hero-img" />
              <div className="floating-badge top-right">
                <span className="badge-icon">✨</span>
                <span className="badge-text">AI Analysis Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">From Assessment to Assistive Tool</h2>
          <p className="section-subtitle">A seamless 4-step process powered by Gemini AI.</p>
        </div>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">01</div>
            <h4>Capture</h4>
            <p>Record a short video of the learner's classroom activity via our mobile app.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <div className="step-number">02</div>
            <h4>Analyze</h4>
            <p>Our AI identifies ergonomic barriers and calculates precise adjustment needs.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <div className="step-number">03</div>
            <h4>Generate</h4>
            <p>Instantly receive a custom 3D-printable STL blueprint tailored to the student.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <div className="step-number">04</div>
            <h4>Print</h4>
            <p>Download the file and output the assistive tool on any standard 3D printer.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2 className="section-title">Why Form-Fit Learner?</h2>
          <p className="section-subtitle">Cutting-edge technology meets empathetic design.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon orange-bg">🤖</div>
            <h3>AI-Driven Analysis</h3>
            <p>Our proprietary algorithms identify physical learning barriers from simple video captures in real-time.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon blue-bg">🖨️</div>
            <h3>Generative 3D Design</h3>
            <p>Automatically convert assessment data into custom STL blueprints for 3D-printable assistive tools.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon yellow-bg">🏫</div>
            <h3>Inclusive Classrooms</h3>
            <p>Scalable solutions for educators to provide mass personalization for students with diverse needs.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/logo.png" alt="Logo" className="footer-logo" />
            <p>&copy; 2026 Form-Fit Learner. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#">Dashboard</a>
              <a href="#">Mobile App</a>
              <a href="#">iOS App</a>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
