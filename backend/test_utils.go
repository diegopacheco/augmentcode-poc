package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"coaching-backend/database"
	"coaching-backend/handlers"
	"coaching-backend/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database")
	}

	err = db.AutoMigrate(&models.Person{}, &models.Team{}, &models.Feedback{})
	if err != nil {
		panic("Failed to migrate test database")
	}

	return db
}

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)

	testDB := setupTestDB()
	database.DB = testDB

	r := gin.New()

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	api := r.Group("/api/v1")
	{
		persons := api.Group("/persons")
		{
			persons.POST("", handlers.CreatePerson)
			persons.GET("", handlers.GetPersons)
			persons.GET("/:id", handlers.GetPerson)
			persons.PUT("/:id", handlers.UpdatePerson)
			persons.DELETE("/:id", handlers.DeletePerson)
		}

		teams := api.Group("/teams")
		{
			teams.POST("", handlers.CreateTeam)
			teams.GET("", handlers.GetTeams)
			teams.GET("/:id", handlers.GetTeam)
			teams.PUT("/:id", handlers.UpdateTeam)
			teams.DELETE("/:id", handlers.DeleteTeam)
		}

		feedbacks := api.Group("/feedbacks")
		{
			feedbacks.POST("", handlers.CreateFeedback)
			feedbacks.GET("", handlers.GetFeedbacks)
			feedbacks.GET("/:id", handlers.GetFeedback)
			feedbacks.GET("/by-target", handlers.GetFeedbacksByTarget)
			feedbacks.DELETE("/:id", handlers.DeleteFeedback)
		}

		api.POST("/assign", handlers.AssignToTeam)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return r
}

func createTestPerson(t *testing.T, name, email, picture string) models.Person {
	person := models.Person{
		Name:    name,
		Email:   email,
		Picture: picture,
	}
	
	err := database.GetDB().Create(&person).Error
	assert.NoError(t, err)
	
	return person
}

func createTestTeam(t *testing.T, name, logo string) models.Team {
	team := models.Team{
		Name: name,
		Logo: logo,
	}
	
	err := database.GetDB().Create(&team).Error
	assert.NoError(t, err)
	
	return team
}

func createTestFeedback(t *testing.T, content, targetType string, targetID uint, targetName string) models.Feedback {
	feedback := models.Feedback{
		Content:    content,
		TargetType: targetType,
		TargetID:   targetID,
		TargetName: targetName,
	}
	
	err := database.GetDB().Create(&feedback).Error
	assert.NoError(t, err)
	
	return feedback
}

func makeRequest(t *testing.T, router *gin.Engine, method, url string, body interface{}) *httptest.ResponseRecorder {
	var reqBody *bytes.Buffer
	
	if body != nil {
		jsonBody, err := json.Marshal(body)
		assert.NoError(t, err)
		reqBody = bytes.NewBuffer(jsonBody)
	} else {
		reqBody = bytes.NewBuffer([]byte{})
	}
	
	req, err := http.NewRequest(method, url, reqBody)
	assert.NoError(t, err)
	
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	return w
}

func cleanupTestDB() {
	if database.DB != nil {
		database.DB.Exec("DELETE FROM feedbacks")
		database.DB.Exec("DELETE FROM people")
		database.DB.Exec("DELETE FROM teams")
	}
}

func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	
	code := m.Run()
	
	cleanupTestDB()
	
	os.Exit(code)
}
