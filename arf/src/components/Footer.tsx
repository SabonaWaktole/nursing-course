import './Footer.css';
import { contactInfo } from '../datas';

const Footer = () => {
  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-icon">E</span>
              <span className="logo-text">Excel Community</span>
            </div>
            <p className="footer-tagline">
              Get your Adult residential facility administrators (ARF) CE credits online with Excel Community Living! Quick, affordable, fully online.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#courses">Courses</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-contact">
            <h4>Get In Touch</h4>
            <ul>
              <li>
                <span>📧</span>
                <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
              </li>
              <li>
                <span>📞</span>
                <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
              </li>
              <li>
                <span>📍</span>
                <span>{contactInfo.address}</span>
              </li>
            </ul>
          </div>
          
          <div className="footer-newsletter">
            <h4>Newsletter</h4>
            <p>Get latest course updates and career tips.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Your email" />
              <button type="submit" className="btn btn-primary">Join</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Excel Community Living Inc. All rights reserved.</p>
          <div className="footer-social">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
