import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api';
import type { Course } from '../types';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnrollModal from '../components/EnrollModal';
import { getFileUrl } from '../utils/fileUrl';
import './CoursesPage.css';

const COURSES_PER_PAGE = 9;

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, courses]);

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="courses-page">
      <Navbar />

      {/* Hero Banner */}
      <section className="courses-hero">
        <div className="courses-hero-overlay"></div>
        <div className="container courses-hero-content">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Courses</span>
          </nav>
          <h1 className="courses-hero-title">Course Catalog</h1>
          <p className="courses-hero-subtitle">
            Renew your certification with Excel Community Living any time anywhere.
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="courses-toolbar">
        <div className="container toolbar-container">
          <div className="search-box glass">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="results-count">
            <span className="count-num">{filteredCourses.length}</span> courses found
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="courses-listing">
        <div className="container">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              Loading courses...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ef4444' }}>
              {error}
            </div>
          ) : paginatedCourses.length > 0 ? (
            <div className="courses-page-grid">
              {paginatedCourses.map((course) => (
                <div key={course.id} className="course-page-card glass">
                  <div className="course-page-image">
                    <img src={course.thumbnail ? getFileUrl(course.thumbnail) : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'} alt={course.title} />
                    <span className="course-page-badge">{course.category || 'Course'}</span>
                  </div>
                  <div className="course-page-body">
                    <h3 className="course-page-title">{course.title}</h3>
                    <div className="course-page-meta">
                      <div className="course-page-instructor">
                        <div className="instructor-avatar">
                          {course.instructor?.name?.[0] || 'E'}
                        </div>
                        <span>{course.instructor?.name || 'Excel Community Living'}</span>
                      </div>
                    </div>
                    <div className="course-page-footer">
                      {enrolledIds.has(course.id) ? (
                        <button 
                          className="btn btn-primary course-enroll-btn"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          Continue Learning
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary course-enroll-btn"
                          onClick={() => handleEnrollClick(course)}
                        >
                          {course.price ? `$${course.price}` : 'Free'} - Enroll Now
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <div className="no-results">
              <h3>No courses found</h3>
              <p>Try adjusting your search terms.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn glass"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ← Previous
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-num ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="pagination-btn glass"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="courses-cta">
        <div className="container cta-container glass">
          <h2>Stay ahead in your field.</h2>
          <p>Get the latest course updates, certifications, and career tips delivered to your inbox.</p>
          <div className="cta-form">
            <input type="email" placeholder="Enter your email" />
            <button className="btn btn-primary">Subscribe</button>
          </div>
        </div>
      </section>

      {modalCourse && (
        <EnrollModal
          course={modalCourse}
          onClose={() => setModalCourse(null)}
          onPayEnroll={handlePayEnroll}
          onAuditEnroll={handleAuditEnroll}
        />
      )}

      <Footer />
    </div>
  );
};

export default CoursesPage;
