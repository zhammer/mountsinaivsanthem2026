import { Link } from "react-router-dom";
import { TESTIMONIALS } from "./testimonials";

export default function TestimonialsPage() {
  return (
    <div className="testimonials-page">
      <div className="testimonials-page-list">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="testimonial-card">
            <p>
              <span className="quote-mark">&ldquo;</span>
              {t.message}
              <span className="quote-mark">&rdquo;</span>
            </p>
          </div>
        ))}
      </div>
      <Link className="testimonials-page-back" to="/">
        &larr; back
      </Link>
    </div>
  );
}
