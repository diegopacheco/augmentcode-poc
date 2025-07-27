import { render, screen } from '../test-utils'
import App from '../App'

vi.mock('../components/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  )
}))

vi.mock('../pages/AddTeamMember', () => ({
  AddTeamMember: () => <div data-testid="add-team-member">Add Team Member Page</div>
}))

vi.mock('../pages/CreateTeam', () => ({
  CreateTeam: () => <div data-testid="create-team">Create Team Page</div>
}))

vi.mock('../pages/AssignToTeam', () => ({
  AssignToTeam: () => <div data-testid="assign-to-team">Assign to Team Page</div>
}))

vi.mock('../pages/GiveFeedback', () => ({
  GiveFeedback: () => <div data-testid="give-feedback">Give Feedback Page</div>
}))

describe('App', () => {
  it('should render layout component', () => {
    render(<App />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('should redirect root path to add-member', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByTestId('add-team-member')).toBeInTheDocument()
  })

  it('should render AddTeamMember component for /add-member route', () => {
    window.history.pushState({}, '', '/add-member')
    render(<App />)
    expect(screen.getByTestId('add-team-member')).toBeInTheDocument()
    expect(screen.getByText('Add Team Member Page')).toBeInTheDocument()
  })

  it('should render CreateTeam component for /create-team route', () => {
    window.history.pushState({}, '', '/create-team')
    render(<App />)
    expect(screen.getByTestId('create-team')).toBeInTheDocument()
    expect(screen.getByText('Create Team Page')).toBeInTheDocument()
  })

  it('should render AssignToTeam component for /assign-team route', () => {
    window.history.pushState({}, '', '/assign-team')
    render(<App />)
    expect(screen.getByTestId('assign-to-team')).toBeInTheDocument()
    expect(screen.getByText('Assign to Team Page')).toBeInTheDocument()
  })

  it('should render GiveFeedback component for /give-feedback route', () => {
    window.history.pushState({}, '', '/give-feedback')
    render(<App />)
    expect(screen.getByTestId('give-feedback')).toBeInTheDocument()
    expect(screen.getByText('Give Feedback Page')).toBeInTheDocument()
  })

  it('should wrap all routes in Layout component', () => {
    window.history.pushState({}, '', '/add-member')
    render(<App />)
    
    const layout = screen.getByTestId('layout')
    const page = screen.getByTestId('add-team-member')
    
    expect(layout).toContainElement(page)
  })

  it('should handle unknown routes gracefully', () => {
    window.history.pushState({}, '', '/unknown-route')
    render(<App />)
    
    expect(screen.getByTestId('layout')).toBeInTheDocument()
    expect(screen.queryByTestId('add-team-member')).not.toBeInTheDocument()
    expect(screen.queryByTestId('create-team')).not.toBeInTheDocument()
    expect(screen.queryByTestId('assign-to-team')).not.toBeInTheDocument()
    expect(screen.queryByTestId('give-feedback')).not.toBeInTheDocument()
  })
})
