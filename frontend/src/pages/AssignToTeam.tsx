import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api';

export function AssignToTeam() {
  const { persons, teams, refreshPersons } = useApp();
  const { showSuccess, showError } = useToast();
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPersonId || !selectedTeamId) {
      showError('Please select both a person and a team');
      return;
    }

    const person = persons.find(p => p.id === parseInt(selectedPersonId));
    const team = teams.find(t => t.id === parseInt(selectedTeamId));

    if (!person || !team) {
      showError('Invalid selection');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.assignToTeam({
        person_id: parseInt(selectedPersonId),
        team_id: parseInt(selectedTeamId)
      });

      await refreshPersons();
      setSelectedPersonId('');
      setSelectedTeamId('');
      showSuccess(`${person.name} assigned to ${team.name} successfully!`);
    } catch (error) {
      console.error('Failed to assign to team:', error);
      showError('Failed to assign person to team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const unassignedPeople = persons.filter(p => !p.team_id);
  const assignedPeople = persons.filter(p => p.team_id);

  return (
    <div className="page">
      <h1>Assign to Team</h1>

      {persons.length === 0 && (
        <div className="error">
          No team members available. Please add team members first.
        </div>
      )}

      {teams.length === 0 && (
        <div className="error">
          No teams available. Please create teams first.
        </div>
      )}

      {persons.length > 0 && teams.length > 0 && (
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
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} {person.team_id ? `(Currently in ${person.team?.name})` : '(Unassigned)'}
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
                  {team.name} ({team.members?.length || 0} members)
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? 'Assigning...' : 'Assign to Team'}
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
            {assignedPeople.map((person) => (
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
                    <p style={{ color: '#007bff' }}>Team: {person.team?.name}</p>
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
