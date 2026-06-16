import { Link } from 'react-router-dom';
import './Hero.css';
import { heroContent } from '../datas';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-container animate-fade">
        <div className="hero-content">
          <span className="badge">{heroContent.badge}</span>
          <h1 className="hero-title">
            {heroContent.title}
          </h1>
          <p className="hero-description">
            {heroContent.description}
          </p>
          <div className="hero-btns">
            <Link to="/courses" className="btn btn-primary">Find Courses</Link>
            <a href="#about" className="btn btn-secondary">Learn More</a>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">24/7</span>
              <span className="stat-label">Online Access</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">20+</span>
              <span className="stat-label">Specialized Courses</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-label">State Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
