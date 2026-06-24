import './About.css';

const About = () => {
  return (
    <section id="about" className="about">
      <div className="container about-container">
        <div className="about-image">
          <div className="image-stack">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
              alt="Medical Professionals" 
              className="img-1 glass"
            />
            <div className="experience-badge glass">
              <span className="exp-num">10+</span>
              <span className="exp-text">Years of Excellence</span>
            </div>
          </div>
        </div>
        
        <div className="about-content">
          <h2 className="section-title text-left">About Us: Your One-Stop <br /> Continuing Education</h2>
          <p className="about-text">
            Excel Community Living is an online resource designed to help Adult residential facility administrators (ARF) 
            get the required continuing education classes needed to renew their certification. 
            We offer a wide range of courses that are quick, affordable, and fully online.
          </p>
          
          <div className="features-grid">
            <div className="feature-card glass">
              <div className="feature-icon">🎓</div>
              <h3>ARF Certification</h3>
              <p>Specialized courses for Adult residential facility administrators.</p>
            </div>
            <div className="feature-card glass">
              <div className="feature-icon">💻</div>
              <h3>24-Hour Resource</h3>
              <p>Access your training materials anytime, 24/7 online.</p>
            </div>
            <div className="feature-card glass">
              <div className="feature-icon">⚡</div>
              <h3>Quick & Easy</h3>
              <p>Efficiently complete your requirements from home.</p>
            </div>
            <div className="feature-card glass">
              <div className="feature-icon">💰</div>
              <h3>Affordable</h3>
              <p>Get quality education at a price that fits your needs.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
