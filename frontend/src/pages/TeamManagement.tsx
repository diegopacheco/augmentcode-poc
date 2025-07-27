import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api';

export function TeamManagement() {
  const { teams, persons, refreshTeams, refreshPersons } = useApp();
  const { showSuccess, showError } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  const getTeamMembers = (teamId: number) => {
    return persons.filter(person => person.team_id === teamId);
  };

  const handleRemoveFromTeam = async (personId: number, personName: string) => {
    if (!confirm(`Are you sure you want to remove ${personName} from their team?`)) {
      return;
    }

    try {
      await apiService.removePersonFromTeam(personId);
      await refreshPersons();
      showSuccess(`${personName} removed from team successfully`);
    } catch (error) {
      console.error('Failed to remove person from team:', error);
      showError('Failed to remove person from team');
    }
  };

  const handleDeleteTeam = async (teamId: number, teamName: string) => {
    const teamMembers = getTeamMembers(teamId);
    
    if (teamMembers.length > 0) {
      if (!confirm(`Team "${teamName}" has ${teamMembers.length} members. Deleting the team will remove all members from it. Are you sure?`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete team "${teamName}"?`)) {
        return;
      }
    }

    try {
      await apiService.deleteTeam(teamId);
      await refreshTeams();
      await refreshPersons(); // Refresh persons to update team assignments
      showSuccess(`Team "${teamName}" deleted successfully`);
      if (selectedTeam === teamId) {
        setSelectedTeam(null);
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
      showError('Failed to delete team');
    }
  };

  const selectedTeamData = selectedTeam ? teams.find(t => t.id === selectedTeam) : null;
  const selectedTeamMembers = selectedTeam ? getTeamMembers(selectedTeam) : [];

  return (
    <div className="page">
      <h1>Team Management</h1>
      
      <div className="team-management-layout">
        <div className="teams-sidebar">
          <h2>Teams ({teams.length})</h2>
          <div className="teams-list">
            {teams.length === 0 ? (
              <p className="empty-state">No teams created yet.</p>
            ) : (
              teams.map((team) => {
                const memberCount = getTeamMembers(team.id).length;
                return (
                  <div
                    key={team.id}
                    className={`team-item ${selectedTeam === team.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTeam(team.id)}
                  >
                    <div className="team-info">
                      <img 
                        src={team.logo || 'https://via.placeholder.com/40'} 
                        alt={team.name}
                        className="team-logo-small"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/40';
                        }}
                      />
                      <div>
                        <h3>{team.name}</h3>
                        <p>{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeam(team.id, team.name);
                      }}
                      className="btn btn-danger btn-small"
                      title="Delete team"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="team-details">
          {selectedTeamData ? (
            <>
              <div className="team-header">
                <img 
                  src={selectedTeamData.logo || 'https://via.placeholder.com/80'} 
                  alt={selectedTeamData.name}
                  className="team-logo"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/80';
                  }}
                />
                <div>
                  <h2>{selectedTeamData.name}</h2>
                  <p>{selectedTeamMembers.length} member{selectedTeamMembers.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="team-members">
                <h3>Team Members</h3>
                {selectedTeamMembers.length === 0 ? (
                  <p className="empty-state">No members in this team yet.</p>
                ) : (
                  <div className="members-list">
                    {selectedTeamMembers.map((member) => (
                      <div key={member.id} className="member-item">
                        <div className="member-info">
                          <img 
                            src={member.picture || 'https://via.placeholder.com/50'} 
                            alt={member.name}
                            className="member-avatar"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/50';
                            }}
                          />
                          <div>
                            <h4>{member.name}</h4>
                            <p>{member.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFromTeam(member.id, member.name)}
                          className="btn btn-warning btn-small"
                          title="Remove from team"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-team-selected">
              <p>Select a team from the left to view and manage its members.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
