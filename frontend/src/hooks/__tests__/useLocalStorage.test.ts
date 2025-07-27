import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(result.current[0]).toBe('initial')
  })

  it('should return stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(result.current[0]).toBe('stored-value')
  })

  it('should update localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(result.current[0]).toBe('new-value')
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'))
  })

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10))
    
    act(() => {
      result.current[1]((prev) => prev + 5)
    })
    
    expect(result.current[0]).toBe(15)
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(15))
  })

  it('should handle JSON parsing errors gracefully', () => {
    localStorage.setItem('test-key', 'invalid-json')
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))
    
    expect(result.current[0]).toBe('fallback')
  })

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage error')
    })
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should work with complex objects', () => {
    const initialData = { name: 'John', age: 30 }
    const { result } = renderHook(() => useLocalStorage('user', initialData))
    
    const newData = { name: 'Jane', age: 25 }
    
    act(() => {
      result.current[1](newData)
    })
    
    expect(result.current[0]).toEqual(newData)
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(newData))
  })

  it('should work with arrays', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('items', []))
    
    act(() => {
      result.current[1](['item1', 'item2'])
    })
    
    expect(result.current[0]).toEqual(['item1', 'item2'])
    expect(localStorage.setItem).toHaveBeenCalledWith('items', JSON.stringify(['item1', 'item2']))
  })
})
