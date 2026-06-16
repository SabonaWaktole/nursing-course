import './Testimonials.css';
import { testimonials } from '../datas';

const Testimonials = () => {
  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <h2 className="section-title">What Our Students Say</h2>
        
        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <div key={item.id} className="testimonial-card glass">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">{item.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{item.author.charAt(0)}</div>
                <div className="author-info">
                  <h4 className="author-name">{item.author}</h4>
                  <span className="author-role">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
