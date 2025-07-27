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
	
	api := r.Group("/api/v1")
	persons := api.Group("/persons")
	{
		persons.POST("", CreatePerson)
		persons.GET("", GetPersons)
		persons.GET("/:id", GetPerson)
		persons.PUT("/:id", UpdatePerson)
		persons.DELETE("/:id", DeletePerson)
	}
	
	api.POST("/assign", AssignToTeam)

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

func TestCreatePerson(t *testing.T) {
	router := setupTestRouter()

	t.Run("should create person successfully", func(t *testing.T) {
		reqBody := models.CreatePersonRequest{
			Name:    "John Doe",
			Email:   "john@example.com",
			Picture: "https://example.com/john.jpg",
		}

		w := makeRequest(t, router, "POST", "/api/v1/persons", reqBody)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response models.Person
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "John Doe", response.Name)
		assert.Equal(t, "john@example.com", response.Email)
		assert.Equal(t, "https://example.com/john.jpg", response.Picture)
		assert.NotZero(t, response.ID)
	})

	t.Run("should return error for missing name", func(t *testing.T) {
		reqBody := models.CreatePersonRequest{
			Email: "test@example.com",
		}

		w := makeRequest(t, router, "POST", "/api/v1/persons", reqBody)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Name")
	})

	t.Run("should return error for missing email", func(t *testing.T) {
		reqBody := models.CreatePersonRequest{
			Name: "Test User",
		}

		w := makeRequest(t, router, "POST", "/api/v1/persons", reqBody)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Email")
	})

	t.Run("should return error for invalid email format", func(t *testing.T) {
		reqBody := models.CreatePersonRequest{
			Name:  "Test User",
			Email: "invalid-email",
		}

		w := makeRequest(t, router, "POST", "/api/v1/persons", reqBody)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("should create person without picture", func(t *testing.T) {
		reqBody := models.CreatePersonRequest{
			Name:  "Jane Doe",
			Email: "jane@example.com",
		}

		w := makeRequest(t, router, "POST", "/api/v1/persons", reqBody)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response models.Person
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Jane Doe", response.Name)
		assert.Equal(t, "jane@example.com", response.Email)
		assert.Empty(t, response.Picture)
	})
}

func TestGetPersons(t *testing.T) {
	router := setupTestRouter()

	t.Run("should return empty list when no persons", func(t *testing.T) {
		w := makeRequest(t, router, "GET", "/api/v1/persons", nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Person
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})

	t.Run("should return list of persons", func(t *testing.T) {
		person1 := createTestPerson(t, "John Doe", "john@example.com", "pic1.jpg")
		person2 := createTestPerson(t, "Jane Smith", "jane@example.com", "pic2.jpg")

		w := makeRequest(t, router, "GET", "/api/v1/persons", nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Person
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)
		
		names := []string{response[0].Name, response[1].Name}
		assert.Contains(t, names, person1.Name)
		assert.Contains(t, names, person2.Name)
	})

	t.Run("should include team information", func(t *testing.T) {
		team := createTestTeam(t, "Dev Team", "logo.jpg")
		person := createTestPerson(t, "Team Member", "member@example.com", "pic.jpg")
		
		database.GetDB().Model(&person).Update("team_id", team.ID)

		w := makeRequest(t, router, "GET", "/api/v1/persons", nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Person
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		found := false
		for _, p := range response {
			if p.Name == "Team Member" {
				found = true
				assert.NotNil(t, p.Team)
				assert.Equal(t, "Dev Team", p.Team.Name)
				break
			}
		}
		assert.True(t, found)
	})
}

func TestGetPerson(t *testing.T) {
	router := setupTestRouter()

	t.Run("should return person by ID", func(t *testing.T) {
		person := createTestPerson(t, "John Doe", "john@example.com", "pic.jpg")

		w := makeRequest(t, router, "GET", fmt.Sprintf("/api/v1/persons/%d", person.ID), nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response models.Person
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, person.Name, response.Name)
		assert.Equal(t, person.Email, response.Email)
	})

	t.Run("should return error for invalid ID", func(t *testing.T) {
		w := makeRequest(t, router, "GET", "/api/v1/persons/invalid", nil)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Invalid person ID")
	})

	t.Run("should return error for non-existent person", func(t *testing.T) {
		w := makeRequest(t, router, "GET", "/api/v1/persons/999", nil)

		assert.Equal(t, http.StatusNotFound, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Person not found")
	})
}

func TestUpdatePerson(t *testing.T) {
	router := setupTestRouter()

	t.Run("should update person successfully", func(t *testing.T) {
		person := createTestPerson(t, "John Doe", "john@example.com", "pic.jpg")

		reqBody := models.CreatePersonRequest{
			Name:    "John Updated",
			Email:   "john.updated@example.com",
			Picture: "new-pic.jpg",
		}

		w := makeRequest(t, router, "PUT", fmt.Sprintf("/api/v1/persons/%d", person.ID), reqBody)

		assert.Equal(t, http.StatusOK, w.Code)

		var response models.Person
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "John Updated", response.Name)
		assert.Equal(t, "john.updated@example.com", response.Email)
		assert.Equal(t, "new-pic.jpg", response.Picture)
	})

	t.Run("should return error for invalid ID", func(t *testing.T) {
		reqBody := models.CreatePersonRequest{
			Name:  "Test",
			Email: "test@example.com",
		}

		w := makeRequest(t, router, "PUT", "/api/v1/persons/invalid", reqBody)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("should return error for non-existent person", func(t *testing.T) {
		reqBody := models.CreatePersonRequest{
			Name:  "Test",
			Email: "test@example.com",
		}

		w := makeRequest(t, router, "PUT", "/api/v1/persons/999", reqBody)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}

func TestDeletePerson(t *testing.T) {
	router := setupTestRouter()

	t.Run("should delete person successfully", func(t *testing.T) {
		person := createTestPerson(t, "John Doe", "john@example.com", "pic.jpg")

		w := makeRequest(t, router, "DELETE", fmt.Sprintf("/api/v1/persons/%d", person.ID), nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["message"], "deleted successfully")
	})

	t.Run("should return error for invalid ID", func(t *testing.T) {
		w := makeRequest(t, router, "DELETE", "/api/v1/persons/invalid", nil)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestAssignToTeam(t *testing.T) {
	router := setupTestRouter()

	t.Run("should assign person to team successfully", func(t *testing.T) {
		person := createTestPerson(t, "John Doe", "john@example.com", "pic.jpg")
		team := createTestTeam(t, "Dev Team", "logo.jpg")

		reqBody := models.AssignToTeamRequest{
			PersonID: person.ID,
			TeamID:   team.ID,
		}

		w := makeRequest(t, router, "POST", "/api/v1/assign", reqBody)

		assert.Equal(t, http.StatusOK, w.Code)

		var response models.Person
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, team.ID, *response.TeamID)
		assert.NotNil(t, response.Team)
		assert.Equal(t, "Dev Team", response.Team.Name)
	})

	t.Run("should return error for non-existent person", func(t *testing.T) {
		team := createTestTeam(t, "Dev Team", "logo.jpg")

		reqBody := models.AssignToTeamRequest{
			PersonID: 999,
			TeamID:   team.ID,
		}

		w := makeRequest(t, router, "POST", "/api/v1/assign", reqBody)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("should return error for non-existent team", func(t *testing.T) {
		person := createTestPerson(t, "John Doe", "john@example.com", "pic.jpg")

		reqBody := models.AssignToTeamRequest{
			PersonID: person.ID,
			TeamID:   999,
		}

		w := makeRequest(t, router, "POST", "/api/v1/assign", reqBody)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}
