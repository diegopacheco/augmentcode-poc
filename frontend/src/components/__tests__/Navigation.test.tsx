import { render, screen } from '../../test-utils'
import { Navigation } from '../Navigation'

const mockUseLocation = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  }
})

describe('Navigation', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({ pathname: '/add-member' })
  })

  it('should render all navigation links', () => {
    render(<Navigation />)
    
    expect(screen.getByText('Add Team Member')).toBeInTheDocument()
    expect(screen.getByText('Create Team')).toBeInTheDocument()
    expect(screen.getByText('Assign to Team')).toBeInTheDocument()
    expect(screen.getByText('Give Feedback')).toBeInTheDocument()
  })

  it('should have correct href attributes', () => {
    render(<Navigation />)
    
    expect(screen.getByText('Add Team Member').closest('a')).toHaveAttribute('href', '/add-member')
    expect(screen.getByText('Create Team').closest('a')).toHaveAttribute('href', '/create-team')
    expect(screen.getByText('Assign to Team').closest('a')).toHaveAttribute('href', '/assign-team')
    expect(screen.getByText('Give Feedback').closest('a')).toHaveAttribute('href', '/give-feedback')
  })

  it('should highlight active link', () => {
    mockUseLocation.mockReturnValue({ pathname: '/add-member' })
    render(<Navigation />)
    
    const activeLink = screen.getByText('Add Team Member')
    expect(activeLink).toHaveClass('active')
  })

  it('should highlight different active link', () => {
    mockUseLocation.mockReturnValue({ pathname: '/create-team' })
    render(<Navigation />)
    
    const activeLink = screen.getByText('Create Team')
    expect(activeLink).toHaveClass('active')
    
    const inactiveLink = screen.getByText('Add Team Member')
    expect(inactiveLink).not.toHaveClass('active')
  })

  it('should not highlight any link when on unknown route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/unknown' })
    render(<Navigation />)
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).not.toHaveClass('active')
    })
  })

  it('should render navigation with proper structure', () => {
    render(<Navigation />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveClass('nav')
    
    const container = nav.querySelector('.container')
    expect(container).toBeInTheDocument()
    
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(4)
  })
})
