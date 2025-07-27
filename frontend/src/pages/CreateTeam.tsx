import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Team } from '../types';

export function CreateTeam() {
  const [teams, setTeams] = useLocalStorage<Team[]>('teams', []);
  const [formData, setFormData] = useState({
    name: '',
    logo: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setMessage('Team name is required');
      return;
    }

    const newTeam: Team = {
      id: Date.now().toString(),
      name: formData.name,
      logo: formData.logo || 'https://via.placeholder.com/100',
      members: []
    };

    setTeams([...teams, newTeam]);
    setFormData({ name: '', logo: '' });
    setMessage('Team created successfully!');
    
    setTimeout(() => setMessage(''), 3000);
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
      
      {message && (
        <div className={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </div>
      )}

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

        <button type="submit" className="btn">
          Create Team
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
                    src={team.logo} 
                    alt={team.name}
                    className="logo"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/100';
                    }}
                  />
                  <div>
                    <h3>{team.name}</h3>
                    <p>{team.members.length} members</p>
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
