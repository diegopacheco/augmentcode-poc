import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api';

export function GiveFeedback() {
  const { persons, teams, refreshFeedbacks } = useApp();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    targetType: 'person' as 'person' | 'team',
    targetId: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.targetId || !formData.content) {
      showError('Please select a target and provide feedback content');
      return;
    }

    const target = formData.targetType === 'person'
      ? persons.find(p => p.id === parseInt(formData.targetId))
      : teams.find(t => t.id === parseInt(formData.targetId));

    if (!target) {
      showError('Invalid target selection');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createFeedback({
        content: formData.content,
        target_type: formData.targetType,
        target_id: parseInt(formData.targetId)
      });

      await refreshFeedbacks();
      setFormData({ targetType: 'person', targetId: '', content: '' });
      showSuccess('Feedback submitted successfully!');
    } catch (error) {
      console.error('Failed to create feedback:', error);
      showError('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'targetType' ? { targetId: '' } : {})
    });
  };

  const targets = formData.targetType === 'person' ? persons : teams;

  return (
    <div className="page">
      <h1>Give Feedback</h1>

      {persons.length === 0 && teams.length === 0 && (
        <div className="error">
          No people or teams available. Please add team members and create teams first.
        </div>
      )}

      {(persons.length > 0 || teams.length > 0) && (
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
                  {formData.targetType === 'team' && ` (${(target as any).members?.length || 0} members)`}
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

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}
