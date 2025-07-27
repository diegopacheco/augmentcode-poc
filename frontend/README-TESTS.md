# Frontend Tests

Comprehensive test suite for the coaching application frontend built with React, TypeScript, and Vitest.

## Test Coverage

### Hooks
- **useLocalStorage.test.ts** - Tests for the localStorage custom hook
  - Initial value handling
  - Stored value retrieval
  - Value updates and persistence
  - Function updates
  - Error handling
  - Complex object and array support

### Components
- **Navigation.test.tsx** - Navigation component tests
  - Link rendering and attributes
  - Active link highlighting
  - Route-based navigation
  - Component structure

- **Layout.test.tsx** - Layout component tests
  - Navigation integration
  - Children rendering
  - Component structure

### Pages
- **AddTeamMember.test.tsx** - Add team member page tests
  - Form rendering and validation
  - Input handling and updates
  - Form submission with validation
  - Success/error message handling
  - Team member list display
  - Image error handling

- **CreateTeam.test.tsx** - Create team page tests
  - Form rendering and validation
  - Team creation with/without logo
  - Form clearing after submission
  - Team list display
  - Message timeout handling

- **AssignToTeam.test.tsx** - Assign to team page tests
  - Error states for missing data
  - Form rendering with dropdowns
  - Person and team selection
  - Assignment functionality
  - Team reassignment
  - UI state management

- **GiveFeedback.test.tsx** - Give feedback page tests
  - Form rendering and validation
  - Feedback type switching
  - Target selection (person/team)
  - Feedback submission
  - Feedback history display
  - Form state management

### App
- **App.test.tsx** - Main app component tests
  - Route configuration
  - Component rendering
  - Navigation integration
  - Layout wrapping

## Test Utilities

- **test-utils.tsx** - Custom render function with React Router
- **test-setup.ts** - Global test setup with localStorage mocking

## Running Tests

```bash
# Run all tests
bun run test

# Run tests with UI
bun run test:ui

# Run tests with coverage
bun run test:coverage

# Run specific test file
bun run test src/hooks/__tests__/useLocalStorage.test.ts
```

## Test Features

- **Mocking**: localStorage, React Router, and component dependencies
- **User Interactions**: Form filling, clicking, selecting options
- **Async Testing**: Timeouts, state updates, and user events
- **Error Handling**: Invalid inputs, missing data, and edge cases
- **State Management**: localStorage persistence and component state
- **UI Testing**: Component rendering, styling, and user feedback

## Technologies

- **Vitest** - Fast testing framework
- **React Testing Library** - Component testing utilities
- **jsdom** - DOM environment for testing
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Additional matchers
