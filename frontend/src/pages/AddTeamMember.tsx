import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api';

export function AddTeamMember() {
  const { persons, refreshPersons } = useApp();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    picture: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      showError('Name and email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createPerson({
        name: formData.name,
        email: formData.email,
        picture: formData.picture || 'https://via.placeholder.com/150'
      });

      await refreshPersons();
      setFormData({ name: '', email: '', picture: '' });
      showSuccess('Team member added successfully!');
    } catch (error) {
      console.error('Failed to create person:', error);
      showError('Failed to add team member');
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
      <h1>Add Team Member</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
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
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="picture">Picture URL</label>
          <input
            type="url"
            id="picture"
            name="picture"
            value={formData.picture}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Team Member'}
        </button>
      </form>

      {persons.length > 0 && (
        <div>
          <h2>Team Members ({persons.length})</h2>
          <div className="card-grid">
            {persons.map((person) => (
              <div key={person.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={person.picture || 'https://via.placeholder.com/150'}
                    alt={person.name}
                    className="avatar"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div>
                    <h3>{person.name}</h3>
                    <p>{person.email}</p>
                    {person.team && <p>Team: {person.team.name}</p>}
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
