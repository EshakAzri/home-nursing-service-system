import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className={`home-navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="logo-icon">+</span>
            <span className="logo-text">HomeNurse</span>
          </div>
          <div className={`nav-links ${mobileMenuOpen ? 'nav-links-open' : ''}`}>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
            <div className="nav-actions-mobile">
              <button className="nav-btn nav-btn-outline" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="nav-btn nav-btn-solid" onClick={() => navigate('/register')}>
                Get Started
              </button>
            </div>
          </div>
          <div className="nav-actions nav-actions-desktop">
            <button className="nav-btn nav-btn-outline" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="nav-btn nav-btn-solid" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </div>
          <button className="nav-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="hero-content">
          <span className="hero-badge">Trusted by 5,000+ families</span>
          <h1 className="hero-title">
            Quality Healthcare,<br />
            <span className="hero-highlight">Right at Your Doorstep</span>
          </h1>
          <p className="hero-subtitle">
            Connect with certified, compassionate nurses who deliver professional medical care
            in the comfort and safety of your own home.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/register')}>
              <span>Book a Nurse Today</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>
              Sign In to Your Account
            </button>
          </div>
          <div className="hero-stats-row">
            <div className="hero-stat">
              <strong>500+</strong>
              <span>Certified Nurses</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <strong>15,000+</strong>
              <span>Home Visits</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <strong>4.9/5</strong>
              <span>Patient Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-badge">Why Us</span>
          <h2 className="section-title">Why Choose Our Service?</h2>
          <p className="section-desc">We deliver exceptional home healthcare with a personal touch</p>
        </div>
        <div className="features-grid">
          {[
            { icon: '🩺', title: 'Qualified Professionals', desc: 'All nurses are licensed, background-checked, and bring years of clinical experience' },
            { icon: '⏰', title: '24/7 Availability', desc: 'Round-the-clock nursing services available whenever you need them, day or night' },
            { icon: '🏠', title: 'Home Comfort', desc: 'Recover faster in the familiar, comfortable environment of your own home' },
            { icon: '💳', title: 'Transparent Pricing', desc: 'No hidden fees — see costs upfront with flexible payment plans' },
            { icon: '📱', title: 'Easy Online Booking', desc: 'Schedule appointments in seconds with our intuitive booking platform' },
            { icon: '🔒', title: 'Secure & Private', desc: 'Medical data encrypted and protected with industry-leading security standards' },
          ].map((f, i) => (
            <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon-wrap">
                <span className="feature-icon">{f.icon}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-header">
          <span className="section-badge">Simple Process</span>
          <h2 className="section-title">How It Works</h2>
          <p className="section-desc">Get started in just three easy steps</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create an Account</h3>
              <p>Sign up in under a minute. Tell us about your care needs and preferences.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Choose Your Nurse</h3>
              <p>Browse our verified nurses, view profiles and ratings, and pick the perfect match.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Book & Receive Care</h3>
              <p>Schedule a visit at your convenience. Your nurse arrives at your doorstep on time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <div className="section-header">
          <span className="section-badge">Our Expertise</span>
          <h2 className="section-title">Services We Offer</h2>
          <p className="section-desc">Comprehensive home healthcare tailored to every need</p>
        </div>
        <div className="services-grid">
          {[
            { icon: '🩹', title: 'Post-Operative Care', desc: 'Expert monitoring and wound care during your recovery after surgery' },
            { icon: '💊', title: 'Medication Management', desc: 'Timely medication administration, tracking, and coordination with your doctor' },
            { icon: '🫀', title: 'Chronic Disease Care', desc: 'Ongoing support for diabetes, heart conditions, and chronic illnesses' },
            { icon: '👴', title: 'Elder Care', desc: 'Compassionate daily assistance and health monitoring for senior loved ones' },
            { icon: '🦴', title: 'Physical Therapy', desc: 'Guided rehabilitation exercises to restore mobility and strength' },
            { icon: '🩺', title: 'General Checkups', desc: 'Routine health assessments, vitals monitoring, and wellness checks at home' },
          ].map((s, i) => (
            <div className="service-card" key={i}>
              <div className="service-icon">{s.icon}</div>
              <div className="service-info">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-header">
          <span className="section-badge">Testimonials</span>
          <h2 className="section-title">What Our Patients Say</h2>
          <p className="section-desc">Real stories from families we've cared for</p>
        </div>
        <div className="testimonials-grid">
          {[
            { name: 'Sarah M.', role: 'Patient', text: 'The nurse who cared for my mother was incredibly kind and professional. We felt so much more at ease having her at home instead of the hospital.', rating: 5 },
            { name: 'James R.', role: 'Family Member', text: 'Booking was effortless and the nurse arrived right on time. The post-surgery care was outstanding — my recovery was much smoother thanks to them.', rating: 5 },
            { name: 'Priya K.', role: 'Patient', text: 'I was nervous about home nursing, but the entire experience exceeded my expectations. Affordable, professional, and truly caring. Highly recommend!', rating: 5 },
          ].map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="testimonial-stars">
                {'★'.repeat(t.rating)}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to Experience Better Healthcare?</h2>
          <p>Join thousands of families who trust HomeNurse for their home healthcare needs</p>
          <div className="cta-buttons">
            <button className="btn btn-cta" onClick={() => navigate('/register')}>
              Create Your Free Account
            </button>
            <button className="btn btn-cta-outline" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">+</span>
              <span className="logo-text">HomeNurse</span>
            </div>
            <p>Professional home nursing care that puts your family's health and comfort first.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="#features">Features</a>
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Testimonials</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#about">About Us</a>
            <a href="#careers">Careers</a>
            <a href="#contact">Contact</a>
            <a href="#blog">Blog</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#hipaa">HIPAA Compliance</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 HomeNurse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
