import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Person, Team, Feedback } from '../types';

export function GiveFeedback() {
  const [people] = useLocalStorage<Person[]>('people', []);
  const [teams] = useLocalStorage<Team[]>('teams', []);
  const [feedback, setFeedback] = useLocalStorage<Feedback[]>('feedback', []);
  const [formData, setFormData] = useState({
    targetType: 'person' as 'person' | 'team',
    targetId: '',
    content: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.targetId || !formData.content) {
      setMessage('Please select a target and provide feedback content');
      return;
    }

    const target = formData.targetType === 'person' 
      ? people.find(p => p.id === formData.targetId)
      : teams.find(t => t.id === formData.targetId);

    if (!target) {
      setMessage('Invalid target selection');
      return;
    }

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      content: formData.content,
      targetType: formData.targetType,
      targetId: formData.targetId,
      targetName: target.name,
      createdAt: new Date().toISOString()
    };

    setFeedback([...feedback, newFeedback]);
    setFormData({ targetType: 'person', targetId: '', content: '' });
    setMessage('Feedback submitted successfully!');
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'targetType' ? { targetId: '' } : {})
    });
  };

  const targets = formData.targetType === 'person' ? people : teams;

  return (
    <div className="page">
      <h1>Give Feedback</h1>
      
      {message && (
        <div className={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </div>
      )}

      {people.length === 0 && teams.length === 0 && (
        <div className="error">
          No people or teams available. Please add team members and create teams first.
        </div>
      )}

      {(people.length > 0 || teams.length > 0) && (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="targetType">Feedback Type</label>
            <select
              id="targetType"
              name="targetType"
              value={formData.targetType}
              onChange={handleChange}
            >
              <option value="person">Person</option>
              <option value="team">Team</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="targetId">
              Select {formData.targetType === 'person' ? 'Person' : 'Team'}
            </label>
            <select
              id="targetId"
              name="targetId"
              value={formData.targetId}
              onChange={handleChange}
              required
            >
              <option value="">Choose a {formData.targetType}...</option>
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.name}
                  {formData.targetType === 'team' && ` (${(target as Team).members.length} members)`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Feedback Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter your feedback here..."
              required
            />
          </div>

          <button type="submit" className="btn">
            Submit Feedback
          </button>
        </form>
      )}

      {feedback.length > 0 && (
        <div>
          <h2>Feedback History ({feedback.length})</h2>
          <div className="card-grid">
            {feedback
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((item) => (
                <div key={item.id} className="card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3>{item.targetName}</h3>
                      <span style={{ 
                        background: item.targetType === 'person' ? '#e3f2fd' : '#f3e5f5',
                        color: item.targetType === 'person' ? '#1976d2' : '#7b1fa2',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {item.targetType.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ marginBottom: '0.5rem' }}>{item.content}</p>
                    <p style={{ color: '#666', fontSize: '0.875rem' }}>
                      {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
