import React, { useState, useEffect } from 'react';
import { getDomains } from '../services/adminApi';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from '../services/adminApi';
import { HelpCircle, Plus, Trash2, Edit3, X, Save, AlertCircle, CheckCircle, Filter, Loader } from 'lucide-react';

const ManageQuestions = () => {
  const [domains, setDomains] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filterDomain, setFilterDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    domainId: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'medium'
  });

  useEffect(() => {
    fetchDomains();
    fetchQuestions();
  }, []);

  useEffect(() => {
    fetchQuestions(filterDomain);
  }, [filterDomain]);

  const fetchDomains = async () => {
    try {
      const res = await getDomains();
      setDomains(res.data);
      if (!form.domainId && res.data.length === 1) {
        setForm((prev) => ({ ...prev, domainId: res.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load domains');
    }
  };

  const resetForm = () => {
    setForm((prev) => ({
      domainId: filterDomain || prev.domainId || (domains.length === 1 ? domains[0]._id : ''),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium'
    }));
    setEditingId(null);
  };

  const fetchQuestions = async (domainId) => {
    setLoading(true);
    try {
      const res = await getQuestions(domainId || '');
      setQuestions(res.data);
    } catch (err) {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.domainId || !form.question || form.options.some(o => !o.trim())) {
      setError('All fields are required. Please fill in every option.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateQuestion(editingId, form);
        setSuccess('Question updated successfully!');
      } else {
        await addQuestion(form);
        setSuccess('Question added successfully!');
      }
      resetForm();
      fetchQuestions(filterDomain);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (q) => {
    setForm({
      domainId: q.domainId?._id || q.domainId,
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty
    });
    setEditingId(q._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuestion(id);
      setSuccess('Question deleted.');
      fetchQuestions(filterDomain);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  const difficultyColors = {
    easy: { bg: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.25)' },
    medium: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' },
    hard: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' }
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div style={{
          width: '42px', height: '42px',
          background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
        }}>
          <HelpCircle size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.6rem', background: 'linear-gradient(135deg, #f9a8d4, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Manage Questions
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {questions.length} question{questions.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="error-banner" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="success-banner" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Add / Edit Form */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px', borderColor: editingId ? 'rgba(245, 158, 11, 0.3)' : 'rgba(236, 72, 153, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: editingId ? '#f59e0b' : '#f9a8d4', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingId ? <><Edit3 size={18} /> Edit Question</> : <><Plus size={18} /> Add New Question</>}
          </h3>
          {editingId && (
            <button
              onClick={resetForm}
              style={{
                padding: '6px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <X size={14} /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label>Domain</label>
              <select
                value={form.domainId}
                onChange={(e) => setForm({ ...form, domainId: e.target.value })}
                style={{ marginBottom: '0', color: '#111', background: '#fff' }}
              >
                <option value="">Select a domain</option>
                {domains.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                style={{ marginBottom: '0', color: '#111', background: '#fff' }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Question</label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter your question here..."
              rows={3}
              style={{ marginBottom: '0', resize: 'vertical' }}
            />
          </div>

          <label>Options (select the correct answer)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {form.options.map((opt, i) => (
              <div
                key={i}
                onClick={() => setForm({ ...form, correctAnswer: i })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '4px',
                  borderRadius: '10px',
                  border: form.correctAnswer === i
                    ? '2px solid rgba(34, 197, 94, 0.5)'
                    : '2px solid transparent',
                  background: form.correctAnswer === i
                    ? 'rgba(34, 197, 94, 0.05)'
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  border: form.correctAnswer === i
                    ? '2px solid #22c55e'
                    : '2px solid var(--glass-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  flexShrink: 0,
                  color: form.correctAnswer === i ? '#22c55e' : 'var(--text-muted)',
                  background: form.correctAnswer === i ? 'rgba(34, 197, 94, 0.15)' : 'transparent'
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginBottom: '0', flex: 1 }}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', marginTop: '-8px' }}>
            💡 Click on an option to mark it as the correct answer
          </p>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '12px 28px',
              background: editingId
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #ec4899, #f43f5e)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition)',
              opacity: submitting ? 0.6 : 1
            }}
          >
            {submitting ? <Loader size={16} /> : editingId ? <Save size={16} /> : <Plus size={16} />}
            {submitting ? 'Saving...' : editingId ? 'Update Question' : 'Add Question'}
          </button>
        </form>
      </div>

      {/* Filter & List */}
      <div className="glass-card" style={{ padding: '28px', borderColor: 'rgba(236, 72, 153, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ color: '#f9a8d4' }}>Question Bank</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              style={{ marginBottom: '0', width: '200px', padding: '8px 12px', fontSize: '0.82rem', color: '#111', background: '#fff' }}
            >
              <option value="">All Domains</option>
              {domains.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />)}
          </div>
        ) : questions.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No questions found. {filterDomain ? 'Try a different filter or ' : ''}Add your first question above.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {questions.map((q, index) => {
              const dc = difficultyColors[q.difficulty] || difficultyColors.medium;
              return (
                <div
                  key={q._id}
                  style={{
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(139, 92, 246, 0.08)',
                    borderRadius: '12px',
                    transition: 'var(--transition)',
                    animation: `fadeIn 0.3s ease-out ${index * 0.04}s both`
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '6px', lineHeight: '1.4' }}>
                        {q.question}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          background: 'rgba(139, 92, 246, 0.12)',
                          color: '#a78bfa',
                          border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}>
                          {q.domainId?.name || 'Unknown'}
                        </span>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          background: dc.bg,
                          color: dc.color,
                          border: `1px solid ${dc.border}`,
                          textTransform: 'capitalize'
                        }}>
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleEdit(q)}
                        style={{
                          padding: '7px 12px',
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.15)',
                          borderRadius: '8px',
                          color: '#f59e0b',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '5px',
                          fontSize: '0.78rem', fontWeight: '500'
                        }}
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        style={{
                          padding: '7px 12px',
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.15)',
                          borderRadius: '8px',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '5px',
                          fontSize: '0.78rem', fontWeight: '500'
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          background: i === q.correctAnswer
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(255, 255, 255, 0.03)',
                          border: i === q.correctAnswer
                            ? '1px solid rgba(34, 197, 94, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.05)',
                          color: i === q.correctAnswer
                            ? '#22c55e'
                            : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{
                          fontWeight: '700',
                          fontSize: '0.72rem',
                          opacity: 0.6,
                          width: '18px'
                        }}>
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {opt}
                        {i === q.correctAnswer && (
                          <CheckCircle size={14} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageQuestions;
