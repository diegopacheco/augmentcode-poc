import { render, screen, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { AssignToTeam } from '../AssignToTeam'

const mockUseLocalStoragePeople = vi.fn()
const mockUseLocalStorageTeams = vi.fn()

vi.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: (key: string) => {
    if (key === 'people') return mockUseLocalStoragePeople()
    if (key === 'teams') return mockUseLocalStorageTeams()
    return [[], vi.fn()]
  }
}))

describe('AssignToTeam', () => {
  const mockSetPeople = vi.fn()
  const mockSetTeams = vi.fn()
  
  beforeEach(() => {
    mockUseLocalStoragePeople.mockReturnValue([[], mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([[], mockSetTeams])
    vi.clearAllMocks()
  })

  it('should render page title', () => {
    render(<AssignToTeam />)
    expect(screen.getByText('Assign to Team')).toBeInTheDocument()
  })

  it('should show error when no people available', () => {
    render(<AssignToTeam />)
    expect(screen.getByText('No team members available. Please add team members first.')).toBeInTheDocument()
  })

  it('should show error when no teams available', () => {
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    
    render(<AssignToTeam />)
    expect(screen.getByText('No teams available. Please create teams first.')).toBeInTheDocument()
  })

  it('should render form when both people and teams exist', () => {
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]
    
    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([teams, mockSetTeams])
    
    render(<AssignToTeam />)
    
    expect(screen.getByLabelText(/select person/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/select team/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /assign to team/i })).toBeInTheDocument()
  })

  it('should populate person dropdown with people', () => {
    const people = [
      { id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic1.jpg' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', picture: 'pic2.jpg', teamId: 'team1' }
    ]
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]
    
    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([teams, mockSetTeams])
    
    render(<AssignToTeam />)
    
    expect(screen.getByText('John Doe (Unassigned)')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith (Currently in team)')).toBeInTheDocument()
  })

  it('should populate team dropdown with teams', () => {
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    const teams = [
      { id: '1', name: 'Dev Team', logo: 'logo1.jpg', members: [] },
      { id: '2', name: 'Design Team', logo: 'logo2.jpg', members: ['1', '2'] }
    ]
    
    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([teams, mockSetTeams])
    
    render(<AssignToTeam />)
    
    expect(screen.getByText('Dev Team (0 members)')).toBeInTheDocument()
    expect(screen.getByText('Design Team (2 members)')).toBeInTheDocument()
  })

  it('should show error when submitting without selections', async () => {
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]
    
    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([teams, mockSetTeams])
    
    render(<AssignToTeam />)
    
    const submitButton = screen.getByRole('button', { name: /assign to team/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Please select both a person and a team')).toBeInTheDocument()
  })

  it('should successfully assign person to team', async () => {
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]
    
    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([teams, mockSetTeams])
    
    render(<AssignToTeam />)
    
    const personSelect = screen.getByLabelText(/select person/i)
    const teamSelect = screen.getByLabelText(/select team/i)
    
    await user.selectOptions(personSelect, '1')
    await user.selectOptions(teamSelect, '1')
    
    const submitButton = screen.getByRole('button', { name: /assign to team/i })
    await user.click(submitButton)
    
    expect(mockSetPeople).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '1',
        teamId: '1'
      })
    ])
    
    expect(mockSetTeams).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '1',
        members: ['1']
      })
    ])
    
    expect(screen.getByText('John Doe assigned to Dev Team successfully!')).toBeInTheDocument()
  })

  it('should clear form after successful assignment', async () => {
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]
    
    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([teams, mockSetTeams])
    
    render(<AssignToTeam />)
    
    const personSelect = screen.getByLabelText(/select person/i)
    const teamSelect = screen.getByLabelText(/select team/i)
    
    await user.selectOptions(personSelect, '1')
    await user.selectOptions(teamSelect, '1')
    
    const submitButton = screen.getByRole('button', { name: /assign to team/i })
    await user.click(submitButton)
    
    expect(personSelect).toHaveValue('')
    expect(teamSelect).toHaveValue('')
  })

  it('should clear success message after timeout', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]
    
    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([teams, mockSetTeams])
    
    render(<AssignToTeam />)
    
    const personSelect = screen.getByLabelText(/select person/i)
    const teamSelect = screen.getByLabelText(/select team/i)
    
    await user.selectOptions(personSelect, '1')
    await user.selectOptions(teamSelect, '1')
    
    const submitButton = screen.getByRole('button', { name: /assign to team/i })
    await user.click(submitButton)
    
    expect(screen.getByText('John Doe assigned to Dev Team successfully!')).toBeInTheDocument()
    
    vi.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(screen.queryByText('John Doe assigned to Dev Team successfully!')).not.toBeInTheDocument()
    })
    
    vi.useRealTimers()
  })

  it('should display unassigned people section', () => {
    const people = [
      { id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic1.jpg' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', picture: 'pic2.jpg', teamId: 'team1' }
    ]
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]

    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([teams, mockSetTeams])

    render(<AssignToTeam />)

    expect(screen.getByText('Unassigned People (1)')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Unassigned')).toBeInTheDocument()
  })

  it('should display assigned people section', () => {
    const people = [
      { id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic1.jpg' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', picture: 'pic2.jpg', teamId: 'team1' }
    ]
    const teams = [
      { id: 'team1', name: 'Dev Team', logo: 'logo.jpg', members: ['2'] }
    ]

    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([teams, mockSetTeams])

    render(<AssignToTeam />)

    expect(screen.getByText('Assigned People (1)')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Team: Dev Team')).toBeInTheDocument()
  })

  it('should remove person from previous team when reassigning', async () => {
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg', teamId: 'team1' }]
    const teams = [
      { id: 'team1', name: 'Old Team', logo: 'logo1.jpg', members: ['1'] },
      { id: 'team2', name: 'New Team', logo: 'logo2.jpg', members: [] }
    ]

    mockUseLocalStoragePeople.mockReturnValue([people, mockSetPeople])
    mockUseLocalStorageTeams.mockReturnValue([teams, mockSetTeams])

    render(<AssignToTeam />)

    const personSelect = screen.getByLabelText(/select person/i)
    const teamSelect = screen.getByLabelText(/select team/i)

    await user.selectOptions(personSelect, '1')
    await user.selectOptions(teamSelect, 'team2')

    const submitButton = screen.getByRole('button', { name: /assign to team/i })
    await user.click(submitButton)

    expect(mockSetTeams).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'team1',
        members: []
      }),
      expect.objectContaining({
        id: 'team2',
        members: ['1']
      })
    ])
  })
})
