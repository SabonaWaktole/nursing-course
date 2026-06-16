import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api';
import type { Course } from '../types';
import { useAuth } from '../context/AuthContext';
import EnrollModal from './EnrollModal';
import { getFileUrl } from '../utils/fileUrl';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalCourse, setModalCourse] = useState<Course | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEnrollClick = (course: Course) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (course.price && course.price > 0) {
      setModalCourse(course);
    } else {
      handleAuditEnroll(course.id);
    }
  };

  const handlePayEnroll = async (courseId: string) => {
    try {
      const res = await fetchApi('/payments/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ courseId, origin: window.location.origin })
      });
      if (res.sessionUrl) {
        window.location.href = res.sessionUrl;
      } else if (res.enrolled) {
        setModalCourse(null);
        navigate('/my-learning');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate payment.');
    }
  };

  const handleAuditEnroll = async (courseId: string) => {
    try {
      await fetchApi(`/courses/${courseId}/enroll`, { method: 'POST' });
      setModalCourse(null);
      navigate('/my-learning');
    } catch (err: any) {
      alert(err.message || 'Failed to enroll in the course.');
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await fetchApi('/courses');
        setCourses(Array.isArray(data) ? data : data.courses || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch courses');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchApi('/courses/my/enrollments')
        .then((enrollments: any[]) => {
          setEnrolledIds(new Set(enrollments.map(e => e.courseId)));
        })
        .catch(() => {});
    }
  }, [user]);

  // Show only the first 6 courses on the homepage
  const featuredCourses = courses.slice(0, 6);

  return (
    <section id="courses" className="courses">
      <div className="container">
        <h2 className="section-title">Explore Our Courses</h2>
        
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading courses...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>{error}</div>
        ) : featuredCourses.length > 0 ? (
          <div className="courses-grid">
            {featuredCourses.map((course) => (
              <div key={course.id} className="course-card glass">
                <div className="course-image">
                  <img src={course.thumbnail ? getFileUrl(course.thumbnail) : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'} alt={course.title} />
                  <span className="course-price">{course.price ? `$${course.price}` : 'Free'}</span>
                </div>
                <div className="course-content">
                  <span className="course-category">{course.category || 'Course'}</span>
                  <h3 className="course-title">{course.title}</h3>
                  <div className="course-footer">
                    <span className="instructor">By {course.instructor?.name || 'Excel Community Living'}</span>
                    {enrolledIds.has(course.id) ? (
                      <button className="btn-icon" onClick={() => navigate(`/courses/${course.id}`)}>
                        <span>Continue</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button className="btn-icon" onClick={() => handleEnrollClick(course)}>
                        <span>Enroll</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No courses available.</div>
        )}
        
        <div className="courses-action">
          <Link to="/courses" className="btn btn-primary">View All Courses</Link>
        </div>
      </div>

      {modalCourse && (
        <EnrollModal
          course={modalCourse}
          onClose={() => setModalCourse(null)}
          onPayEnroll={handlePayEnroll}
          onAuditEnroll={handleAuditEnroll}
        />
      )}
    </section>
  );
};

export default Courses;
