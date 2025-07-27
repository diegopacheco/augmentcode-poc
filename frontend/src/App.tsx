import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AddTeamMember } from './pages/AddTeamMember';
import { CreateTeam } from './pages/CreateTeam';
import { AssignToTeam } from './pages/AssignToTeam';
import { GiveFeedback } from './pages/GiveFeedback';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/add-member" replace />} />
          <Route path="/add-member" element={<AddTeamMember />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/assign-team" element={<AssignToTeam />} />
          <Route path="/give-feedback" element={<GiveFeedback />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
