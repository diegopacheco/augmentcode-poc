package models

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database")
	}

	err = db.AutoMigrate(&Person{}, &Team{}, &Feedback{})
	if err != nil {
		panic("Failed to migrate test database")
	}

	return db
}

func TestPersonModel(t *testing.T) {
	db := setupTestDB()

	t.Run("should create person successfully", func(t *testing.T) {
		person := Person{
			Name:    "John Doe",
			Email:   "john@example.com",
			Picture: "https://example.com/john.jpg",
		}

		err := db.Create(&person).Error
		assert.NoError(t, err)
		assert.NotZero(t, person.ID)
		assert.NotZero(t, person.CreatedAt)
		assert.NotZero(t, person.UpdatedAt)
	})

	t.Run("should enforce unique email constraint", func(t *testing.T) {
		person1 := Person{
			Name:  "John Doe",
			Email: "unique@example.com",
		}
		err := db.Create(&person1).Error
		assert.NoError(t, err)

		person2 := Person{
			Name:  "Jane Doe",
			Email: "unique@example.com",
		}
		err = db.Create(&person2).Error
		assert.Error(t, err)
	})

	t.Run("should allow empty name in SQLite", func(t *testing.T) {
		person := Person{
			Email: "test@example.com",
		}
		err := db.Create(&person).Error
		assert.NoError(t, err)
		assert.Empty(t, person.Name)
	})

	t.Run("should allow empty email in SQLite", func(t *testing.T) {
		person := Person{
			Name: "Test User",
		}
		err := db.Create(&person).Error
		assert.NoError(t, err)
		assert.Empty(t, person.Email)
	})

	t.Run("should allow optional picture field", func(t *testing.T) {
		person := Person{
			Name:  "Test User",
			Email: "test2@example.com",
		}
		err := db.Create(&person).Error
		assert.NoError(t, err)
		assert.Empty(t, person.Picture)
	})

	t.Run("should allow optional team assignment", func(t *testing.T) {
		team := Team{
			Name: "Test Team",
			Logo: "logo.png",
		}
		err := db.Create(&team).Error
		assert.NoError(t, err)

		person := Person{
			Name:   "Team Member",
			Email:  "member@example.com",
			TeamID: &team.ID,
		}
		err = db.Create(&person).Error
		assert.NoError(t, err)
		assert.Equal(t, team.ID, *person.TeamID)
	})
}

func TestTeamModel(t *testing.T) {
	db := setupTestDB()

	t.Run("should create team successfully", func(t *testing.T) {
		team := Team{
			Name: "Development Team",
			Logo: "https://example.com/logo.png",
		}

		err := db.Create(&team).Error
		assert.NoError(t, err)
		assert.NotZero(t, team.ID)
		assert.NotZero(t, team.CreatedAt)
		assert.NotZero(t, team.UpdatedAt)
	})

	t.Run("should allow empty name in SQLite", func(t *testing.T) {
		team := Team{
			Logo: "logo.png",
		}
		err := db.Create(&team).Error
		assert.NoError(t, err)
		assert.Empty(t, team.Name)
	})

	t.Run("should allow optional logo field", func(t *testing.T) {
		team := Team{
			Name: "Simple Team",
		}
		err := db.Create(&team).Error
		assert.NoError(t, err)
		assert.Empty(t, team.Logo)
	})

	t.Run("should load team members", func(t *testing.T) {
		team := Team{
			Name: "Test Team",
		}
		err := db.Create(&team).Error
		assert.NoError(t, err)

		person := Person{
			Name:   "Team Member",
			Email:  "member@example.com",
			TeamID: &team.ID,
		}
		err = db.Create(&person).Error
		assert.NoError(t, err)

		var loadedTeam Team
		err = db.Preload("Members").First(&loadedTeam, team.ID).Error
		assert.NoError(t, err)
		assert.Len(t, loadedTeam.Members, 1)
		assert.Equal(t, person.Name, loadedTeam.Members[0].Name)
	})
}

func TestFeedbackModel(t *testing.T) {
	db := setupTestDB()

	t.Run("should create feedback successfully", func(t *testing.T) {
		feedback := Feedback{
			Content:    "Great work!",
			TargetType: "person",
			TargetID:   1,
			TargetName: "John Doe",
		}

		err := db.Create(&feedback).Error
		assert.NoError(t, err)
		assert.NotZero(t, feedback.ID)
		assert.NotZero(t, feedback.CreatedAt)
		assert.NotZero(t, feedback.UpdatedAt)
	})

	t.Run("should allow empty content in SQLite", func(t *testing.T) {
		feedback := Feedback{
			TargetType: "person",
			TargetID:   1,
			TargetName: "John Doe",
		}
		err := db.Create(&feedback).Error
		assert.NoError(t, err)
		assert.Empty(t, feedback.Content)
	})

	t.Run("should allow empty target_type in SQLite", func(t *testing.T) {
		feedback := Feedback{
			Content:    "Great work!",
			TargetID:   1,
			TargetName: "John Doe",
		}
		err := db.Create(&feedback).Error
		assert.NoError(t, err)
		assert.Empty(t, feedback.TargetType)
	})

	t.Run("should allow zero target_id in SQLite", func(t *testing.T) {
		feedback := Feedback{
			Content:    "Great work!",
			TargetType: "person",
			TargetName: "John Doe",
		}
		err := db.Create(&feedback).Error
		assert.NoError(t, err)
		assert.Zero(t, feedback.TargetID)
	})

	t.Run("should allow empty target_name in SQLite", func(t *testing.T) {
		feedback := Feedback{
			Content:    "Great work!",
			TargetType: "person",
			TargetID:   1,
		}
		err := db.Create(&feedback).Error
		assert.NoError(t, err)
		assert.Empty(t, feedback.TargetName)
	})

	t.Run("should store timestamps correctly", func(t *testing.T) {
		before := time.Now()
		
		feedback := Feedback{
			Content:    "Test feedback",
			TargetType: "team",
			TargetID:   1,
			TargetName: "Test Team",
		}
		
		err := db.Create(&feedback).Error
		assert.NoError(t, err)
		
		after := time.Now()
		
		assert.True(t, feedback.CreatedAt.After(before) || feedback.CreatedAt.Equal(before))
		assert.True(t, feedback.CreatedAt.Before(after) || feedback.CreatedAt.Equal(after))
		assert.True(t, feedback.UpdatedAt.After(before) || feedback.UpdatedAt.Equal(before))
		assert.True(t, feedback.UpdatedAt.Before(after) || feedback.UpdatedAt.Equal(after))
	})
}
