import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
}

interface ParsedQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
}

const AdminQuizUploadPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [passingScore, setPassingScore] = useState<string>('70');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    fetchApi('/courses')
      .then(data => setCourses(data))
      .catch(err => console.error(err));
  }, [navigate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parseTxt(text);
    };
    reader.readAsText(file);
  };

  const parseTxt = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const questions: ParsedQuestion[] = [];
    let currentQ: ParsedQuestion | null = null;
    let currentOptions: { text: string; isCorrect: boolean }[] = [];

    const optionRegex = /^([A-Z])[\.\)]\s*(.+)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if it's a new question (starts with number)
      const qMatch = line.match(/^(\d+)\s+(.+)/);
      if (qMatch) {
        if (currentQ) {
          // finalize previous question
          finalizeQuestion(currentQ, currentOptions, questions);
        }
        currentQ = { text: qMatch[2].trim(), options: [], correctAnswer: -1 };
        currentOptions = [];
        continue;
      }

      // Check for options (could be multiple on one line)
      // We will split by A. B. C. D. 
      // First, find all occurrences of "X." or "X)"
      const parts = line.split(/(?=[A-Z][\.\)]\s+)/i);
      
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        const optMatch = trimmedPart.match(optionRegex);
        if (optMatch) {
          let optText = optMatch[2].trim();
          let isCorrect = false;

          // Detect correct answer (non-alphanumeric character like *, _, #, etc)
          if (/[^\w\s\.,\?'"!-]/i.test(optText)) {
            isCorrect = true;
            // clean the marker
            optText = optText.replace(/[^\w\s\.,\?'"!-]/g, '').trim();
          }

          currentOptions.push({ text: optText, isCorrect });
        } else if (currentQ && currentOptions.length === 0) {
          // It's a continuation of the question text
          currentQ.text += ' ' + trimmedPart;
        }
      }
    }

    if (currentQ) {
      finalizeQuestion(currentQ, currentOptions, questions);
    }

    setParsedQuestions(questions);
    if (questions.length === 0) {
      setMessage({ type: 'error', text: 'No questions could be parsed from the file.' });
    } else {
      setMessage({ type: 'success', text: `Successfully parsed ${questions.length} questions.` });
    }
  };

  const finalizeQuestion = (q: ParsedQuestion, optionsList: { text: string; isCorrect: boolean }[], finalArray: ParsedQuestion[]) => {
    q.options = optionsList.map(o => o.text);
    const correctIdx = optionsList.findIndex(o => o.isCorrect);
    q.correctAnswer = correctIdx !== -1 ? correctIdx : 0; // default to 0 if none found
    finalArray.push(q);
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      setMessage({ type: 'error', text: 'Please select a course.' });
      return;
    }
    if (!quizTitle) {
      setMessage({ type: 'error', text: 'Please enter a quiz title.' });
      return;
    }
    if (parsedQuestions.length === 0) {
      setMessage({ type: 'error', text: 'No questions to save.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await fetchApi('/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          courseId: selectedCourse,
          title: quizTitle,
          passingScore: parseInt(passingScore),
          questions: parsedQuestions,
        }),
      });
      setMessage({ type: 'success', text: 'Quiz created successfully!' });
      setParsedQuestions([]);
      setQuizTitle('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving quiz' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = [...parsedQuestions];
    updated.splice(index, 1);
    setParsedQuestions(updated);
  };

  const handleMoveQuestion = (index: number, dir: 'up' | 'down') => {
    if (dir === 'up' && index === 0) return;
    if (dir === 'down' && index === parsedQuestions.length - 1) return;
    const updated = [...parsedQuestions];
    const swapIdx = dir === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[swapIdx];
    updated[swapIdx] = temp;
    setParsedQuestions(updated);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <Navbar />
      <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>Admin: Quiz Upload</h1>
        
        {message && (
          <div style={{ padding: '16px', borderRadius: '8px', marginBottom: '24px', backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.type === 'error' ? '#ef4444' : '#10b981' }}>
            {message.text}
          </div>
        )}

        <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Course</label>
              <select 
                value={selectedCourse} 
                onChange={e => setSelectedCourse(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
              >
                <option value="">Select a course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Quiz Title</label>
              <input 
                type="text" 
                value={quizTitle} 
                onChange={e => setQuizTitle(e.target.value)}
                placeholder="e.g. Final Assessment"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Passing Score (%)</label>
              <input 
                type="number" 
                value={passingScore} 
                onChange={e => setPassingScore(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Upload TXT File</label>
              <input 
                type="file" 
                accept=".txt"
                onChange={handleFileUpload}
                style={{ width: '100%', padding: '10px', color: 'var(--text-muted)' }}
              />
            </div>
          </div>
        </div>

        {parsedQuestions.length > 0 && (
          <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px' }}>Parsed Questions ({parsedQuestions.length})</h2>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Quiz'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {parsedQuestions.map((q, i) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '500' }}>{i + 1}. {q.text}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleMoveQuestion(i, 'up')} disabled={i === 0} style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-muted)', cursor: i === 0 ? 'not-allowed' : 'pointer' }}>↑</button>
                      <button onClick={() => handleMoveQuestion(i, 'down')} disabled={i === parsedQuestions.length - 1} style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-muted)', cursor: i === parsedQuestions.length - 1 ? 'not-allowed' : 'pointer' }}>↓</button>
                      <button onClick={() => handleDeleteQuestion(i)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} style={{ padding: '8px 12px', borderRadius: '6px', background: q.correctAnswer === optIdx ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', color: q.correctAnswer === optIdx ? '#10b981' : 'var(--text-main)', border: q.correctAnswer === optIdx ? '1px solid #10b981' : '1px solid transparent' }}>
                        {String.fromCharCode(65 + optIdx)}. {opt}
                        {q.correctAnswer === optIdx && <span style={{ float: 'right' }}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminQuizUploadPage;
