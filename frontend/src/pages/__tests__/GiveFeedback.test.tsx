import { render, screen, waitFor } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { GiveFeedback } from '../GiveFeedback'

const mockUseLocalStoragePeople = vi.fn()
const mockUseLocalStorageTeams = vi.fn()
const mockUseLocalStorageFeedback = vi.fn()

vi.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: (key: string) => {
    if (key === 'people') return mockUseLocalStoragePeople()
    if (key === 'teams') return mockUseLocalStorageTeams()
    if (key === 'feedback') return mockUseLocalStorageFeedback()
    return [[], vi.fn()]
  }
}))

describe('GiveFeedback', () => {
  const mockSetFeedback = vi.fn()
  
  beforeEach(() => {
    mockUseLocalStoragePeople.mockReturnValue([[], vi.fn()])
    mockUseLocalStorageTeams.mockReturnValue([[], vi.fn()])
    mockUseLocalStorageFeedback.mockReturnValue([[], mockSetFeedback])
    vi.clearAllMocks()
  })

  it('should render page title', () => {
    render(<GiveFeedback />)
    expect(screen.getByText('Give Feedback')).toBeInTheDocument()
  })

  it('should show error when no people or teams available', () => {
    render(<GiveFeedback />)
    expect(screen.getByText('No people or teams available. Please add team members and create teams first.')).toBeInTheDocument()
  })

  it('should render form when people exist', () => {
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    
    render(<GiveFeedback />)
    
    expect(screen.getByLabelText(/feedback type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/select person/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/feedback content/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument()
  })

  it('should render form when teams exist', () => {
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]
    mockUseLocalStorageTeams.mockReturnValue([teams, vi.fn()])
    
    render(<GiveFeedback />)
    
    expect(screen.getByLabelText(/feedback type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/feedback content/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument()
  })

  it('should switch between person and team feedback types', async () => {
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]
    
    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    mockUseLocalStorageTeams.mockReturnValue([teams, vi.fn()])
    
    render(<GiveFeedback />)
    
    const typeSelect = screen.getByLabelText(/feedback type/i)
    
    expect(screen.getByLabelText(/select person/i)).toBeInTheDocument()
    
    await user.selectOptions(typeSelect, 'team')
    
    expect(screen.getByLabelText(/select team/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/select person/i)).not.toBeInTheDocument()
  })

  it('should populate person dropdown', () => {
    const people = [
      { id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic1.jpg' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', picture: 'pic2.jpg' }
    ]
    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    
    render(<GiveFeedback />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('should populate team dropdown', async () => {
    const user = userEvent.setup()
    const teams = [
      { id: '1', name: 'Dev Team', logo: 'logo1.jpg', members: [] },
      { id: '2', name: 'Design Team', logo: 'logo2.jpg', members: ['1', '2'] }
    ]
    mockUseLocalStorageTeams.mockReturnValue([teams, vi.fn()])
    
    render(<GiveFeedback />)
    
    const typeSelect = screen.getByLabelText(/feedback type/i)
    await user.selectOptions(typeSelect, 'team')
    
    expect(screen.getByText('Dev Team (0 members)')).toBeInTheDocument()
    expect(screen.getByText('Design Team (2 members)')).toBeInTheDocument()
  })

  it('should show error when submitting without target selection', async () => {
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    
    render(<GiveFeedback />)
    
    const contentTextarea = screen.getByLabelText(/feedback content/i)
    await user.type(contentTextarea, 'Great work!')
    
    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Please select a target and provide feedback content')).toBeInTheDocument()
  })

  it('should show error when submitting without content', async () => {
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    
    render(<GiveFeedback />)
    
    const targetSelect = screen.getByLabelText(/select person/i)
    await user.selectOptions(targetSelect, '1')
    
    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Please select a target and provide feedback content')).toBeInTheDocument()
  })

  it('should successfully submit person feedback', async () => {
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    
    render(<GiveFeedback />)
    
    const targetSelect = screen.getByLabelText(/select person/i)
    const contentTextarea = screen.getByLabelText(/feedback content/i)
    
    await user.selectOptions(targetSelect, '1')
    await user.type(contentTextarea, 'Excellent performance!')
    
    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    await user.click(submitButton)
    
    expect(mockSetFeedback).toHaveBeenCalledWith([
      expect.objectContaining({
        content: 'Excellent performance!',
        targetType: 'person',
        targetId: '1',
        targetName: 'John Doe',
        id: expect.any(String),
        createdAt: expect.any(String)
      })
    ])
    
    expect(screen.getByText('Feedback submitted successfully!')).toBeInTheDocument()
  })

  it('should successfully submit team feedback', async () => {
    const user = userEvent.setup()
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]
    mockUseLocalStorageTeams.mockReturnValue([teams, vi.fn()])
    
    render(<GiveFeedback />)
    
    const typeSelect = screen.getByLabelText(/feedback type/i)
    await user.selectOptions(typeSelect, 'team')
    
    const targetSelect = screen.getByLabelText(/select team/i)
    const contentTextarea = screen.getByLabelText(/feedback content/i)
    
    await user.selectOptions(targetSelect, '1')
    await user.type(contentTextarea, 'Great teamwork!')
    
    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    await user.click(submitButton)
    
    expect(mockSetFeedback).toHaveBeenCalledWith([
      expect.objectContaining({
        content: 'Great teamwork!',
        targetType: 'team',
        targetId: '1',
        targetName: 'Dev Team',
        id: expect.any(String),
        createdAt: expect.any(String)
      })
    ])
  })

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    
    render(<GiveFeedback />)
    
    const targetSelect = screen.getByLabelText(/select person/i)
    const contentTextarea = screen.getByLabelText(/feedback content/i)
    
    await user.selectOptions(targetSelect, '1')
    await user.type(contentTextarea, 'Great work!')
    
    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    await user.click(submitButton)
    
    expect(targetSelect).toHaveValue('')
    expect(contentTextarea).toHaveValue('')
  })

  it('should clear success message after timeout', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    
    render(<GiveFeedback />)
    
    const targetSelect = screen.getByLabelText(/select person/i)
    const contentTextarea = screen.getByLabelText(/feedback content/i)
    
    await user.selectOptions(targetSelect, '1')
    await user.type(contentTextarea, 'Great work!')
    
    const submitButton = screen.getByRole('button', { name: /submit feedback/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Feedback submitted successfully!')).toBeInTheDocument()
    
    vi.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(screen.queryByText('Feedback submitted successfully!')).not.toBeInTheDocument()
    })
    
    vi.useRealTimers()
  })

  it('should display feedback history', () => {
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    const existingFeedback = [
      {
        id: '1',
        content: 'Great work!',
        targetType: 'person' as const,
        targetId: '1',
        targetName: 'John Doe',
        createdAt: '2023-01-01T10:00:00.000Z'
      },
      {
        id: '2',
        content: 'Excellent teamwork!',
        targetType: 'team' as const,
        targetId: '1',
        targetName: 'Dev Team',
        createdAt: '2023-01-02T10:00:00.000Z'
      }
    ]

    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    mockUseLocalStorageFeedback.mockReturnValue([existingFeedback, mockSetFeedback])

    render(<GiveFeedback />)

    expect(screen.getByText('Feedback History (2)')).toBeInTheDocument()
    expect(screen.getByText('Great work!')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('PERSON')).toBeInTheDocument()
    expect(screen.getByText('Excellent teamwork!')).toBeInTheDocument()
    expect(screen.getByText('Dev Team')).toBeInTheDocument()
    expect(screen.getByText('TEAM')).toBeInTheDocument()
  })

  it('should display feedback in chronological order (newest first)', () => {
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    const existingFeedback = [
      {
        id: '1',
        content: 'Older feedback',
        targetType: 'person' as const,
        targetId: '1',
        targetName: 'John Doe',
        createdAt: '2023-01-01T10:00:00.000Z'
      },
      {
        id: '2',
        content: 'Newer feedback',
        targetType: 'person' as const,
        targetId: '1',
        targetName: 'John Doe',
        createdAt: '2023-01-02T10:00:00.000Z'
      }
    ]

    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    mockUseLocalStorageFeedback.mockReturnValue([existingFeedback, mockSetFeedback])

    const { container } = render(<GiveFeedback />)

    const feedbackCards = container.querySelectorAll('.card')
    expect(feedbackCards[0]).toHaveTextContent('Newer feedback')
    expect(feedbackCards[1]).toHaveTextContent('Older feedback')
  })

  it('should reset target selection when changing feedback type', async () => {
    const user = userEvent.setup()
    const people = [{ id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic.jpg' }]
    const teams = [{ id: '1', name: 'Dev Team', logo: 'logo.jpg', members: [] }]

    mockUseLocalStoragePeople.mockReturnValue([people, vi.fn()])
    mockUseLocalStorageTeams.mockReturnValue([teams, vi.fn()])

    render(<GiveFeedback />)

    const typeSelect = screen.getByLabelText(/feedback type/i)
    const personSelect = screen.getByLabelText(/select person/i)

    await user.selectOptions(personSelect, '1')
    expect(personSelect).toHaveValue('1')

    await user.selectOptions(typeSelect, 'team')

    await user.selectOptions(typeSelect, 'person')

    const newPersonSelect = screen.getByLabelText(/select person/i)
    expect(newPersonSelect).toHaveValue('')
  })
})
