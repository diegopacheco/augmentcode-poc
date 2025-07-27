import '@testing-library/jest-dom'

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})
