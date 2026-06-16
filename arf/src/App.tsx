import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import QuizPage from './pages/QuizPage';
import CertificatePage from './pages/CertificatePage';
import SettingsPage from './pages/SettingsPage';
import { PrivacyPolicyPage, TermsOfServicePage, RefundPolicyPage } from './pages/StaticPages';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyLearningPage from './pages/MyLearningPage';
import AdminQuizUploadPage from './pages/AdminQuizUploadPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/certificate/verify/:id" element={<CertificatePage />} />
            <Route path="/my-learning" element={<MyLearningPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/refund" element={<RefundPolicyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/quiz-upload" element={<AdminQuizUploadPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
