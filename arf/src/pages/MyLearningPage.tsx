import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { getFileUrl } from '../utils/fileUrl';
import { 
  BookOpen, 
  Award, 
  Layout, 
  Menu, 
  CheckCircle2, 
  Flame, 
  ArrowRight, 
  Bell, 
  User as UserIcon, 
  Loader2, 
  Folder, 
  Clock,
  LogOut,
  Settings,
  Shield,
  BarChart2,
  TrendingUp,
  FileCheck,
  GraduationCap,
  ChevronRight
} from 'lucide-react';

interface Enrollment {
  id: string;
  progress: number;
  completed: boolean;
  hasPaidAccess: boolean;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    category: string | null;
    tags: any;
    instructor?: { name: string };
    _count?: { modules: number; lessons: number };
  };
}

const COURSE_IMAGES = [
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800"
];

const HERO_BG = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200";

const MyLearningPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get('tab') === 'certificates' ? 'certificates' : 'courses';
  const [activeTab, setActiveTab] = useState<'courses' | 'certificates'>(initialTab);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [streak, setStreak] = useState(0);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [enrollmentsRes, activityRes, certsRes] = await Promise.all([
          fetchApi('/courses/my/enrollments').catch(() => []),
          fetchApi('/courses/my/activity').catch(() => ({ weeklyActivity: [0,0,0,0,0,0,0], streak: 0 })),
          fetchApi('/certificates/my').catch(() => [])
        ]);
        
        setEnrollments(enrollmentsRes);
        setWeeklyActivity(activityRes.weeklyActivity || [0,0,0,0,0,0,0]);
        setStreak(activityRes.streak || 0);
        setCertificates(certsRes);
      } catch (err) {
        console.error("Failed to fetch learning data", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, navigate]);

  const overallProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
    : 0;

  const inProgressCount = enrollments.filter(e => !e.completed).length;
  const completedCount = enrollments.filter(e => e.completed).length;
  const activeEnrollment = enrollments.find(e => !e.completed) || enrollments[0];

  // Common LMS Styles
  const styles = {
    app: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#0F172A',
      color: '#F8FAFC',
      fontFamily: 'Inter, Geist, "SF Pro Display", sans-serif',
    },
    sidebar: {
      width: isSidebarOpen ? '280px' : '84px',
      minWidth: isSidebarOpen ? '280px' : '84px',
      background: '#111827',
      borderRight: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column' as const,
      transition: 'width 0.3s ease',
      zIndex: 40,
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      position: 'relative' as const,
    },
    header: {
      height: '76px',
      minHeight: '76px',
      background: '#111827',
      borderBottom: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 30,
    },
    content: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '32px',
      position: 'relative' as const,
    },
    card: {
      background: '#1E293B',
      borderRadius: '16px',
      border: '1px solid #334155',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    navItem: (isActive: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 24px',
      cursor: 'pointer',
      background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      borderLeft: isActive ? '4px solid #3B82F6' : '4px solid transparent',
      color: isActive ? '#3B82F6' : '#94A3B8',
      fontWeight: isActive ? 600 : 500,
      transition: 'all 0.2s',
    }),
    badge: {
      background: 'rgba(59, 130, 246, 0.1)',
      color: '#3B82F6',
      padding: '4px 8px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      border: '1px solid rgba(59, 130, 246, 0.2)'
    }
  };

  return (
    <div style={styles.app}>
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 45 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        style={{
          ...styles.sidebar,
          position: window.innerWidth < 1024 ? 'fixed' : 'relative',
          height: '100%',
          transform: window.innerWidth < 1024 ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none'
        }}
      >
        <div style={{ height: '76px', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', padding: isSidebarOpen ? '0 24px' : '0', borderBottom: '1px solid #334155' }}>
          {isSidebarOpen && (
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#F8FAFC', fontWeight: 800, fontSize: '18px' }}>E</span>
              </div>
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC', margin: 0, lineHeight: 1 }}>Excelcommunity</h1>
                <p style={{ fontSize: '12px', color: '#3B82F6', margin: '4px 0 0 0', fontWeight: 600 }}>Student Portal</p>
              </div>
            </Link>
          )}
          {window.innerWidth >= 1024 && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        <div style={{ flex: 1, padding: '24px 0', overflowY: 'auto' }} className="custom-scrollbar">
          {isSidebarOpen && (
            <div style={{ padding: '0 24px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>MAIN NAVIGATION</span>
            </div>
          )}
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div 
              onClick={() => { setActiveTab('courses'); setIsMobileMenuOpen(false); }}
              style={styles.navItem(activeTab === 'courses')}
              onMouseEnter={e => { if(activeTab !== 'courses') { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' } }}
              onMouseLeave={e => { if(activeTab !== 'courses') { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' } }}
            >
              <Layout size={22} style={{ flexShrink: 0 }} />
              {isSidebarOpen && <span style={{ fontSize: '15px' }}>My Courses</span>}
            </div>
            
            <div 
              onClick={() => { setActiveTab('certificates'); setIsMobileMenuOpen(false); }}
              style={styles.navItem(activeTab === 'certificates')}
              onMouseEnter={e => { if(activeTab !== 'certificates') { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' } }}
              onMouseLeave={e => { if(activeTab !== 'certificates') { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' } }}
            >
              <Award size={22} style={{ flexShrink: 0 }} />
              {isSidebarOpen && <span style={{ fontSize: '15px' }}>Certificates</span>}
            </div>
          </nav>
        </div>

        <div style={{ padding: '24px 0', borderTop: '1px solid #334155' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 24px', cursor: 'pointer' }}
            onClick={() => navigate('/settings')}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0 }}>
              <span style={{ fontWeight: 700 }}>{user?.name?.charAt(0).toUpperCase() || 'S'}</span>
            </div>
            {isSidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Student'}</p>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
              </div>
            )}
          </div>
          
          <div 
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px 0', cursor: 'pointer', color: '#EF4444', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <LogOut size={22} style={{ flexShrink: 0 }} />
            {isSidebarOpen && <span style={{ fontSize: '15px', fontWeight: 500 }}>Log Out</span>}
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <main style={styles.main}>
        {/* HEADER */}
        <header style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ display: window.innerWidth < 1024 ? 'block' : 'none', background: 'none', border: 'none', color: '#F8FAFC', padding: '8px' }}
            >
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              {activeTab === 'courses' ? 'My Learning' : 'My Certificates'}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button style={{ background: 'none', border: 'none', color: '#94A3B8', position: 'relative', cursor: 'pointer' }}>
              <Bell size={22} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '2px solid #111827' }} />
            </button>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'linear-gradient(135deg, #3B82F6 0%, #2DD4BF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <UserIcon size={18} />
                </div>
              </button>
              
              {isProfileDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', width: '220px', padding: '8px', zIndex: 50, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                  <div style={{ padding: '12px', borderBottom: '1px solid #334155', marginBottom: '8px' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#F8FAFC' }}>{user?.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>{user?.email}</p>
                  </div>
                  <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#F8FAFC', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#334155'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Settings size={16} color="#94A3B8" /> Settings
                  </Link>
                  <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#EF4444', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div style={styles.content} className="custom-scrollbar">
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#3B82F6' }}>
                <Loader2 size={40} className="animate-spin" style={{ marginBottom: '16px' }} />
                <p style={{ color: '#94A3B8', fontWeight: 500 }}>Loading your learning data...</p>
              </div>
            ) : activeTab === 'courses' ? (
              <>
                {/* STATS ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  {[
                    { label: 'Enrolled', value: enrollments.length, icon: <BookOpen size={20} color="#3B82F6" />, bg: 'rgba(59, 130, 246, 0.1)' },
                    { label: 'In Progress', value: inProgressCount, icon: <Clock size={20} color="#F59E0B" />, bg: 'rgba(245, 158, 11, 0.1)' },
                    { label: 'Completed', value: completedCount, icon: <CheckCircle2 size={20} color="#10B981" />, bg: 'rgba(16, 185, 129, 0.1)' },
                    { label: 'Progress', value: `${overallProgress}%`, icon: <BarChart2 size={20} color="#8B5CF6" />, bg: 'rgba(139, 92, 246, 0.1)' },
                  ].map((stat, i) => (
                    <div key={i} style={{ ...styles.card, padding: '24px', display: 'flex', flexDirection: 'column' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        {stat.icon}
                      </div>
                      <p style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px 0', lineHeight: 1 }}>{stat.value}</p>
                      <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600, margin: 0 }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {enrollments.length === 0 ? (
                  <div style={{ ...styles.card, padding: '60px 24px', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <BookOpen size={32} color="#3B82F6" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#F8FAFC', margin: '0 0 8px 0' }}>No courses yet</h3>
                    <p style={{ color: '#94A3B8', margin: '0 0 24px 0' }}>Start your learning journey by enrolling in a course.</p>
                    <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3B82F6', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2563EB'} onMouseLeave={e => e.currentTarget.style.background = '#3B82F6'}>
                      Browse Courses <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* ACTIVE COURSE & WEEKLY ACTIVITY */}
                    {activeEnrollment && (
                      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 1024 ? '2fr 1fr' : '1fr', gap: '24px' }}>
                        
                        {/* ACTIVE COURSE HERO */}
                        <Link 
                          to={`/courses/${activeEnrollment.course.id}`} 
                          style={{ 
                            position: 'relative', 
                            borderRadius: '16px', 
                            overflow: 'hidden', 
                            textDecoration: 'none', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'flex-end', 
                            minHeight: '280px',
                            padding: '32px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            border: '1px solid #334155'
                          }}
                          className="group"
                        >
                          <div style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            backgroundImage: `url(${activeEnrollment.course.thumbnail ? getFileUrl(activeEnrollment.course.thumbnail) : HERO_BG})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.4,
                            transition: 'transform 0.5s ease',
                          }} className="group-hover:scale-105" />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0F172A 10%, rgba(15, 23, 42, 0.6) 60%, transparent 100%)' }} />
                          
                          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <span style={{ ...styles.badge, alignSelf: 'flex-start' }}>Currently Active</span>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', margin: 0, lineHeight: 1.2 }}>{activeEnrollment.course.title}</h2>
                            <p style={{ color: '#cbd5e1', fontSize: '15px', margin: 0, maxWidth: '600px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {activeEnrollment.course.description}
                            </p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '16px' }}>
                              <div style={{ background: '#3B82F6', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}>
                                Continue Learning <ArrowRight size={18} />
                              </div>
                              <span style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '14px' }}>{activeEnrollment.progress}% complete</span>
                            </div>
                          </div>
                        </Link>

                        {/* WEEKLY ACTIVITY */}
                        <div style={{ ...styles.card, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>Weekly Activity</h3>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <TrendingUp size={18} color="#3B82F6" />
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', padding: '0 8px' }}>
                            {weeklyActivity.map((h, i) => (
                              <div key={i} style={{ width: '20px', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                                <div style={{ 
                                  width: '100%', 
                                  height: `${Math.max(h, 5)}%`, 
                                  background: h > 0 ? 'linear-gradient(to top, #3B82F6, #2DD4BF)' : 'rgba(59, 130, 246, 0.15)',
                                  borderRadius: '6px',
                                  transition: 'height 1s ease-out'
                                }} />
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 8px 0', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
                          </div>
                          
                          <div style={{ borderTop: '1px solid #334155', marginTop: '24px', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, margin: '0 0 4px 0' }}>Learning Streak</p>
                              <p style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>{streak} {streak === 1 ? 'Day' : 'Days'}</p>
                            </div>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Flame size={24} color="#F97316" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ALL COURSES GRID */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>All Courses</h2>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {enrollments.map((enrollment, idx) => (
                          <Link 
                            key={enrollment.id} 
                            to={`/courses/${enrollment.course.id}`} 
                            style={{ ...styles.card, textDecoration: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)' }}
                          >
                            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                              <div style={{ 
                                position: 'absolute', 
                                inset: 0, 
                                backgroundImage: `url(${enrollment.course.thumbnail ? getFileUrl(enrollment.course.thumbnail) : COURSE_IMAGES[idx % COURSE_IMAGES.length]})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                transition: 'transform 0.5s ease',
                              }} className="hover-scale" />
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' }} />
                              
                              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                                {(enrollment.course.tags?.[0] || enrollment.course.category) && (
                                  <span style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', color: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', border: '1px solid #334155' }}>
                                    {enrollment.course.tags?.[0] || enrollment.course.category}
                                  </span>
                                )}
                              </div>
                              
                              {enrollment.completed && (
                                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                  <span style={{ background: '#10B981', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={14} /> Done
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px 0', lineHeight: 1.3 }}>{enrollment.course.title}</h3>
                              <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 20px 0', fontWeight: 500 }}>
                                {enrollment.course.instructor?.name ? `By ${enrollment.course.instructor.name}` : 'Excel Community Living'}
                              </p>
                              
                              <div style={{ marginTop: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', color: '#64748B' }}>
                                  <span>Progress</span>
                                  <span style={{ color: enrollment.completed ? '#10B981' : '#3B82F6' }}>{enrollment.progress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                                  <div style={{ height: '100%', width: `${enrollment.progress}%`, background: enrollment.completed ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #3B82F6, #2DD4BF)', transition: 'width 1s ease' }} />
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Folder size={14} /> {enrollment.course._count?.modules || 0} Modules
                                  </span>
                                  {enrollment.completed ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 700 }}>
                                      <Shield size={14} /> Completed
                                    </span>
                                  ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 600 }}>
                                      <Clock size={14} /> In Progress
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* RECENT CERTIFICATES PREVIEW */}
                    {enrollments.some(e => e.completed) && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={20} color="#10B981" />
                          </div>
                          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>Earned Certificates</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                          {enrollments.filter(e => e.completed).map((enrollment) => (
                            <div key={enrollment.id} style={{ ...styles.card, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.1))', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Shield size={28} color="#10B981" />
                                </div>
                                <div>
                                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px 0' }}>{enrollment.course.title}</h4>
                                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, fontWeight: 500 }}>Course Completed Successfully</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => setActiveTab('certificates')}
                                style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                              >
                                View <ChevronRight size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              /* CERTIFICATES TAB */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={24} color="#10B981" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px 0' }}>My Certificates</h2>
                    <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>View, download, and manage your earned credentials.</p>
                  </div>
                </div>

                {certificates.length === 0 ? (
                  <div style={{ ...styles.card, padding: '80px 24px', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                      <GraduationCap size={40} color="#10B981" />
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#F8FAFC', margin: '0 0 12px 0' }}>No certificates yet</h3>
                    <p style={{ color: '#94A3B8', margin: '0 0 32px 0', fontSize: '16px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>Complete course modules and pass your final exams to earn official credentials.</p>
                    <button 
                      onClick={() => setActiveTab('courses')} 
                      style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC', padding: '14px 28px', borderRadius: '12px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#334155'}
                      onMouseLeave={e => e.currentTarget.style.background = '#1E293B'}
                    >
                      View My Courses
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                    {certificates.map(cert => (
                      <div key={cert.id} style={{ ...styles.card, padding: '32px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileCheck size={24} color="#3B82F6" />
                          </div>
                          <span style={{ 
                            padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em',
                            background: cert.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : cert.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: cert.status === 'APPROVED' ? '#10B981' : cert.status === 'REJECTED' ? '#EF4444' : '#F59E0B',
                            border: `1px solid ${cert.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : cert.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                          }}>
                            {cert.status || 'PENDING'}
                          </span>
                        </div>
                        
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#F8FAFC', margin: '0 0 16px 0', lineHeight: 1.3, flex: 1 }}>
                          {cert.course?.title || 'Course Certificate'}
                        </h3>
                        
                        <div style={{ background: '#111827', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Certificate ID</span> 
                            <span style={{ fontSize: '13px', color: '#F8FAFC', fontFamily: 'monospace', fontWeight: 600 }}>{cert.uniqueId}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Issue Date</span> 
                            <span style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 500 }}>{new Date(cert.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </div>
                        
                        {cert.status === 'APPROVED' ? (
                          <Link 
                            to={`/certificate/verify/${cert.uniqueId}`} 
                            style={{ background: '#3B82F6', color: '#fff', textAlign: 'center', padding: '14px', borderRadius: '12px', fontWeight: 600, textDecoration: 'none', display: 'block', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#2563EB'}
                            onMouseLeave={e => e.currentTarget.style.background = '#3B82F6'}
                          >
                            View & Print Certificate
                          </Link>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '14px', background: '#111827', borderRadius: '12px', fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>
                            {cert.status === 'REJECTED' ? 'Certificate Rejected' : 'Awaiting Admin Approval'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        .hover-scale {
          transition: transform 0.5s ease;
        }
        .group:hover .hover-scale {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default MyLearningPage;
