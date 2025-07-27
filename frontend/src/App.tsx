import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { AddTeamMember } from './pages/AddTeamMember';
import { CreateTeam } from './pages/CreateTeam';
import { AssignToTeam } from './pages/AssignToTeam';
import { GiveFeedback } from './pages/GiveFeedback';
import { Feedbacks } from './pages/Feedbacks';
import { TeamManagement } from './pages/TeamManagement';

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/add-member" replace />} />
              <Route path="/add-member" element={<AddTeamMember />} />
              <Route path="/create-team" element={<CreateTeam />} />
              <Route path="/assign-team" element={<AssignToTeam />} />
              <Route path="/give-feedback" element={<GiveFeedback />} />
              <Route path="/feedbacks" element={<Feedbacks />} />
              <Route path="/team-management" element={<TeamManagement />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
