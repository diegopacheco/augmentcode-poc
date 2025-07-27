import { render, screen } from '../../test-utils'
import { Layout } from '../Layout'

vi.mock('../Navigation', () => ({
  Navigation: () => <nav data-testid="navigation">Navigation Component</nav>
}))

describe('Layout', () => {
  it('should render navigation component', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should have proper structure', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    const container = screen.getByText('Test Content').closest('.container')
    expect(container).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <Layout>
        <div>First Child</div>
        <div>Second Child</div>
      </Layout>
    )
    
    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
  })

  it('should render with navigation above content', () => {
    const { container } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    const navigation = screen.getByTestId('navigation')
    const content = screen.getByText('Test Content')
    
    expect(navigation.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })
})
