package database

import (
	"testing"

	"coaching-backend/models"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestConnect(t *testing.T) {
	t.Run("should connect to database successfully", func(t *testing.T) {
		originalDB := DB
		defer func() { DB = originalDB }()

		testDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
		assert.NoError(t, err)

		DB = testDB

		err = DB.AutoMigrate(&models.Person{}, &models.Team{}, &models.Feedback{})
		assert.NoError(t, err)

		assert.NotNil(t, DB)
	})

	t.Run("should migrate all models", func(t *testing.T) {
		testDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
		assert.NoError(t, err)

		err = testDB.AutoMigrate(&models.Person{}, &models.Team{}, &models.Feedback{})
		assert.NoError(t, err)

		assert.True(t, testDB.Migrator().HasTable(&models.Person{}))
		assert.True(t, testDB.Migrator().HasTable(&models.Team{}))
		assert.True(t, testDB.Migrator().HasTable(&models.Feedback{}))
	})

	t.Run("should create tables with correct columns", func(t *testing.T) {
		testDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
		assert.NoError(t, err)

		err = testDB.AutoMigrate(&models.Person{}, &models.Team{}, &models.Feedback{})
		assert.NoError(t, err)

		assert.True(t, testDB.Migrator().HasColumn(&models.Person{}, "name"))
		assert.True(t, testDB.Migrator().HasColumn(&models.Person{}, "email"))
		assert.True(t, testDB.Migrator().HasColumn(&models.Person{}, "picture"))
		assert.True(t, testDB.Migrator().HasColumn(&models.Person{}, "team_id"))

		assert.True(t, testDB.Migrator().HasColumn(&models.Team{}, "name"))
		assert.True(t, testDB.Migrator().HasColumn(&models.Team{}, "logo"))

		assert.True(t, testDB.Migrator().HasColumn(&models.Feedback{}, "content"))
		assert.True(t, testDB.Migrator().HasColumn(&models.Feedback{}, "target_type"))
		assert.True(t, testDB.Migrator().HasColumn(&models.Feedback{}, "target_id"))
		assert.True(t, testDB.Migrator().HasColumn(&models.Feedback{}, "target_name"))
	})
}

func TestGetDB(t *testing.T) {
	t.Run("should return database instance", func(t *testing.T) {
		testDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
		assert.NoError(t, err)

		originalDB := DB
		defer func() { DB = originalDB }()

		DB = testDB

		result := GetDB()
		assert.NotNil(t, result)
		assert.Equal(t, testDB, result)
	})

	t.Run("should return nil when no database connected", func(t *testing.T) {
		originalDB := DB
		defer func() { DB = originalDB }()

		DB = nil

		result := GetDB()
		assert.Nil(t, result)
	})
}

func TestDatabaseOperations(t *testing.T) {
	testDB, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	assert.NoError(t, err)

	err = testDB.AutoMigrate(&models.Person{}, &models.Team{}, &models.Feedback{})
	assert.NoError(t, err)

	originalDB := DB
	defer func() { DB = originalDB }()
	DB = testDB

	t.Run("should perform CRUD operations on Person", func(t *testing.T) {
		person := models.Person{
			Name:    "Test User",
			Email:   "test@example.com",
			Picture: "pic.jpg",
		}

		err := DB.Create(&person).Error
		assert.NoError(t, err)
		assert.NotZero(t, person.ID)

		var foundPerson models.Person
		err = DB.First(&foundPerson, person.ID).Error
		assert.NoError(t, err)
		assert.Equal(t, person.Name, foundPerson.Name)

		foundPerson.Name = "Updated User"
		err = DB.Save(&foundPerson).Error
		assert.NoError(t, err)

		err = DB.Delete(&foundPerson).Error
		assert.NoError(t, err)
	})

	t.Run("should perform CRUD operations on Team", func(t *testing.T) {
		team := models.Team{
			Name: "Test Team",
			Logo: "logo.png",
		}

		err := DB.Create(&team).Error
		assert.NoError(t, err)
		assert.NotZero(t, team.ID)

		var foundTeam models.Team
		err = DB.First(&foundTeam, team.ID).Error
		assert.NoError(t, err)
		assert.Equal(t, team.Name, foundTeam.Name)

		foundTeam.Name = "Updated Team"
		err = DB.Save(&foundTeam).Error
		assert.NoError(t, err)

		err = DB.Delete(&foundTeam).Error
		assert.NoError(t, err)
	})

	t.Run("should perform CRUD operations on Feedback", func(t *testing.T) {
		feedback := models.Feedback{
			Content:    "Test feedback",
			TargetType: "person",
			TargetID:   1,
			TargetName: "Test User",
		}

		err := DB.Create(&feedback).Error
		assert.NoError(t, err)
		assert.NotZero(t, feedback.ID)

		var foundFeedback models.Feedback
		err = DB.First(&foundFeedback, feedback.ID).Error
		assert.NoError(t, err)
		assert.Equal(t, feedback.Content, foundFeedback.Content)

		err = DB.Delete(&foundFeedback).Error
		assert.NoError(t, err)
	})

	t.Run("should handle foreign key relationships", func(t *testing.T) {
		team := models.Team{
			Name: "Relationship Team",
			Logo: "logo.png",
		}
		err := DB.Create(&team).Error
		assert.NoError(t, err)

		person := models.Person{
			Name:   "Team Member",
			Email:  "member@example.com",
			TeamID: &team.ID,
		}
		err = DB.Create(&person).Error
		assert.NoError(t, err)

		var loadedPerson models.Person
		err = DB.Preload("Team").First(&loadedPerson, person.ID).Error
		assert.NoError(t, err)
		assert.NotNil(t, loadedPerson.Team)
		assert.Equal(t, team.Name, loadedPerson.Team.Name)

		var loadedTeam models.Team
		err = DB.Preload("Members").First(&loadedTeam, team.ID).Error
		assert.NoError(t, err)
		assert.Len(t, loadedTeam.Members, 1)
		assert.Equal(t, person.Name, loadedTeam.Members[0].Name)
	})
}
