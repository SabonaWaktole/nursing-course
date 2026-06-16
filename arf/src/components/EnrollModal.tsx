import { useState } from 'react';
import './EnrollModal.css';

interface EnrollModalProps {
  course: {
    id: string;
    title: string;
    description?: string;
    price: number | null;
    thumbnail?: string | null;
  };
  onClose: () => void;
  onPayEnroll: (courseId: string) => void;
  onAuditEnroll: (courseId: string) => void;
}

const EnrollModal = ({ course, onClose, onPayEnroll, onAuditEnroll }: EnrollModalProps) => {
  const [loading, setLoading] = useState<'pay' | 'audit' | null>(null);

  const handlePay = async () => {
    setLoading('pay');
    await onPayEnroll(course.id);
    setLoading(null);
  };

  const handleAudit = async () => {
    setLoading('audit');
    await onAuditEnroll(course.id);
    setLoading(null);
  };

  return (
    <div className="enroll-modal-overlay" onClick={onClose}>
      <div className="enroll-modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="enroll-modal-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="enroll-modal-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>

        <h2 className="enroll-modal-title">{course.title}</h2>
        
        {course.description && (
          <p className="enroll-modal-desc">{course.description.substring(0, 120)}{course.description.length > 120 ? '...' : ''}</p>
        )}

        <div className="enroll-modal-price">${course.price?.toFixed(2)}</div>

        <button
          className="enroll-modal-btn enroll-modal-btn-pay"
          onClick={handlePay}
          disabled={loading !== null}
        >
          {loading === 'pay' ? 'Redirecting to payment...' : `Pay $${course.price?.toFixed(2)} & Enroll (Full Access)`}
        </button>

        <button
          className="enroll-modal-btn enroll-modal-btn-audit"
          onClick={handleAudit}
          disabled={loading !== null}
        >
          {loading === 'audit' ? 'Enrolling...' : 'Audit Course (Free, No Certificates)'}
        </button>
      </div>
    </div>
  );
};

export default EnrollModal;
