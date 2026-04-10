'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page-bg font-inter">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 h-24 z-[100] flex items-center transition-all duration-300 ${scrolled ? 'bg-black/70 backdrop-blur-xl border-b border-white/10' : ''}`}>
        <div className="w-full max-w-[1400px] mx-auto px-[5%] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-outfit font-bold text-xl text-text-main tracking-tight">Form-Fit Learner</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#mission" className="text-text-muted hover:text-text-main transition-color duration-200 font-medium text-[0.95rem]">Mission</a>
            <a href="#features" className="text-text-muted hover:text-text-main transition-color duration-200 font-medium text-[0.95rem]">Features</a>
            <a href="#creator" className="text-text-muted hover:text-text-main transition-color duration-200 font-medium text-[0.95rem]">About</a>
            <button 
              onClick={() => router.push('/login')}
              className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-text-main backdrop-blur-md hover:bg-white/10 hover:border-white/30 transition-all font-medium text-[0.9rem]"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-7 py-2 rounded-full bg-white text-bg-main hover:bg-white/90 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.25)] transition-all font-bold text-[0.9rem]"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-[150px] pb-24 px-[5%] min-h-[90vh] flex justify-center items-center relative">
        <div className="max-w-[1400px] w-full flex flex-col items-center">
          <div className="text-center max-w-[1000px] mb-[60px]">
            <h1 className="text-5xl md:text-7xl font-outfit font-extrabold leading-[1.15] mb-6 tracking-tight">
              Inclusive Classrooms.<span className="text-text-muted font-light text-[0.8em] align-top ml-1">*</span><br />
              <span className="bg-gradient-to-r from-brand-primary to-[#007BFF] bg-clip-text text-transparent">AI-Driven Comfort.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted max-w-[700px] mx-auto mb-10 leading-relaxed">
              Advanced AI analyzes physical inabilities and constrictions to generate custom, 3D-printable assistive tools. Empowering every learner to reach their full potential.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => router.push('/login')}
                className="px-9 py-3.5 rounded-full font-outfit font-semibold text-lg bg-gradient-to-br from-brand-primary to-[#00A3FF] text-black shadow-[0_8px_32px_rgba(0,229,255,0.4)] hover:shadow-[0_12px_40px_rgba(0,229,255,0.6)] hover:brightness-110 transition-all transform hover:-translate-y-0.5"
              >
                Start Assessment Free
              </button>
              <button className="px-9 py-3.5 rounded-full font-outfit font-semibold text-lg bg-white/5 border border-white/10 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/30 transition-all">
                See How It Works ↗
              </button>
            </div>
          </div>
          
          <div className="w-full max-w-[1000px] relative z-10 transition-transform duration-500 hover:scale-[1.02]">
            <div className="rounded-[20px] bg-black/80 border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,229,255,0.15)] backdrop-blur-xl p-3 relative transform perspective-[1200px] rotate-x-4">
               <div className="flex gap-2 px-3 pb-4 pt-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#27C93F]"></span>
               </div>
               <img src="/hero-african.png" alt="Dashboard Mockup" className="w-full rounded-xl block" />
               
               {/* Floating Cards */}
               <div className="absolute -left-16 bottom-[15%] glass-card p-4 px-6 flex items-center gap-4 animate-float">
                  <div className="flex flex-col items-start font-inter">
                    <h4 className="m-0 text-[0.9rem] text-text-muted">Analysis Complete</h4>
                    <p className="m-0 text-xl font-bold text-brand-primary">99.8% Accuracy</p>
                  </div>
               </div>
               <div className="absolute -right-12 top-[15%] glass-card p-4 px-6 flex items-center gap-4 animate-float delay-3000">
                  <div className="text-2xl">🚀</div>
                  <div className="flex flex-col items-start font-inter">
                     <h4 className="m-0 text-lg font-bold">STL Blueprint Ready</h4>
                     <p className="m-0 text-[0.85rem] text-text-muted">Click to Download</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Marquee Banner */}
      <div className="py-[60px] border-y border-white/10 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent overflow-hidden flex flex-col items-center">
        <div className="text-[0.9rem] text-text-muted font-semibold uppercase tracking-[2px] mb-[30px] flex items-center gap-2.5">
          <span className="text-brand-accent tracking-[2px]">⚡</span>
          Built with cutting-edge technology
        </div>
        <div className="w-full overflow-hidden relative overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max gap-20 px-10 animate-marquee">
            {['React.js', 'Firebase', 'Gemini AI Pro', 'Flutter', 'Google Cloud'].map((tech, i) => (
              <span key={i} className="text-2xl font-outfit font-semibold text-text-muted opacity-50 hover:opacity-100 transition-opacity whitespace-nowrap">{tech}</span>
            ))}
            {/* Duplicated for scroll */}
            {['React.js', 'Firebase', 'Gemini AI Pro', 'Flutter', 'Google Cloud'].map((tech, i) => (
              <span key={i+5} className="text-2xl font-outfit font-semibold text-text-muted opacity-50 hover:opacity-100 transition-opacity whitespace-nowrap">{tech}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section id="mission" className="py-32 px-[5%] max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="font-inter">
            <h2 className="text-5xl md:text-7xl font-outfit font-extrabold leading-[1.1] mb-[30px]">One assessment.<br/><span className="text-brand-primary">Endless potential.</span></h2>
            <p className="text-lg md:text-xl text-text-muted mb-10">
              Traditional ergonomic tools are expensive, slow to arrive, and rarely fit perfectly. A growing student needs solutions that adapt as fast as they do.
            </p>
            <p className="text-lg md:text-xl text-text-muted mb-10">
              By combining mobile video capture with generative AI, we skip the supply chain entirely. What used to take months now takes minutes. From classroom recording directly to your school's 3D printer.
            </p>
            <button className="px-9 py-3.5 rounded-full bg-white text-bg-main hover:bg-white/90 shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-all font-bold text-lg">
              Read the Whitepaper
            </button>
          </div>
          <div className="relative aspect-[4/5] glass-card shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
             <img src="/Image 2.jpg" alt="Mission" className="w-full h-full object-cover opacity-60 hover:opacity-90 transition-opacity duration-300" />
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section id="features" className="py-32 px-[5%] max-w-[1400px] mx-auto w-full">
        <div className="text-center mb-[60px]">
          <h2 className="text-5xl md:text-6xl font-outfit font-bold mb-4">Generative design, simplified.</h2>
          <p className="text-text-muted text-xl">Everything you need to support your students' physical needs.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(300px,auto)] gap-6">
          <div className="glass-card md:col-span-2 md:row-span-2 p-10 flex flex-col group">
            <div className="mb-auto">
              <h3 className="text-3xl md:text-4xl font-outfit font-bold mb-4 max-w-[80%]">Proprietary AI Kinematic Analysis</h3>
              <p className="text-text-muted text-lg">Our algorithms identify physical inabilities and constrictions from simple video captures in real-time, calculating precise anatomical adjustments.</p>
            </div>
            <div className="pt-[30px] flex justify-center items-center relative h-64 overflow-hidden">
               <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary blur-[20px] opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"></div>
            </div>
          </div>
          
          <div className="glass-card md:row-span-2 p-10 flex flex-col">
            <h3 className="text-3xl font-outfit font-bold mb-4 text-brand-secondary">Instant STLs</h3>
            <p className="text-text-muted text-lg">Automatically convert assessment data into custom STL blueprints ready for any standard 3D printer.</p>
          </div>
          
          <div className="glass-card p-10 flex flex-col">
            <h3 className="text-3xl font-outfit font-bold mb-4 text-brand-accent">FERPA Compliant</h3>
            <p className="text-text-muted text-lg">Enterprise-grade security ensures all student video data is processed anonymously and securely.</p>
          </div>
          
          <div className="glass-card p-10 flex flex-col">
            <h3 className="text-3xl font-outfit font-bold mb-4">Mass Personalization</h3>
            <p className="text-text-muted text-lg">Scalable software solutions for special-ed departments to provide individualized tools at scale.</p>
          </div>
        </div>
      </section>

      {/* Creator */}
      <section id="creator" className="py-32 px-[5%] bg-white/[0.02] border-t border-white/10 w-full">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">
          <div className="relative aspect-square rounded-full overflow-hidden max-w-[500px] mx-auto border border-white/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] group">
            <img src="/Image 5.png" alt="Founder" className="w-full h-full object-cover opacity-80 grayscale-[80%] contrast-[1.1] group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
          </div>
          <div className="font-inter">
            <h2 className="text-5xl font-outfit font-bold mb-6">Built for the 1 in 5.</h2>
            <p className="text-xl text-text-muted mb-5">
              Hi, I'm an engineer and the creator of Form-Fit Learner. I spent a lot of time observing how standardized learning environments fail to address the nuance of individual physical inabilities and constrictions.
            </p>
            <p className="text-xl text-text-muted">
              That's why I built Form-Fit. To bridge the gap between cutting-edge AI technology and practical classroom reality without wait times.
            </p>
            <div className="mt-10 pl-5 border-l-4 border-brand-primary italic text-xl text-text-main">
              "We're not just 3D printing plastic. We're printing access, comfort, and focus."
              <br/><br/>
              <strong className="text-brand-primary not-italic">- Developer & Founder</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-bg py-16 px-[5%] border-t border-white/10 bg-bg-card">
        <div className="max-w-[1400px] mx-auto flex flex-wrap justify-between gap-10">
          <div className="max-w-[300px]">
            <img src="/logo.png" alt="Logo" className="h-8 mb-4 invert brightness-0" />
            <p className="text-text-muted text-[0.9rem]">&copy; 2026 Form-Fit Learner. All rights reserved.</p>
          </div>
          <div className="flex gap-20">
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-outfit font-bold mb-1 text-text-main">Product</h4>
              <a href="#" className="text-text-muted hover:text-text-main text-[0.95rem]">Dashboard</a>
              <a href="#" className="text-text-muted hover:text-text-main text-[0.95rem]">Mobile App</a>
              <a href="#" className="text-text-muted hover:text-text-main text-[0.95rem]">3D Library</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-outfit font-bold mb-1 text-text-main">Company</h4>
              <a href="#" className="text-text-muted hover:text-text-main text-[0.95rem]">About</a>
              <a href="#" className="text-text-muted hover:text-text-main text-[0.95rem]">Contact</a>
              <a href="#" className="text-text-muted hover:text-text-main text-[0.95rem]">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
