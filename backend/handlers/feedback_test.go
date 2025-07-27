package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"coaching-backend/database"
	"coaching-backend/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupFeedbackTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database")
	}

	err = db.AutoMigrate(&models.Person{}, &models.Team{}, &models.Feedback{})
	if err != nil {
		panic("Failed to migrate test database")
	}
	
	database.DB = db

	r := gin.New()
	
	api := r.Group("/api/v1")
	feedbacks := api.Group("/feedbacks")
	{
		feedbacks.POST("", CreateFeedback)
		feedbacks.GET("", GetFeedbacks)
		feedbacks.GET("/:id", GetFeedback)
		feedbacks.GET("/by-target", GetFeedbacksByTarget)
		feedbacks.DELETE("/:id", DeleteFeedback)
	}

	return r
}

func TestCreateFeedback(t *testing.T) {
	router := setupFeedbackTestRouter()

	t.Run("should create person feedback successfully", func(t *testing.T) {
		person := createFeedbackTestPerson(t, "John Doe", "john@example.com", "pic.jpg")

		reqBody := models.CreateFeedbackRequest{
			Content:    "Great work on the project!",
			TargetType: "person",
			TargetID:   person.ID,
		}

		w := makeFeedbackRequest(t, router, "POST", "/api/v1/feedbacks", reqBody)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response models.Feedback
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Great work on the project!", response.Content)
		assert.Equal(t, "person", response.TargetType)
		assert.Equal(t, person.ID, response.TargetID)
		assert.Equal(t, "John Doe", response.TargetName)
		assert.NotZero(t, response.ID)
	})

	t.Run("should create team feedback successfully", func(t *testing.T) {
		team := createFeedbackTestTeam(t, "Dev Team", "logo.png")

		reqBody := models.CreateFeedbackRequest{
			Content:    "Excellent teamwork this sprint!",
			TargetType: "team",
			TargetID:   team.ID,
		}

		w := makeFeedbackRequest(t, router, "POST", "/api/v1/feedbacks", reqBody)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response models.Feedback
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Excellent teamwork this sprint!", response.Content)
		assert.Equal(t, "team", response.TargetType)
		assert.Equal(t, team.ID, response.TargetID)
		assert.Equal(t, "Dev Team", response.TargetName)
	})

	t.Run("should return error for missing content", func(t *testing.T) {
		person := createFeedbackTestPerson(t, "John Doe", "john@example.com", "pic.jpg")

		reqBody := models.CreateFeedbackRequest{
			TargetType: "person",
			TargetID:   person.ID,
		}

		w := makeFeedbackRequest(t, router, "POST", "/api/v1/feedbacks", reqBody)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Content")
	})

	t.Run("should return error for invalid target type", func(t *testing.T) {
		reqBody := models.CreateFeedbackRequest{
			Content:    "Test feedback",
			TargetType: "invalid",
			TargetID:   1,
		}

		w := makeFeedbackRequest(t, router, "POST", "/api/v1/feedbacks", reqBody)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("should return error for non-existent person", func(t *testing.T) {
		reqBody := models.CreateFeedbackRequest{
			Content:    "Test feedback",
			TargetType: "person",
			TargetID:   999,
		}

		w := makeFeedbackRequest(t, router, "POST", "/api/v1/feedbacks", reqBody)

		assert.Equal(t, http.StatusNotFound, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Person not found")
	})

	t.Run("should return error for non-existent team", func(t *testing.T) {
		reqBody := models.CreateFeedbackRequest{
			Content:    "Test feedback",
			TargetType: "team",
			TargetID:   999,
		}

		w := makeFeedbackRequest(t, router, "POST", "/api/v1/feedbacks", reqBody)

		assert.Equal(t, http.StatusNotFound, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Team not found")
	})
}

func TestGetFeedbacks(t *testing.T) {
	router := setupFeedbackTestRouter()

	t.Run("should return empty list when no feedbacks", func(t *testing.T) {
		w := makeFeedbackRequest(t, router, "GET", "/api/v1/feedbacks", nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Feedback
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})

	t.Run("should return list of feedbacks", func(t *testing.T) {
		person := createFeedbackTestPerson(t, "John Doe", "john@example.com", "pic.jpg")
		team := createFeedbackTestTeam(t, "Dev Team", "logo.png")

		createFeedbackTestFeedback(t, "Great work!", "person", person.ID, "John Doe")
		createFeedbackTestFeedback(t, "Excellent team!", "team", team.ID, "Dev Team")

		w := makeFeedbackRequest(t, router, "GET", "/api/v1/feedbacks", nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Feedback
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)

		contents := []string{response[0].Content, response[1].Content}
		assert.Contains(t, contents, "Great work!")
		assert.Contains(t, contents, "Excellent team!")
	})

	t.Run("should return feedbacks in descending order by created_at", func(t *testing.T) {
		person := createFeedbackTestPerson(t, "John Doe", "john@example.com", "pic.jpg")

		createFeedbackTestFeedback(t, "First feedback", "person", person.ID, "John Doe")
		createFeedbackTestFeedback(t, "Second feedback", "person", person.ID, "John Doe")

		w := makeFeedbackRequest(t, router, "GET", "/api/v1/feedbacks", nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Feedback
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)

		assert.True(t, response[0].CreatedAt.After(response[1].CreatedAt) || response[0].CreatedAt.Equal(response[1].CreatedAt))
	})
}

func TestGetFeedback(t *testing.T) {
	router := setupFeedbackTestRouter()

	t.Run("should return feedback by ID", func(t *testing.T) {
		person := createFeedbackTestPerson(t, "John Doe", "john@example.com", "pic.jpg")
		feedback := createFeedbackTestFeedback(t, "Test feedback", "person", person.ID, "John Doe")

		w := makeFeedbackRequest(t, router, "GET", fmt.Sprintf("/api/v1/feedbacks/%d", feedback.ID), nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response models.Feedback
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, feedback.Content, response.Content)
		assert.Equal(t, feedback.TargetType, response.TargetType)
	})

	t.Run("should return error for invalid ID", func(t *testing.T) {
		w := makeFeedbackRequest(t, router, "GET", "/api/v1/feedbacks/invalid", nil)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Invalid feedback ID")
	})

	t.Run("should return error for non-existent feedback", func(t *testing.T) {
		w := makeFeedbackRequest(t, router, "GET", "/api/v1/feedbacks/999", nil)

		assert.Equal(t, http.StatusNotFound, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Feedback not found")
	})
}

func TestGetFeedbacksByTarget(t *testing.T) {
	router := setupFeedbackTestRouter()

	t.Run("should return feedbacks for specific person", func(t *testing.T) {
		person1 := createFeedbackTestPerson(t, "John Doe", "john@example.com", "pic1.jpg")
		person2 := createFeedbackTestPerson(t, "Jane Smith", "jane@example.com", "pic2.jpg")

		feedback1 := createFeedbackTestFeedback(t, "Feedback for John", "person", person1.ID, "John Doe")
		createFeedbackTestFeedback(t, "Feedback for Jane", "person", person2.ID, "Jane Smith")

		url := fmt.Sprintf("/api/v1/feedbacks/by-target?target_type=person&target_id=%d", person1.ID)
		w := makeFeedbackRequest(t, router, "GET", url, nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Feedback
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 1)
		assert.Equal(t, feedback1.Content, response[0].Content)
	})

	t.Run("should return feedbacks for specific team", func(t *testing.T) {
		team1 := createFeedbackTestTeam(t, "Dev Team", "logo1.png")
		team2 := createFeedbackTestTeam(t, "Design Team", "logo2.png")

		feedback1 := createFeedbackTestFeedback(t, "Feedback for Dev Team", "team", team1.ID, "Dev Team")
		createFeedbackTestFeedback(t, "Feedback for Design Team", "team", team2.ID, "Design Team")

		url := fmt.Sprintf("/api/v1/feedbacks/by-target?target_type=team&target_id=%d", team1.ID)
		w := makeFeedbackRequest(t, router, "GET", url, nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Feedback
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 1)
		assert.Equal(t, feedback1.Content, response[0].Content)
	})

	t.Run("should return error for missing target_type", func(t *testing.T) {
		w := makeFeedbackRequest(t, router, "GET", "/api/v1/feedbacks/by-target?target_id=1", nil)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "target_type and target_id are required")
	})

	t.Run("should return error for missing target_id", func(t *testing.T) {
		w := makeFeedbackRequest(t, router, "GET", "/api/v1/feedbacks/by-target?target_type=person", nil)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "target_type and target_id are required")
	})

	t.Run("should return error for invalid target_id", func(t *testing.T) {
		w := makeFeedbackRequest(t, router, "GET", "/api/v1/feedbacks/by-target?target_type=person&target_id=invalid", nil)

		assert.Equal(t, http.StatusBadRequest, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Invalid target_id")
	})
}

func TestDeleteFeedback(t *testing.T) {
	router := setupFeedbackTestRouter()

	t.Run("should delete feedback successfully", func(t *testing.T) {
		person := createFeedbackTestPerson(t, "John Doe", "john@example.com", "pic.jpg")
		feedback := createFeedbackTestFeedback(t, "Feedback to delete", "person", person.ID, "John Doe")

		w := makeFeedbackRequest(t, router, "DELETE", fmt.Sprintf("/api/v1/feedbacks/%d", feedback.ID), nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["message"], "deleted successfully")
	})

	t.Run("should return error for invalid ID", func(t *testing.T) {
		w := makeFeedbackRequest(t, router, "DELETE", "/api/v1/feedbacks/invalid", nil)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func createFeedbackTestPerson(t *testing.T, name, email, picture string) models.Person {
	person := models.Person{
		Name:    name,
		Email:   email,
		Picture: picture,
	}

	err := database.GetDB().Create(&person).Error
	assert.NoError(t, err)

	return person
}

func createFeedbackTestTeam(t *testing.T, name, logo string) models.Team {
	team := models.Team{
		Name: name,
		Logo: logo,
	}

	err := database.GetDB().Create(&team).Error
	assert.NoError(t, err)

	return team
}

func createFeedbackTestFeedback(t *testing.T, content, targetType string, targetID uint, targetName string) models.Feedback {
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

func makeFeedbackRequest(t *testing.T, router *gin.Engine, method, url string, body interface{}) *httptest.ResponseRecorder {
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
