import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { YouTubePlyrPlayer } from '../components/YouTubePlyrPlayer';
import { getFileUrl } from '../utils/fileUrl';
import {
  parseYouTube,
  getOtherPlatformEmbedUrl,
} from '../utils/videoEmbed';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Lock,
  Layout,
  BookOpen,
  ChevronDown,
  X
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  materialUrl?: string | null;
  videoFirst?: boolean;
}

interface Quiz {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  quizzes?: Quiz[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string | null;
  modules?: Module[];
  quizzes?: Quiz[];
  instructor?: { id: string; name: string };
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Immersive layout state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [materialIndex, setMaterialIndex] = useState(0);

  // Stripe verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    if (payment === 'success' && sessionId && user) {
      fetchApi(`/payments/verify?session_id=${sessionId}`)
        .then(() => navigate('/my-learning', { replace: true }))
        .catch(() => navigate('/my-learning', { replace: true }));
    }
  }, [user, navigate]);

  // Fetch course
  useEffect(() => {
    fetchApi(`/courses/${id}`).then((data: CourseDetail) => {
      if (data.modules) {
        data.modules = data.modules.map(mod => ({
          ...mod,
          lessons: mod.lessons?.filter(l => l.videoUrl || l.youtubeUrl || l.materialUrl) || []
        })).filter(mod => mod.lessons.length > 0 || (mod.quizzes && mod.quizzes.length > 0));
      }
      setCourse(data);
    }).catch(console.error);
  }, [id]);

  // Fetch enrollment
  useEffect(() => {
    if (user && course) {
      fetchApi('/courses/my/enrollments').then((enrollments: any[]) => {
        const found = enrollments.find(e => e.courseId === course.id);
        const isInstructor = course.instructor && course.instructor.id === user.id;
        const hasOverrideAccess = isInstructor;

        if (found || hasOverrideAccess) {
          setEnrolled(true);
          setHasPaidAccess(hasOverrideAccess || found?.hasPaidAccess);
          
          const currentProgress = found ? (found.progress || 0) : 0;
          setProgress(currentProgress);

          const allLessons = course.modules?.flatMap(m => m.lessons) || [];
          if (allLessons.length > 0 && !activeLesson) {
            let targetLessonId = allLessons[0].id;
            
            if (currentProgress >= 100) {
              targetLessonId = allLessons[allLessons.length - 1].id;
            } else if (currentProgress > 0) {
              const currentIndex = Math.max(0, Math.floor((currentProgress / 100) * allLessons.length));
              const safeIndex = Math.min(currentIndex, allLessons.length - 1);
              targetLessonId = allLessons[safeIndex].id;
            }
            
            setActiveLesson(targetLessonId);
            const mod = course.modules?.find(m => m.lessons.some(l => l.id === targetLessonId));
            if (mod) setExpandedModules(new Set([mod.id]));
          }
        }
      }).catch(console.error);
    }
  }, [user, course, activeLesson]);

  const handleEnroll = async (isAudit = false) => {
    if (!user) return navigate('/login');
    setEnrolling(true);
    try {
      if (course?.price && course.price > 0 && !isAudit) {
        const res = await fetchApi('/payments/create-checkout-session', {
          method: 'POST',
          body: JSON.stringify({ courseId: id, origin: window.location.origin })
        });
        if (res.enrolled) {
          setEnrolled(true);
          setHasPaidAccess(true);
        } else if (res.sessionUrl) {
          window.location.href = res.sessionUrl;
          return;
        }
      } else {
        await fetchApi(`/courses/${id}/enroll`, { method: 'POST' });
        setEnrolled(true);
        setHasPaidAccess(!course?.price || course.price === 0);
      }
    } catch (err: any) {
      if (err?.message?.includes('requires payment') || err?.status === 402) {
        try {
          const res = await fetchApi('/payments/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({ courseId: id, origin: window.location.origin })
          });
          if (res.sessionUrl) {
            window.location.href = res.sessionUrl;
            return;
          }
        } catch {}
      } else {
        alert(err.message || 'Error enrolling');
      }
    }
    setEnrolling(false);
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const allLessons = course?.modules?.flatMap(m => m.lessons) || [];
  const currentLessonIndex = allLessons.findIndex(l => l.id === activeLesson);
  const currentLesson = currentLessonIndex >= 0 ? allLessons[currentLessonIndex] : null;

  // Compute sequential materials for current lesson
  const currentMaterials = useMemo(() => {
    if (!currentLesson) return [];
    const mats: { type: string; url: string }[] = [];
    
    const pushPdf = () => {
      const pdfUrls = (currentLesson.materialUrl || '').split(',').filter(Boolean).map(u => u.trim());
      pdfUrls.forEach(url => mats.push({ type: 'pdf', url }));
    };
    const pushVideo = () => {
      const ytUrl = currentLesson.youtubeUrl;
      const vidUrl = currentLesson.videoUrl;

      if (ytUrl && parseYouTube(ytUrl)) {
        mats.push({ type: 'youtube', url: ytUrl });
      } else if (vidUrl) {
        mats.push({ type: 'video', url: vidUrl });
      } else if (ytUrl) {
        // Fallback for when an mp4/external link is pasted in the YouTube URL field
        mats.push({ type: 'video', url: ytUrl });
      }
    };

    if (currentLesson.videoFirst) {
      pushVideo();
      pushPdf();
    } else {
      pushPdf();
      pushVideo();
    }
    return mats;
  }, [currentLesson]);

  // Reset material index when lesson changes
  useEffect(() => {
    setMaterialIndex(0);
  }, [activeLesson]);

  const handleNextLesson = async () => {
    if (!course || currentLessonIndex < 0) return;

    const newProgress = Math.min(Math.round(((currentLessonIndex + 1) / allLessons.length) * 100), 99);
    if (newProgress !== progress) {
      setProgress(newProgress);
      fetchApi(`/courses/${course.id}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ progress: newProgress })
      }).catch(console.error);
    }

    const currentMod = course.modules?.find(m => m.lessons.some(l => l.id === allLessons[currentLessonIndex].id));
    const moduleLessons = currentMod?.lessons || [];
    const isLastInModule = currentLessonIndex >= 0 && allLessons[currentLessonIndex].id === moduleLessons[moduleLessons.length - 1]?.id;

    if (isLastInModule && currentMod && currentMod.quizzes && currentMod.quizzes.length > 0 && hasPaidAccess) {
      navigate(`/quiz/${currentMod.quizzes[0].id}`);
    } else if (currentLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentLessonIndex + 1];
      setActiveLesson(nextLesson.id);
      const mod = course.modules?.find(m => m.lessons.some(l => l.id === nextLesson.id));
      if (mod) setExpandedModules(prev => new Set([...prev, mod.id]));
    } else if (course.quizzes?.length && course.quizzes.length > 0 && hasPaidAccess) {
      navigate(`/quiz/${course.quizzes[0].id}`);
    } else {
      try {
        await fetchApi(`/courses/${course.id}/progress`, {
          method: 'PUT',
          body: JSON.stringify({ progress: 100 })
        });
        setProgress(100);
      } catch {}
    }
  };

  const handleBackLesson = () => {
    if (currentLessonIndex > 0) {
      const prev = allLessons[currentLessonIndex - 1];
      setActiveLesson(prev.id);
      const mod = course?.modules?.find(m => m.lessons.some(l => l.id === prev.id));
      if (mod) setExpandedModules(p => new Set([...p, mod.id]));
    }
  };

  const handleNextMaterial = () => {
    if (materialIndex < currentMaterials.length - 1) {
      setMaterialIndex(prev => prev + 1);
    } else {
      handleNextLesson();
    }
  };

  const handleBackMaterial = () => {
    if (materialIndex > 0) {
      setMaterialIndex(prev => prev - 1);
    } else {
      handleBackLesson();
    }
  };

  const getNextLabel = () => {
    if (materialIndex < currentMaterials.length - 1) return 'Next Material »';
    if (currentLessonIndex < allLessons.length - 1) return 'Next Lesson »';
    if (course?.quizzes?.length && course.quizzes.length > 0 && hasPaidAccess) return 'Take Final Exam »';
    return 'Finish Course »';
  };

  const isFirstMaterialOverall = currentLessonIndex === 0 && materialIndex === 0;

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0F19', color: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
        <div>Loading premium experience...</div>
      </div>
    );
  }

  // Marketing page for non-enrolled
  if (!enrolled || !user) {
    return (
      <div className="course-detail-page">
        <Navbar />
        <section className="courses-hero" style={{ padding: '120px 0 80px', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
          <div className="courses-hero-overlay"></div>
          <div className="container courses-hero-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 className="courses-hero-title" style={{ fontSize: '48px', marginBottom: '24px' }}>{course.title}</h1>
            <p className="courses-hero-subtitle" style={{ fontSize: '20px', marginBottom: '40px', lineHeight: 1.6 }}>{course.description}</p>
            
            {course.price && course.price > 0 ? (
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleEnroll(false)} disabled={enrolling} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>
                  {enrolling ? 'Processing...' : `Enroll Now for $${course.price}`}
                </button>
                <button onClick={() => handleEnroll(true)} disabled={enrolling} className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '18px' }}>
                  Audit for Free
                </button>
              </div>
            ) : (
              <button onClick={() => handleEnroll()} disabled={enrolling} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>
                {enrolling ? 'Enrolling...' : 'Start Learning Free'}
              </button>
            )}
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const currentMaterial = currentMaterials[materialIndex];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0B0F19', color: '#F8FAFC', fontFamily: 'Inter, Geist, "SF Pro Display", sans-serif' }}>
      
      {/* SIDEBAR NAVIGATION RAIL */}
      <aside 
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        style={{
          width: isSidebarExpanded ? '340px' : '72px',
          minWidth: isSidebarExpanded ? '340px' : '72px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: '#111827',
          borderRight: '1px solid #1F2937',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1F2937', display: 'flex', alignItems: 'center', gap: '16px', whiteSpace: 'nowrap' }}>
          <div 
            onClick={() => navigate('/my-learning')}
            style={{ 
              background: '#1F2937', 
              padding: '8px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Back to Dashboard"
          >
            <Layout size={20} color="#9CA3AF" />
          </div>
          <div style={{ opacity: isSidebarExpanded ? 1 : 0, transition: 'opacity 0.2s', flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#F3F4F6', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {course.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div style={{ flex: 1, background: '#374151', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#3B82F6', width: `${progress}%`, transition: 'width 0.4s ease-out' }}></div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF' }}>{progress}%</span>
            </div>
          </div>
        </div>

        {/* Sidebar Modules */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 12px' }}>
          {course.modules?.map((mod, i) => {
            const isExpanded = expandedModules.has(mod.id);
            const isActiveModule = mod.lessons.some(l => l.id === activeLesson);
            
            return (
              <div key={mod.id} style={{ marginBottom: '8px' }}>
                <button 
                  onClick={() => isSidebarExpanded && toggleModule(mod.id)}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: isSidebarExpanded ? 'space-between' : 'center', 
                    background: isActiveModule && !isSidebarExpanded ? '#1F2937' : 'transparent', 
                    border: 'none', 
                    color: '#F3F4F6', 
                    cursor: 'pointer', 
                    padding: isSidebarExpanded ? '12px' : '12px 0',
                    borderRadius: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1F2937'}
                  onMouseLeave={e => e.currentTarget.style.background = (isActiveModule && !isSidebarExpanded) ? '#1F2937' : 'transparent'}
                >
                  {isSidebarExpanded ? (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0, paddingRight: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Module {i + 1}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{mod.title}</span>
                      </div>
                      <ChevronDown size={18} color="#9CA3AF" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                    </>
                  ) : (
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '16px', 
                      background: isActiveModule ? '#3B82F6' : '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActiveModule ? '#FFF' : '#9CA3AF',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}>
                      {i + 1}
                    </div>
                  )}
                </button>
                
                {isExpanded && isSidebarExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                    {mod.lessons.map((lesson) => {
                      const isActive = activeLesson === lesson.id;
                      const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
                      const isCompleted = globalIdx < Math.floor((progress / 100) * allLessons.length);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson.id)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 12px 10px 36px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            color: isActive ? '#3B82F6' : '#9CA3AF',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                          onMouseEnter={e => { if(!isActive) { e.currentTarget.style.color = '#F3F4F6'; e.currentTarget.style.background = '#1F2937'; } }}
                          onMouseLeave={e => { if(!isActive) { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent'; } }}
                        >
                          {isActive && (
                            <div style={{ position: 'absolute', left: 0, top: '8px', bottom: '8px', width: '3px', background: '#3B82F6', borderRadius: '0 4px 4px 0' }} />
                          )}
                          <div style={{ marginTop: '2px', flexShrink: 0 }}>
                            {isCompleted ? (
                              <CheckCircle2 size={16} color="#10B981" />
                            ) : isActive ? (
                              <PlayCircle size={16} color="#3B82F6" />
                            ) : (
                              <Circle size={16} />
                            )}
                          </div>
                          <span style={{ fontSize: '13px', lineHeight: 1.4, fontWeight: isActive ? 600 : 500 }}>
                            {lesson.title}
                          </span>
                        </button>
                      )
                    })}
                    
                    {mod.quizzes?.map(quiz => (
                      <button
                        key={quiz.id}
                        onClick={() => {
                          if (hasPaidAccess) navigate(`/quiz/${quiz.id}`);
                          else setShowUpgradeModal(true);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 12px 10px 36px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          background: 'transparent',
                          color: hasPaidAccess ? '#9CA3AF' : '#F59E0B',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#1F2937' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <div style={{ marginTop: '2px', flexShrink: 0 }}>
                          {hasPaidAccess ? <FileText size={16} /> : <Lock size={16} />}
                        </div>
                        <span style={{ fontSize: '13px', lineHeight: 1.4, fontWeight: 500 }}>
                          {quiz.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* MAIN CONTENT AREA - MATERIAL VIEWER */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', position: 'relative' }}>
        
        {/* TOP TOOLBAR */}
        {currentLesson && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', minHeight: '56px', background: '#111827', padding: '0 24px', borderBottom: '1px solid #1F2937', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <span style={{ fontWeight: 600, fontSize: '15px', color: '#F3F4F6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentLesson.title}
              </span>
              {currentMaterials.length > 1 && (
                <span style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 500, flexShrink: 0 }}>
                  ({materialIndex + 1} / {currentMaterials.length})
                </span>
              )}
            </div>
            <button 
              onClick={() => navigate('/my-learning?tab=courses')}
              style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#F3F4F6'}
              onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
            >
              Close <X size={16} />
            </button>
          </div>
        )}

        {/* VIEWER AREA */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentMaterial ? (
            <>
              {currentMaterial.type === 'youtube' && (
                <div style={{ width: '100%', height: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                  <div style={{ width: '100%', background: '#0B0F19', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <YouTubePlyrPlayer key={currentMaterial.url} videoId={parseYouTube(currentMaterial.url)?.videoId || ''} />
                  </div>
                </div>
              )}
              {currentMaterial.type === 'video' && (
                <div style={{ width: '100%', height: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                  <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: '100%', background: '#0B0F19', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    {getOtherPlatformEmbedUrl(currentMaterial.url) ? (
                      <iframe
                        key={currentMaterial.url}
                        src={getOtherPlatformEmbedUrl(currentMaterial.url) || undefined}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video Player"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    ) : (
                      <video
                        key={currentMaterial.url}
                        src={getFileUrl(currentMaterial.url)}
                        controls
                        style={{ width: '100%', height: '100%', outline: 'none' }}
                      />
                    )}
                  </div>
                </div>
              )}
              {currentMaterial.type === 'pdf' && (
                <div style={{ width: '100%', height: '100%', padding: '0', display: 'flex', flexDirection: 'column' }}>
                  <iframe 
                    key={currentMaterial.url}
                    src={getFileUrl(currentMaterial.url)} 
                    style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }} 
                    title="PDF Viewer"
                  />
                </div>
              )}
            </>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#6B7280' }}>
               <BookOpen size={48} opacity={0.5} />
               <p style={{ fontSize: '15px', fontWeight: 500 }}>Select a lesson from the sidebar to begin.</p>
             </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION TOOLBAR */}
        {currentLesson && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', minHeight: '56px', background: '#111827', padding: '0 24px', borderTop: '1px solid #1F2937', zIndex: 10 }}>
            {!isFirstMaterialOverall ? (
              <button 
                onClick={handleBackMaterial} 
                style={{ background: 'transparent', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#93C5FD'}
                onMouseLeave={e => e.currentTarget.style.color = '#60A5FA'}
              >
                « Back
              </button>
            ) : (
              <div />
            )}
            <button 
              onClick={handleNextMaterial} 
              style={{ background: 'transparent', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#93C5FD'}
              onMouseLeave={e => e.currentTarget.style.color = '#60A5FA'}
            >
              {getNextLabel()}
            </button>
          </div>
        )}
      </main>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && course && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: '#1E293B', borderRadius: '24px', padding: '32px', border: '1px solid #334155', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Lock size={32} color="#F59E0B" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F8FAFC', marginBottom: '12px' }}>Upgrade to Unlock</h2>
            <p style={{ color: '#9CA3AF', marginBottom: '32px', lineHeight: 1.6, fontSize: '14px' }}>
              You are currently auditing this course for free. To take tests, access assessments, and earn your certificate, please upgrade your access. Your progress will be saved.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => { setShowUpgradeModal(false); handleEnroll(false); }}
                disabled={enrolling}
                style={{ width: '100%', height: '48px', background: '#3B82F6', color: '#fff', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '15px' }}
              >
                {enrolling ? 'Redirecting...' : `Pay $${course.price || 0} to Upgrade`}
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{ width: '100%', height: '48px', background: 'transparent', color: '#9CA3AF', borderRadius: '12px', fontWeight: 600, border: '1px solid #374151', cursor: 'pointer', fontSize: '15px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
