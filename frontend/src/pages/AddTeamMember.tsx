import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Person } from '../types';

export function AddTeamMember() {
  const [people, setPeople] = useLocalStorage<Person[]>('people', []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    picture: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setMessage('Name and email are required');
      return;
    }

    const newPerson: Person = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      picture: formData.picture || 'https://via.placeholder.com/150'
    };

    setPeople([...people, newPerson]);
    setFormData({ name: '', email: '', picture: '' });
    setMessage('Team member added successfully!');
    
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
      <h1>Add Team Member</h1>
      
      {message && (
        <div className={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </div>
      )}

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

        <button type="submit" className="btn">
          Add Team Member
        </button>
      </form>

      {people.length > 0 && (
        <div>
          <h2>Team Members ({people.length})</h2>
          <div className="card-grid">
            {people.map((person) => (
              <div key={person.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img 
                    src={person.picture} 
                    alt={person.name}
                    className="avatar"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div>
                    <h3>{person.name}</h3>
                    <p>{person.email}</p>
                    {person.teamId && <p>Team: {person.teamId}</p>}
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
