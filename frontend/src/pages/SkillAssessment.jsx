import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ChevronRight, ChevronLeft, AlertCircle, BookOpen, BarChart } from 'lucide-react';

const SkillAssessment = () => {
  const [domains, setDomains] = useState([]);
  const [profileSkills, setProfileSkills] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [results, setResults] = useState({}); // domain -> result
  const [viewingResult, setViewingResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(45);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!activeAssessment) return;
    setTimeLeft(45);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentIndex < activeAssessment.questions.length - 1) {
            setCurrentIndex((index) => index + 1);
            return 45;
          }
          handleSubmit();
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [activeAssessment, currentIndex]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, domainsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/profile'),
        axios.get('http://localhost:5000/api/domains')
      ]);
      setProfileSkills(profileRes.data.skills || []);
      setDomains(domainsRes.data || []);
      // Check today's results for each domain
      domainsRes.data.forEach(domain => checkTodaysResult(domain.name));
    } catch (err) {
      console.error(err);
      setError('Unable to load assessments and skills.');
    } finally {
      setLoading(false);
    }
  };

  const getDomainByName = (name) => domains.find((domain) => domain.name === name);

  const checkTodaysResult = async (domainName) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/assessments/result/${domainName}`);
      setResults(prev => ({ ...prev, [domainName]: res.data }));
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error(err);
      }
    }
  };

  const startAssessment = async (domainName) => {
    const domain = getDomainByName(domainName);
    if (!domain) {
      setError('Selected skill is no longer available.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/assessments/generate?domainId=${domain._id}`);
      const assessment = res.data;
      setActiveAssessment(assessment);
      setCurrentIndex(0);
      setAnswers(new Array(assessment.questions.length).fill(null));
      setResult(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!activeAssessment) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/assessments/${activeAssessment._id}/submit`, { answers });
      setResult(res.data);
      setResults((prev) => ({ ...prev, [activeAssessment.domain]: res.data }));
    } catch (err) {
      console.error(err);
      setError('Unable to submit assessment.');
    }
  };

  const viewResult = (domainName) => {
    setViewingResult(results[domainName]);
  };

  const closeResult = () => {
    setViewingResult(null);
  };

  const currentQuestion = activeAssessment?.questions[currentIndex];
  const scoreLabel = (scorePct) => {
    if (scorePct >= 90) return 'Excellent';
    if (scorePct >= 75) return 'Great';
    if (scorePct >= 50) return 'Good';
    return 'Keep Practicing';
  };

  if (result) {
    const scorePct = Math.round(result.score);
    const color = scorePct >= 80 ? 'var(--success)' : scorePct >= 50 ? 'var(--warning)' : 'var(--danger)';
    return (
      <div className="animate-in" style={{ maxWidth: '500px', margin: '60px auto' }}>
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '50%',
            background: scorePct >= 80 ? 'var(--success-bg)' : scorePct >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CheckCircle size={40} color={color} />
          </div>
          <h2 style={{ marginBottom: '8px' }}>{scoreLabel(scorePct)}!</h2>
          <p style={{ marginBottom: '24px' }}>{activeAssessment.title}</p>
          <div style={{ fontSize: '3.5rem', fontWeight: '900', color, lineHeight: 1, marginBottom: '8px' }}>{scorePct}%</div>
          <p>{result.correctCount} of {result.total} correct</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button onClick={() => navigate('/')} className="btn-primary" style={{ flex: 1 }}>Dashboard</button>
            <button onClick={() => { setActiveAssessment(null); setResult(null); }} className="btn-secondary" style={{ flex: 1 }}>Take Another</button>
          </div>
        </div>
      </div>
    );
  }

  if (activeAssessment) {
    const progress = ((currentIndex + 1) / activeAssessment.questions.length) * 100;
    return (
      <div className="animate-in" style={{ maxWidth: '700px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '500' }}>{activeAssessment.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <Clock size={18} /> {timeLeft}s left
            </div>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-gradient)', borderRadius: '2px', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '36px' }}>
          <h2 style={{ marginBottom: '28px', fontSize: '1.15rem', lineHeight: 1.5 }}>{currentQuestion?.text}</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Question {currentIndex + 1}/{activeAssessment.questions.length}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time: 45 seconds per question</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion?.options.map((option, idx) => (
              <div key={idx} onClick={() => handleAnswerSelect(idx)}
                style={{
                  padding: '16px 20px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  border: answers[currentIndex] === idx ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                  background: answers[currentIndex] === idx ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)',
                  transition: 'var(--transition)', fontSize: '0.95rem'
                }}>
                <span style={{ marginRight: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{String.fromCharCode(65 + idx)}.</span>
                {option}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '12px', flexWrap: 'wrap' }}>
            <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)} className="btn-secondary" style={{ gap: '6px' }}>
              <ChevronLeft size={16} /> Previous
            </button>
            {currentIndex === activeAssessment.questions.length - 1 ? (
              <button disabled={answers.includes(null)} onClick={handleSubmit} className="btn-primary" style={{ flex: 1 }}>
                Submit Assessment
              </button>
            ) : (
              <button onClick={() => setCurrentIndex(currentIndex + 1)} className="btn-primary" style={{ gap: '6px' }}>
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const availableSkills = profileSkills.filter((skill) => getDomainByName(skill));

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '4px' }}>Skill Assessments</h1>
        <p>Complete admin-added quizzes for your selected skills.</p>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card" style={{ padding: '28px' }}>
              <div className="skeleton" style={{ width: '60px', height: '22px', borderRadius: '12px', marginBottom: '16px' }}></div>
              <div className="skeleton" style={{ width: '80%', height: '18px', marginBottom: '10px' }}></div>
              <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '20px' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '8px' }}></div>
            </div>
          ))}
        </div>
      ) : availableSkills.length === 0 ? (
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ marginBottom: '12px' }}>No skills selected yet</h2>
          <p style={{ color: 'var(--text-muted)' }}>Choose admin-added skills from your profile first. Then you can take daily quizzes for each selected domain.</p>
          <button onClick={() => navigate('/profile')} className="btn-primary" style={{ marginTop: '18px' }}>Update Profile Skills</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {availableSkills.map((skill) => (
            <div key={skill} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <span style={{
                  padding: '4px 12px',
                  background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500', color: 'var(--accent-primary)'
                }}>{skill}</span>
                <BookOpen size={18} color="var(--text-muted)" />
              </div>
              <h3 style={{ marginBottom: '8px' }}>{`Daily Quiz: ${skill}`}</h3>
              <p style={{ marginBottom: '20px', flex: 1 }}>10 questions per day — 4 easy, 3 medium, 3 hard.</p>
              {results[skill] ? (
                <button onClick={() => viewResult(skill)} className="btn-secondary" style={{ width: '100%' }}>See Results</button>
              ) : (
                <button onClick={() => startAssessment(skill)} className="btn-primary" style={{ width: '100%' }}>Start Quiz</button>
              )}
            </div>
          ))}
        </div>
      )}

      {viewingResult && (
        <div className="modal-overlay" onClick={closeResult}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Today's Result - {viewingResult.domain}</h3>
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '10px' }}>
                {viewingResult.score}%
              </div>
              <p>{viewingResult.correctCount} out of {viewingResult.total} correct</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Attempted on {new Date(viewingResult.attemptedAt).toLocaleDateString()}
              </p>
              <p style={{ marginTop: '18px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Get ready to attend the next 10 interesting questions on "{viewingResult.domain}" tomorrow.
              </p>
            </div>
            <button onClick={closeResult} className="btn-primary" style={{ width: '100%' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillAssessment;
