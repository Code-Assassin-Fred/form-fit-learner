import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'glass-nav' : ''}`}>
        <div className="nav-container">
          <div className="logo-section">
            <img src="/logo.png" alt="Form-Fit Learner Logo" className="logo" />
            <span className="logo-text">Form-Fit Learner</span>
          </div>
          <div className="nav-links">
            <a href="#mission" className="nav-link">Mission</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#creator" className="nav-link">About</a>
            <button 
              className="btn btn-outline" 
              style={{padding: '8px 24px', fontSize: '0.9rem'}}
              onClick={() => window.location.href = 'http://localhost:5174/login'}
            >
              Sign In
            </button>
            <button 
              className="btn btn-primary" 
              style={{padding: '8px 28px', fontSize: '0.9rem', color: '#000', background: '#fff'}}
            >
              Get App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero section-padding">
        <h1 className="hero-title">
          Inclusive Classrooms.<span className="accent-star">*</span><br />
          <span className="gradient-primary">AI-Driven Comfort.</span>
        </h1>
        <p className="hero-subtitle">
          Advanced AI analyzes learning postures to generate custom, 3D-printable assistive tools. Empowering every learner to reach their full potential without the wait.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-accent">Start Assessment Free</button>
          <button className="btn btn-outline">See How It Works ↗</button>
        </div>
        
        <div className="hero-visual">
          <div className="hero-mockup" style={{ overflow: 'hidden', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
             <img src="/hero-african.png" alt="Dashboard Mockup" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>
      </header>

      {/* Logo Banner Section */}
      <div className="logo-banner">
        <div className="banner-text">
          <span className="stars">★★★★★</span>
          Trusted by pioneering educators
        </div>
        <div className="marquee-container">
          <div className="marquee">
            <span>Stanford Prep</span>
            <span>Oakville Districts</span>
            <span>SpecialEd Tech</span>
            <span>NYC Public Schools</span>
            <span>EdTech Innovators</span>
            {/* Duplicated for smooth infinite scroll */}
            <span>Stanford Prep</span>
            <span>Oakville Districts</span>
            <span>SpecialEd Tech</span>
            <span>NYC Public Schools</span>
            <span>EdTech Innovators</span>
          </div>
        </div>
      </div>

      {/* Mission / Problem Section (SharingMe style) */}
      <section id="mission" className="section-padding">
        <div className="mission-section">
          <div className="mission-content">
            <h2>One assessment.<br/><span>Endless potential.</span></h2>
            <p>
              Traditional ergonomic tools are expensive, slow to arrive, and rarely fit perfectly. A growing student needs solutions that adapt as fast as they do.
            </p>
            <p>
              By combining mobile video capture with generative AI, we skip the supply chain entirely. What used to take months now takes minutes. From classroom recording directly to your school's 3D printer.
            </p>
            <button className="btn btn-primary" style={{marginTop: '20px'}}>Read the Whitepaper</button>
          </div>
          <div className="mission-visual">
             <img src="/Image 2.jpg" alt="Mobile App Mockup" className="mockup-img" />
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="section-padding">
        <div className="features-header">
          <h2>Generative design, simplified.</h2>
          <p style={{color: 'var(--text-muted)', fontSize: '1.2rem'}}>Everything you need to support your students' physical needs.</p>
        </div>
        
        <div className="bento-grid">
          {/* Card 1: Large */}
          <div className="glass-card bento-item large">
            <div className="bento-content">
              <h3>Proprietary AI Kinematic Analysis</h3>
              <p>Our algorithms identify physical learning barriers from simple video captures in real-time, calculating precise anatomical adjustments.</p>
            </div>
            <div className="feature-visual">
               <div className="abstract-shape"></div>
            </div>
          </div>
          
          {/* Card 2: Tall */}
          <div className="glass-card bento-item tall">
            <div className="bento-content">
              <h3 style={{color: 'var(--secondary)'}}>Instant STLs</h3>
              <p>Automatically convert assessment data into custom STL blueprints ready for any standard 3D printer.</p>
            </div>
          </div>
          
          {/* Card 3: Standard */}
          <div className="glass-card bento-item">
            <div className="bento-content">
              <h3 style={{color: 'var(--accent)'}}>FERPA Compliant</h3>
              <p>Enterprise-grade security ensures all student video data is processed anonymously and securely.</p>
            </div>
          </div>
          
          {/* Card 4: Standard */}
          <div className="glass-card bento-item">
            <div className="bento-content">
              <h3>Mass Personalization</h3>
              <p>Scalable software solutions for special-ed departments to provide individualized tools at scale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section id="creator" className="section-padding creator-section">
        <div className="creator-grid">
          <div className="creator-image-wrapper">
            <img src="/Image 5.png" alt="Creator Portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="creator-info">
            <h2>Built for the 1 in 5.</h2>
            <p>
              As a former educator, I spent countless hours watching brilliant students struggle with generic classroom furniture. Standardized tools fail to address the nuance of individual physical needs.
            </p>
            <p>
              I built Form-Fit to bridge the gap between cutting-edge AI and practical classroom reality.
            </p>
            <div className="creator-quote">
              "We're not just 3D printing plastic. We're printing access, comfort, and focus."
              <br/><br/>
              <strong style={{color: 'var(--primary)'}}>- The Founder</strong>
            </div>
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
              <a href="#">3D Print Library</a>
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
