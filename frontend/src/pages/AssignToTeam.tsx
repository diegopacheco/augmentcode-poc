import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Person, Team } from '../types';

export function AssignToTeam() {
  const [people, setPeople] = useLocalStorage<Person[]>('people', []);
  const [teams, setTeams] = useLocalStorage<Team[]>('teams', []);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPersonId || !selectedTeamId) {
      setMessage('Please select both a person and a team');
      return;
    }

    const person = people.find(p => p.id === selectedPersonId);
    const team = teams.find(t => t.id === selectedTeamId);

    if (!person || !team) {
      setMessage('Invalid selection');
      return;
    }

    const updatedPeople = people.map(p => 
      p.id === selectedPersonId 
        ? { ...p, teamId: selectedTeamId }
        : p
    );

    const updatedTeams = teams.map(t => 
      t.id === selectedTeamId 
        ? { ...t, members: [...t.members.filter(id => id !== selectedPersonId), selectedPersonId] }
        : { ...t, members: t.members.filter(id => id !== selectedPersonId) }
    );

    setPeople(updatedPeople);
    setTeams(updatedTeams);
    setSelectedPersonId('');
    setSelectedTeamId('');
    setMessage(`${person.name} assigned to ${team.name} successfully!`);
    
    setTimeout(() => setMessage(''), 3000);
  };

  const unassignedPeople = people.filter(p => !p.teamId);
  const assignedPeople = people.filter(p => p.teamId);

  return (
    <div className="page">
      <h1>Assign to Team</h1>
      
      {message && (
        <div className={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </div>
      )}

      {people.length === 0 && (
        <div className="error">
          No team members available. Please add team members first.
        </div>
      )}

      {teams.length === 0 && (
        <div className="error">
          No teams available. Please create teams first.
        </div>
      )}

      {people.length > 0 && teams.length > 0 && (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="person">Select Person</label>
            <select
              id="person"
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              required
            >
              <option value="">Choose a person...</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} {person.teamId ? `(Currently in team)` : '(Unassigned)'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="team">Select Team</label>
            <select
              id="team"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              required
            >
              <option value="">Choose a team...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.members.length} members)
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn">
            Assign to Team
          </button>
        </form>
      )}

      {unassignedPeople.length > 0 && (
        <div>
          <h2>Unassigned People ({unassignedPeople.length})</h2>
          <div className="card-grid">
            {unassignedPeople.map((person) => (
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
                    <p style={{ color: '#666' }}>Unassigned</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {assignedPeople.length > 0 && (
        <div>
          <h2>Assigned People ({assignedPeople.length})</h2>
          <div className="card-grid">
            {assignedPeople.map((person) => {
              const team = teams.find(t => t.id === person.teamId);
              return (
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
                      <p style={{ color: '#007bff' }}>Team: {team?.name}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
