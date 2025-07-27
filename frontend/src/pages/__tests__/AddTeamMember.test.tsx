import { render, screen, fireEvent, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { AddTeamMember } from '../AddTeamMember'

const mockUseLocalStorage = vi.fn()

vi.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: () => mockUseLocalStorage()
}))

describe('AddTeamMember', () => {
  const mockSetPeople = vi.fn()
  
  beforeEach(() => {
    mockUseLocalStorage.mockReturnValue([[], mockSetPeople])
    vi.clearAllMocks()
  })

  it('should render form elements', () => {
    render(<AddTeamMember />)
    
    expect(screen.getByText('Add Team Member')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/picture url/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add team member/i })).toBeInTheDocument()
  })

  it('should update form fields when typing', async () => {
    const user = userEvent.setup()
    render(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const pictureInput = screen.getByLabelText(/picture url/i)
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(pictureInput, 'https://example.com/photo.jpg')
    
    expect(nameInput).toHaveValue('John Doe')
    expect(emailInput).toHaveValue('john@example.com')
    expect(pictureInput).toHaveValue('https://example.com/photo.jpg')
  })

  it('should show error when submitting without required fields', async () => {
    const user = userEvent.setup()
    render(<AddTeamMember />)
    
    const submitButton = screen.getByRole('button', { name: /add team member/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Name and email are required')).toBeInTheDocument()
    expect(mockSetPeople).not.toHaveBeenCalled()
  })

  it('should show error when submitting with only name', async () => {
    const user = userEvent.setup()
    render(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, 'John Doe')
    
    const submitButton = screen.getByRole('button', { name: /add team member/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Name and email are required')).toBeInTheDocument()
    expect(mockSetPeople).not.toHaveBeenCalled()
  })

  it('should show error when submitting with only email', async () => {
    const user = userEvent.setup()
    render(<AddTeamMember />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'john@example.com')
    
    const submitButton = screen.getByRole('button', { name: /add team member/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Name and email are required')).toBeInTheDocument()
    expect(mockSetPeople).not.toHaveBeenCalled()
  })

  it('should successfully add team member with required fields', async () => {
    const user = userEvent.setup()
    render(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    
    const submitButton = screen.getByRole('button', { name: /add team member/i })
    await user.click(submitButton)
    
    expect(mockSetPeople).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://via.placeholder.com/150',
        id: expect.any(String)
      })
    ])
    
    expect(screen.getByText('Team member added successfully!')).toBeInTheDocument()
  })

  it('should add team member with custom picture', async () => {
    const user = userEvent.setup()
    render(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const pictureInput = screen.getByLabelText(/picture url/i)
    
    await user.type(nameInput, 'Jane Doe')
    await user.type(emailInput, 'jane@example.com')
    await user.type(pictureInput, 'https://example.com/jane.jpg')
    
    const submitButton = screen.getByRole('button', { name: /add team member/i })
    await user.click(submitButton)
    
    expect(mockSetPeople).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
        picture: 'https://example.com/jane.jpg',
        id: expect.any(String)
      })
    ])
  })

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup()
    render(<AddTeamMember />)
    
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const pictureInput = screen.getByLabelText(/picture url/i)
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(pictureInput, 'https://example.com/photo.jpg')
    
    const submitButton = screen.getByRole('button', { name: /add team member/i })
    await user.click(submitButton)
    
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
    expect(pictureInput).toHaveValue('')
  })

  it('should clear success message after timeout', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup()
    render(<AddTeamMember />)

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')

    const submitButton = screen.getByRole('button', { name: /add team member/i })
    await user.click(submitButton)

    expect(screen.getByText('Team member added successfully!')).toBeInTheDocument()

    vi.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(screen.queryByText('Team member added successfully!')).not.toBeInTheDocument()
    })

    vi.useRealTimers()
  })

  it('should display existing team members', () => {
    const existingPeople = [
      { id: '1', name: 'John Doe', email: 'john@example.com', picture: 'https://example.com/john.jpg' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', picture: 'https://example.com/jane.jpg', teamId: 'team1' }
    ]
    mockUseLocalStorage.mockReturnValue([existingPeople, mockSetPeople])

    render(<AddTeamMember />)

    expect(screen.getByText('Team Members (2)')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('should handle image error with fallback', () => {
    const existingPeople = [
      { id: '1', name: 'John Doe', email: 'john@example.com', picture: 'invalid-url' }
    ]
    mockUseLocalStorage.mockReturnValue([existingPeople, mockSetPeople])

    render(<AddTeamMember />)

    const image = screen.getByAltText('John Doe')
    fireEvent.error(image)

    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/150')
  })
})
