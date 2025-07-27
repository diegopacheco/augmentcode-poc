import { render, screen, fireEvent, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { CreateTeam } from '../CreateTeam'

const mockUseLocalStorage = vi.fn()

vi.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: () => mockUseLocalStorage()
}))

describe('CreateTeam', () => {
  const mockSetTeams = vi.fn()
  
  beforeEach(() => {
    mockUseLocalStorage.mockReturnValue([[], mockSetTeams])
    vi.clearAllMocks()
  })

  it('should render form elements', () => {
    render(<CreateTeam />)
    
    expect(screen.getByText('Create Team')).toBeInTheDocument()
    expect(screen.getByLabelText(/team name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/team logo url/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create team/i })).toBeInTheDocument()
  })

  it('should update form fields when typing', async () => {
    const user = userEvent.setup()
    render(<CreateTeam />)
    
    const nameInput = screen.getByLabelText(/team name/i)
    const logoInput = screen.getByLabelText(/team logo url/i)
    
    await user.type(nameInput, 'Development Team')
    await user.type(logoInput, 'https://example.com/logo.png')
    
    expect(nameInput).toHaveValue('Development Team')
    expect(logoInput).toHaveValue('https://example.com/logo.png')
  })

  it('should show error when submitting without team name', async () => {
    const user = userEvent.setup()
    render(<CreateTeam />)
    
    const submitButton = screen.getByRole('button', { name: /create team/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Team name is required')).toBeInTheDocument()
    expect(mockSetTeams).not.toHaveBeenCalled()
  })

  it('should successfully create team with name only', async () => {
    const user = userEvent.setup()
    render(<CreateTeam />)
    
    const nameInput = screen.getByLabelText(/team name/i)
    await user.type(nameInput, 'Development Team')
    
    const submitButton = screen.getByRole('button', { name: /create team/i })
    await user.click(submitButton)
    
    expect(mockSetTeams).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Development Team',
        logo: 'https://via.placeholder.com/100',
        members: [],
        id: expect.any(String)
      })
    ])
    
    expect(screen.getByText('Team created successfully!')).toBeInTheDocument()
  })

  it('should create team with custom logo', async () => {
    const user = userEvent.setup()
    render(<CreateTeam />)
    
    const nameInput = screen.getByLabelText(/team name/i)
    const logoInput = screen.getByLabelText(/team logo url/i)
    
    await user.type(nameInput, 'Design Team')
    await user.type(logoInput, 'https://example.com/design-logo.png')
    
    const submitButton = screen.getByRole('button', { name: /create team/i })
    await user.click(submitButton)
    
    expect(mockSetTeams).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Design Team',
        logo: 'https://example.com/design-logo.png',
        members: [],
        id: expect.any(String)
      })
    ])
  })

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup()
    render(<CreateTeam />)
    
    const nameInput = screen.getByLabelText(/team name/i)
    const logoInput = screen.getByLabelText(/team logo url/i)
    
    await user.type(nameInput, 'Development Team')
    await user.type(logoInput, 'https://example.com/logo.png')
    
    const submitButton = screen.getByRole('button', { name: /create team/i })
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
    expect(logoInput).toHaveValue('')
  })

  it('should clear success message after timeout', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup()
    render(<CreateTeam />)
    
    const nameInput = screen.getByLabelText(/team name/i)
    await user.type(nameInput, 'Test Team')
    
    const submitButton = screen.getByRole('button', { name: /create team/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Team created successfully!')).toBeInTheDocument()
    
    vi.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(screen.queryByText('Team created successfully!')).not.toBeInTheDocument()
    })
    
    vi.useRealTimers()
  })

  it('should display existing teams', () => {
    const existingTeams = [
      { id: '1', name: 'Development Team', logo: 'https://example.com/dev.png', members: ['1', '2'] },
      { id: '2', name: 'Design Team', logo: 'https://example.com/design.png', members: [] }
    ]
    mockUseLocalStorage.mockReturnValue([existingTeams, mockSetTeams])
    
    render(<CreateTeam />)
    
    expect(screen.getByText('Teams (2)')).toBeInTheDocument()
    expect(screen.getByText('Development Team')).toBeInTheDocument()
    expect(screen.getByText('2 members')).toBeInTheDocument()
    expect(screen.getByText('Design Team')).toBeInTheDocument()
    expect(screen.getByText('0 members')).toBeInTheDocument()
  })

  it('should handle logo image error with fallback', () => {
    const existingTeams = [
      { id: '1', name: 'Test Team', logo: 'invalid-url', members: [] }
    ]
    mockUseLocalStorage.mockReturnValue([existingTeams, mockSetTeams])
    
    render(<CreateTeam />)
    
    const image = screen.getByAltText('Test Team')
    fireEvent.error(image)
    
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/100')
  })

  it('should show correct member count for single member', () => {
    const existingTeams = [
      { id: '1', name: 'Solo Team', logo: 'https://example.com/solo.png', members: ['1'] }
    ]
    mockUseLocalStorage.mockReturnValue([existingTeams, mockSetTeams])
    
    render(<CreateTeam />)
    
    expect(screen.getByText('1 members')).toBeInTheDocument()
  })
})
