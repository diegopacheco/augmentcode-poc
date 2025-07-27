# Backend Tests

Comprehensive test suite for the Go backend coaching application built with Gin, GORM, and MySQL.

## Test Coverage

### Models (7 tests)
- **models_test.go** - Database model validation tests
  - Person model creation and constraints
  - Team model creation and relationships
  - Feedback model creation and validation
  - Unique email constraint enforcement
  - Optional field handling
  - Foreign key relationships
  - Timestamp management

### Configuration (8 tests)
- **config_test.go** - Configuration management tests
  - Environment variable loading
  - Default value handling
  - Custom configuration values
  - Empty environment variable handling
  - Special character support in values

### Database (6 tests)
- **database_test.go** - Database connection and operations tests
  - Database connection establishment
  - Model migration verification
  - Table and column creation
  - CRUD operations on all models
  - Foreign key relationship handling
  - Database instance management

### Handlers (50+ tests)
- **person_test.go** - Person API endpoint tests
  - Person creation with validation
  - Person retrieval (single and list)
  - Person updates and deletion
  - Team assignment functionality
  - Error handling for invalid data
  - Email format validation

- **team_test.go** - Team API endpoint tests
  - Team creation with validation
  - Team retrieval with member information
  - Team updates and deletion
  - Member relationship loading
  - Error handling for missing data

- **feedback_test.go** - Feedback API endpoint tests
  - Feedback creation for persons and teams
  - Feedback retrieval and filtering
  - Target-specific feedback queries
  - Feedback deletion
  - Validation for required fields
  - Error handling for non-existent targets

### Integration (8 tests)
- **main_test.go** - Application integration tests
  - Health endpoint functionality
  - CORS header configuration
  - API route availability
  - Complete workflow testing
  - Error handling scenarios
  - Malformed request handling

## Test Features

- **In-Memory SQLite** - Fast, isolated test database
- **HTTP Testing** - Complete API endpoint testing
- **Request/Response Validation** - JSON marshaling/unmarshaling
- **Error Scenario Testing** - Invalid inputs and edge cases
- **Database Relationship Testing** - Foreign key constraints
- **CORS Testing** - Cross-origin request handling
- **Integration Testing** - End-to-end workflow validation

## Test Utilities

- **setupTestDB()** - Creates in-memory SQLite database
- **setupTestRouter()** - Configures Gin router with test database
- **makeRequest()** - Helper for HTTP request testing
- **createTestPerson/Team/Feedback()** - Test data creation helpers

## Running Tests

```bash
# Run all tests
go test ./...

# Run tests with verbose output
go test ./... -v

# Run specific package tests
go test ./models -v
go test ./handlers -v
go test ./config -v
go test ./database -v

# Run tests with coverage
go test ./... -cover

# Run specific test
go test ./handlers -run TestCreatePerson -v
```

## Test Database

- Uses SQLite in-memory database for fast, isolated testing
- Automatic migration of all models
- Clean state for each test package
- No external database dependencies

## Technologies

- **testify/assert** - Assertion library for readable tests
- **SQLite** - In-memory database for testing
- **httptest** - HTTP testing utilities
- **Gin Test Mode** - Optimized Gin configuration for testing

## Test Structure

Each test follows the pattern:
1. **Setup** - Create test router and database
2. **Action** - Execute the operation being tested
3. **Assert** - Verify expected outcomes
4. **Cleanup** - Automatic cleanup between tests

## Key Testing Patterns

1. **Isolated Tests** - Each test uses fresh database state
2. **Comprehensive Coverage** - All CRUD operations tested
3. **Error Path Testing** - Invalid inputs and edge cases
4. **Integration Testing** - Complete request/response cycles
5. **Relationship Testing** - Foreign key and association handling
