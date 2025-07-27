import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api';

export function Feedbacks() {
  const { feedbacks, persons, teams, refreshFeedbacks } = useApp();
  const { showSuccess, showError } = useToast();
  const [filterType, setFilterType] = useState<'all' | 'person' | 'team'>('all');
  const [filterTarget, setFilterTarget] = useState<string>('');

  const filteredFeedbacks = useMemo(() => {
    let filtered = feedbacks;

    if (filterType !== 'all') {
      filtered = filtered.filter(feedback => feedback.target_type === filterType);
    }

    if (filterTarget) {
      filtered = filtered.filter(feedback => 
        feedback.target_id === parseInt(filterTarget)
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [feedbacks, filterType, filterTarget]);

  const getTargetOptions = () => {
    if (filterType === 'person') {
      return persons.map(person => ({
        value: person.id.toString(),
        label: person.name
      }));
    } else if (filterType === 'team') {
      return teams.map(team => ({
        value: team.id.toString(),
        label: team.name
      }));
    }
    return [];
  };

  const handleDeleteFeedback = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await apiService.deleteFeedback(id);
      await refreshFeedbacks();
      showSuccess('Feedback deleted successfully');
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      showError('Failed to delete feedback');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page">
      <h1>Feedbacks</h1>
      
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="filterType">Filter by Type:</label>
          <select
            id="filterType"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as 'all' | 'person' | 'team');
              setFilterTarget('');
            }}
          >
            <option value="all">All Feedbacks</option>
            <option value="person">Person Feedbacks</option>
            <option value="team">Team Feedbacks</option>
          </select>
        </div>

        {filterType !== 'all' && (
          <div className="filter-group">
            <label htmlFor="filterTarget">Filter by {filterType === 'person' ? 'Person' : 'Team'}:</label>
            <select
              id="filterTarget"
              value={filterTarget}
              onChange={(e) => setFilterTarget(e.target.value)}
            >
              <option value="">All {filterType === 'person' ? 'People' : 'Teams'}</option>
              {getTargetOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="feedback-stats">
        <p>Showing {filteredFeedbacks.length} of {feedbacks.length} feedbacks</p>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <div className="empty-state">
          <p>No feedbacks found matching your filters.</p>
        </div>
      ) : (
        <div className="feedback-list">
          {filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="feedback-card">
              <div className="feedback-header">
                <div className="feedback-target">
                  <span className={`target-type target-${feedback.target_type}`}>
                    {feedback.target_type === 'person' ? '👤' : '👥'} {feedback.target_type}
                  </span>
                  <span className="target-name">{feedback.target_name}</span>
                </div>
                <div className="feedback-actions">
                  <span className="feedback-date">{formatDate(feedback.created_at)}</span>
                  <button
                    onClick={() => handleDeleteFeedback(feedback.id)}
                    className="btn btn-danger btn-small"
                    title="Delete feedback"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="feedback-content">
                <p>{feedback.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
