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
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Inclusive Classrooms.<span className="accent-star">*</span><br />
              <span className="gradient-primary">AI-Driven Comfort.</span>
            </h1>
            <p className="hero-subtitle">
              Advanced AI analyzes physical inabilities and constrictions to generate custom, 3D-printable assistive tools. Empowering every learner to reach their full potential without the wait.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-accent">Start Assessment Free</button>
              <button className="btn btn-outline">See How It Works ↗</button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="dashboard-window">
               <div className="window-header">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
               </div>
               <img src="/hero-african.png" alt="Dashboard Mockup" className="window-img" />
               <div className="floating-card stat-card float-left">
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <h4 style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)'}}>Analysis Complete</h4>
                    <p style={{margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)'}}>99.8% Accuracy</p>
                  </div>
               </div>
               <div className="floating-card stl-card float-right">
                  <div className="icon" style={{fontSize: '2rem'}}>🚀</div>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                     <h4 style={{margin: 0, fontSize: '1.1rem', fontWeight: 'bold'}}>STL Blueprint Ready</h4>
                     <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)'}}>Click to Download</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tech Stack Banner Section */}
      <div className="logo-banner">
        <div className="banner-text">
          <span className="stars">⚡</span>
          Built with cutting-edge technology
        </div>
        <div className="marquee-container">
          <div className="marquee">
            <span>React.js</span>
            <span>Firebase</span>
            <span>Gemini AI Pro</span>
            <span>Flutter</span>
            <span>Google Cloud</span>
            {/* Duplicated for smooth infinite scroll */}
            <span>React.js</span>
            <span>Firebase</span>
            <span>Gemini AI Pro</span>
            <span>Flutter</span>
            <span>Google Cloud</span>
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
              <p>Our algorithms identify physical inabilities and constrictions from simple video captures in real-time, calculating precise anatomical adjustments.</p>
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
              Hi, I'm an engineer and the creator of Form-Fit Learner. I spent a lot of time observing how standardized learning environments fail to address the nuance of individual physical inabilities and constrictions.
            </p>
            <p>
              That's why I built Form-Fit. To bridge the gap between cutting-edge AI technology and practical classroom reality without wait times.
            </p>
            <div className="creator-quote">
              "We're not just 3D printing plastic. We're printing access, comfort, and focus."
              <br/><br/>
              <strong style={{color: 'var(--primary)'}}>- Developer & Founder</strong>
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
