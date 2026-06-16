import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Quiz {
  id: string;
  title: string;
  courseId: string;
  moduleId?: string;
  questions: Question[];
}

interface QuizResult {
  score: number;
  passed: boolean;
  courseCompleted?: boolean;
  nextExamId?: string;
  certificateId?: string;
  certificateUniqueId?: string;
  certificateStatus?: string;
}

const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2700); // 45:00
  const [accessDenied, setAccessDenied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchApi(`/quizzes/${id}`)
      .then(data => {
        setQuiz(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.status === 403 || err.message?.includes('access')) {
          setAccessDenied(err.message || 'Paid access required');
        }
        setLoading(false);
      });
  }, [id, user, navigate]);

  useEffect(() => {
    if (result || loading || !quiz) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [result, loading, quiz]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = (optionIdx: number) => {
    if (!quiz) return;
    const qId = quiz.questions[currentIdx].id;
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const unanswered = quiz.questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetchApi(`/quizzes/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      });
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
    }
    setSubmitting(false);
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(2700);
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading quiz...</div>;

  if (accessDenied) {
    return (
      <div className="course-detail-page">
        <Navbar />
        <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px' }}>
          <div className="glass" style={{ maxWidth: '500px', width: '100%', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>Access Restricted</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{accessDenied}. You must upgrade your course enrollment to access quizzes and exams.</p>
            <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!quiz) return <div>Quiz not found</div>;

  // Result Screen
  if (result) {
    return (
      <div className="quiz-page">
        <Navbar />
        <section style={{ padding: '120px 20px 60px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass" style={{ maxWidth: '800px', width: '100%', padding: '60px', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '40px' }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--glass-border)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke={result.passed ? '#10b981' : '#f59e0b'} 
                  strokeWidth="8" 
                  strokeDasharray={2 * Math.PI * 45} 
                  strokeDashoffset={2 * Math.PI * 45 * (1 - result.score / 100)} 
                  strokeLinecap="round" 
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} 
                />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '48px', fontWeight: 'bold' }}>{result.score}%</span>
              </div>
            </div>

            <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>
              {result.passed ? 'Congratulations!' : 'Keep Trying!'}
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px' }}>
              {result.passed 
                ? (result.courseCompleted 
                    ? (result.certificateStatus === 'PENDING' 
                        ? "Your certificate has been generated and is waiting for admin notification/approval." 
                        : "You've successfully passed all required exams and are now eligible for your certificate!")
                    : "Great job! You've passed this assessment.")
                : "You didn't reach the required passing score this time. Review your course materials and try again."}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {result.passed ? (
                <>
                  {result.courseCompleted ? (
                    <Link to="/my-learning?tab=certificates" className="btn btn-primary" style={{ padding: '16px 32px' }}>View Certificates</Link>
                  ) : result.nextExamId ? (
                    <Link to={`/quiz/${result.nextExamId}`} className="btn btn-primary" style={{ padding: '16px 32px' }}>Next Exam</Link>
                  ) : (
                    <Link to={`/courses/${quiz.courseId}`} className="btn btn-primary" style={{ padding: '16px 32px' }}>Back to Course</Link>
                  )}
                </>
              ) : (
                <button onClick={handleRetry} className="btn btn-primary" style={{ padding: '16px 32px' }}>Try Again</button>
              )}
              <Link to="/my-learning" className="btn btn-secondary" style={{ padding: '16px 32px' }}>Dashboard</Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const currentQ = quiz.questions[currentIdx];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Quiz Header */}
      <header style={{ height: '70px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '24px' }}>✕</button>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{quiz.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: timeLeft < 300 ? '#ef4444' : 'var(--text-main)', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '18px' }}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Map Sidebar */}
        <aside style={{ width: '300px', borderRight: '1px solid var(--glass-border)', background: 'var(--glass-bg)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>QUESTION MAP</h3>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{Object.keys(answers).length} / {quiz.questions.length} Answered</div>
          </div>
          <div style={{ padding: '24px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', alignContent: 'start' }}>
            {quiz.questions.map((q, i) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    border: isCurrent ? '2px solid var(--accent)' : isAnswered ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    background: isCurrent ? 'var(--accent)' : isAnswered ? 'rgba(13, 185, 242, 0.1)' : 'transparent',
                    color: isCurrent ? 'white' : 'var(--text-main)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {i + 1}
                  {isAnswered && !isCurrent && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--bg-main)', color: '#10b981', borderRadius: '50%', width: '12px', height: '12px', display: 'block' }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Question Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '60px 40px' }}>
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <div style={{ marginBottom: '40px' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>QUESTION {currentIdx + 1} OF {quiz.questions.length}</span>
              <div style={{ width: '100%', height: '4px', background: 'var(--glass-border)', borderRadius: '2px', marginTop: '16px' }}>
                <div style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.3s' }}></div>
              </div>
            </div>

            <div className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
              <h2 style={{ fontSize: '24px', lineHeight: 1.5, marginBottom: '32px' }}>{currentQ.text}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentQ.options.map((opt, oi) => {
                  const isSelected = answers[currentQ.id] === oi;
                  const label = String.fromCharCode(65 + oi);
                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(oi)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '20px',
                        borderRadius: '16px',
                        border: isSelected ? '2px solid var(--accent)' : '2px solid var(--glass-border)',
                        background: isSelected ? 'rgba(13, 185, 242, 0.05)' : 'var(--glass-bg)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        color: 'var(--text-main)'
                      }}
                    >
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: isSelected ? 'var(--accent)' : 'var(--glass-border)', 
                        color: isSelected ? 'white' : 'var(--text-muted)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontWeight: 'bold', marginRight: '20px', flexShrink: 0
                      }}>
                        {label}
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: isSelected ? 'bold' : 'normal', flex: 1 }}>{opt}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
              <button 
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="btn btn-secondary"
                style={{ visibility: currentIdx === 0 ? 'hidden' : 'visible' }}
              >
                « Previous
              </button>
              
              {currentIdx < quiz.questions.length - 1 ? (
                <button onClick={() => setCurrentIdx(prev => prev + 1)} className="btn btn-primary">
                  Next Question »
                </button>
              ) : (
                <button onClick={handleSubmit} className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }}>
                  Finish & Submit
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizPage;
