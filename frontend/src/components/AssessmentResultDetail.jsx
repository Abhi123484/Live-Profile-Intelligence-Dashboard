import React from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Home } from 'lucide-react';

const AssessmentResultDetail = ({ result, assessment, onClose, onRetake }) => {
  const [expandedQuestions, setExpandedQuestions] = React.useState({});

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const scorePct = Math.round(result.score);
  const color = scorePct >= 80 ? 'var(--success)' : scorePct >= 50 ? 'var(--warning)' : 'var(--danger)';
  const bgColor = scorePct >= 80 ? 'var(--success-bg)' : scorePct >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)';

  const scoreLabel = () => {
    if (scorePct >= 90) return 'Excellent!';
    if (scorePct >= 75) return 'Great!';
    if (scorePct >= 50) return 'Good!';
    return 'Keep Practicing!';
  };

  const getOptionLabel = (index) => String.fromCharCode(65 + index);

  return (
    <div className="animate-in" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '0' }}>
      {/* Header Section */}
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          width: '100px', height: '100px', margin: '0 auto 20px', borderRadius: '50%',
          background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {scorePct >= 50 ? (
            <CheckCircle2 size={50} color={color} />
          ) : (
            <XCircle size={50} color={color} />
          )}
        </div>
        <h2 style={{ marginBottom: '8px' }}>{scoreLabel()}</h2>
        <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>{assessment.title}</p>
        <div style={{ fontSize: '4rem', fontWeight: '900', color, lineHeight: 1, marginBottom: '8px' }}>
          {scorePct}%
        </div>
        <p style={{ marginBottom: '24px' }}>{result.correctCount} of {result.total} answers correct</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onClose} className="btn-primary" style={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
            <Home size={16} /> Go to Dashboard
          </button>
          <button onClick={onRetake} className="btn-secondary">Retake Quiz Tomorrow</button>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div>
        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Detailed Review</h3>
        
        {result.questionsReview && result.questionsReview.map((question, index) => {
          const isExpanded = expandedQuestions[index];
          const isCorrect = question.isCorrect;
          
          return (
            <div
              key={index}
              className="glass-card"
              style={{
                padding: '24px',
                marginBottom: '16px',
                borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}`,
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onClick={() => toggleQuestion(index)}
            >
              {/* Question Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: isCorrect ? 'var(--success)' : 'var(--danger)',
                      fontWeight: '600', fontSize: '0.9rem'
                    }}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Question {index + 1}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem',
                      background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: isCorrect ? 'var(--success)' : 'var(--danger)',
                      fontWeight: '500'
                    }}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <h4 style={{ marginBottom: '0', lineHeight: 1.5 }}>{question.text}</h4>
                </div>
                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '12px', color: 'var(--text-muted)' }}>
                      Your Answer
                    </p>
                    <div style={{
                      padding: '16px', borderRadius: '8px', background: question.isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${question.isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      display: 'flex', gap: '12px', alignItems: 'flex-start'
                    }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.2)',
                        fontWeight: '600', fontSize: '0.85rem', minWidth: '32px'
                      }}>
                        {getOptionLabel(question.userAnswer)}
                      </span>
                      <span>{question.options[question.userAnswer]}</span>
                    </div>
                  </div>

                  {!question.isCorrect && (
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '12px', color: 'var(--text-muted)' }}>
                        Correct Answer
                      </p>
                      <div style={{
                        padding: '16px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        display: 'flex', gap: '12px', alignItems: 'flex-start'
                      }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.2)',
                          fontWeight: '600', fontSize: '0.85rem', minWidth: '32px', color: 'var(--success)'
                        }}>
                          {getOptionLabel(question.correctAnswer)}
                        </span>
                        <span>{question.options[question.correctAnswer]}</span>
                      </div>
                    </div>
                  )}

                  {question.isCorrect && (
                    <div style={{
                      padding: '16px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      textAlign: 'center', color: 'var(--success)'
                    }}>
                      <p style={{ fontWeight: '500', marginBottom: '0' }}>Great! You selected the correct answer.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="glass-card" style={{ padding: '24px', marginTop: '30px', textAlign: 'center', background: 'rgba(56, 189, 248, 0.05)' }}>
        <h4 style={{ marginBottom: '12px' }}>Performance Summary</h4>
        <p style={{ marginBottom: '0', color: 'var(--text-muted)' }}>
          You answered {result.correctCount} out of {result.total} questions correctly. 
          {scorePct >= 80 && " Great performance! Keep up the excellent work."}
          {scorePct >= 50 && scorePct < 80 && " You're doing well. Review the incorrect answers to improve further."}
          {scorePct < 50 && " Focus on the areas where you had difficulties and try again tomorrow."}
        </p>
      </div>
    </div>
  );
};

export default AssessmentResultDetail;
