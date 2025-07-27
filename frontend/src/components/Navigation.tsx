import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="nav">
      <div className="container">
        <ul>
          <li>
            <Link 
              to="/add-member" 
              className={isActive('/add-member') ? 'active' : ''}
            >
              Add Team Member
            </Link>
          </li>
          <li>
            <Link 
              to="/create-team" 
              className={isActive('/create-team') ? 'active' : ''}
            >
              Create Team
            </Link>
          </li>
          <li>
            <Link 
              to="/assign-team" 
              className={isActive('/assign-team') ? 'active' : ''}
            >
              Assign to Team
            </Link>
          </li>
          <li>
            <Link
              to="/give-feedback"
              className={isActive('/give-feedback') ? 'active' : ''}
            >
              Give Feedback
            </Link>
          </li>
          <li>
            <Link
              to="/feedbacks"
              className={isActive('/feedbacks') ? 'active' : ''}
            >
              View Feedbacks
            </Link>
          </li>
          <li>
            <Link
              to="/team-management"
              className={isActive('/team-management') ? 'active' : ''}
            >
              Team Management
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
