# Coaching Backend API

A REST API backend for the coaching application built with Go, Gin, and MySQL.

## Features

- RESTful API endpoints for persons, teams, and feedback
- MySQL database with GORM ORM
- CORS support for frontend integration
- Clean architecture with separated concerns

## API Endpoints

### Persons
- `POST /api/v1/persons` - Create a new person
- `GET /api/v1/persons` - Get all persons
- `GET /api/v1/persons/:id` - Get person by ID
- `PUT /api/v1/persons/:id` - Update person
- `DELETE /api/v1/persons/:id` - Delete person

### Teams
- `POST /api/v1/teams` - Create a new team
- `GET /api/v1/teams` - Get all teams
- `GET /api/v1/teams/:id` - Get team by ID
- `PUT /api/v1/teams/:id` - Update team
- `DELETE /api/v1/teams/:id` - Delete team

### Feedback
- `POST /api/v1/feedbacks` - Create feedback
- `GET /api/v1/feedbacks` - Get all feedbacks
- `GET /api/v1/feedbacks/:id` - Get feedback by ID
- `GET /api/v1/feedbacks/by-target?target_type=person&target_id=1` - Get feedbacks by target
- `DELETE /api/v1/feedbacks/:id` - Delete feedback

### Assignment
- `POST /api/v1/assign` - Assign person to team

## Setup

1. Start MySQL database:
```bash
docker-compose up -d
```

2. Build the application:
```bash
./build.sh
```

3. Run the application:
```bash
./run.sh
```

## Environment Variables

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 3306)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password (default: password)
- `DB_NAME` - Database name (default: coaching_db)
- `PORT` - Server port (default: 8080)
