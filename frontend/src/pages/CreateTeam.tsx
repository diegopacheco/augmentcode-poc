import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api';

export function CreateTeam() {
  const { teams, refreshTeams } = useApp();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    logo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      showError('Team name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createTeam({
        name: formData.name,
        logo: formData.logo || 'https://via.placeholder.com/100'
      });

      await refreshTeams();
      setFormData({ name: '', logo: '' });
      showSuccess('Team created successfully!');
    } catch (error) {
      console.error('Failed to create team:', error);
      showError('Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="page">
      <h1>Create Team</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Team Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="logo">Team Logo URL</label>
          <input
            type="url"
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Team'}
        </button>
      </form>

      {teams.length > 0 && (
        <div>
          <h2>Teams ({teams.length})</h2>
          <div className="card-grid">
            {teams.map((team) => (
              <div key={team.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={team.logo || 'https://via.placeholder.com/100'}
                    alt={team.name}
                    className="logo"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/100';
                    }}
                  />
                  <div>
                    <h3>{team.name}</h3>
                    <p>{team.members?.length || 0} members</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
