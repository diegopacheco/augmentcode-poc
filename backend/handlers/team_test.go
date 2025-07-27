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

func setupTeamTestRouter() *gin.Engine {
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
	teams := api.Group("/teams")
	{
		teams.POST("", CreateTeam)
		teams.GET("", GetTeams)
		teams.GET("/:id", GetTeam)
		teams.PUT("/:id", UpdateTeam)
		teams.DELETE("/:id", DeleteTeam)
	}

	return r
}

func TestCreateTeam(t *testing.T) {
	router := setupTeamTestRouter()

	t.Run("should create team successfully", func(t *testing.T) {
		reqBody := models.CreateTeamRequest{
			Name: "Development Team",
			Logo: "https://example.com/logo.png",
		}

		w := makeTeamRequest(t, router, "POST", "/api/v1/teams", reqBody)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response models.Team
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Development Team", response.Name)
		assert.Equal(t, "https://example.com/logo.png", response.Logo)
		assert.NotZero(t, response.ID)
	})

	t.Run("should return error for missing name", func(t *testing.T) {
		reqBody := models.CreateTeamRequest{
			Logo: "logo.png",
		}

		w := makeTeamRequest(t, router, "POST", "/api/v1/teams", reqBody)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Name")
	})

	t.Run("should create team without logo", func(t *testing.T) {
		reqBody := models.CreateTeamRequest{
			Name: "Simple Team",
		}

		w := makeTeamRequest(t, router, "POST", "/api/v1/teams", reqBody)

		assert.Equal(t, http.StatusCreated, w.Code)

		var response models.Team
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Simple Team", response.Name)
		assert.Empty(t, response.Logo)
	})
}

func TestGetTeams(t *testing.T) {
	router := setupTeamTestRouter()

	t.Run("should return empty list when no teams", func(t *testing.T) {
		w := makeTeamRequest(t, router, "GET", "/api/v1/teams", nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Team
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 0)
	})

	t.Run("should return list of teams", func(t *testing.T) {
		team1 := createTeamTestTeam(t, "Dev Team", "logo1.png")
		team2 := createTeamTestTeam(t, "Design Team", "logo2.png")

		w := makeTeamRequest(t, router, "GET", "/api/v1/teams", nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Team
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)
		
		names := []string{response[0].Name, response[1].Name}
		assert.Contains(t, names, team1.Name)
		assert.Contains(t, names, team2.Name)
	})

	t.Run("should include team members", func(t *testing.T) {
		team := createTeamTestTeam(t, "Team with Members", "logo.png")
		person := createTeamTestPerson(t, "Member", "member@example.com", "pic.jpg")
		
		database.GetDB().Model(&person).Update("team_id", team.ID)

		w := makeTeamRequest(t, router, "GET", "/api/v1/teams", nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.Team
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		
		found := false
		for _, team := range response {
			if team.Name == "Team with Members" {
				found = true
				assert.Len(t, team.Members, 1)
				assert.Equal(t, "Member", team.Members[0].Name)
				break
			}
		}
		assert.True(t, found)
	})
}

func TestGetTeam(t *testing.T) {
	router := setupTeamTestRouter()

	t.Run("should return team by ID", func(t *testing.T) {
		team := createTeamTestTeam(t, "Test Team", "logo.png")

		w := makeTeamRequest(t, router, "GET", fmt.Sprintf("/api/v1/teams/%d", team.ID), nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response models.Team
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, team.Name, response.Name)
		assert.Equal(t, team.Logo, response.Logo)
	})

	t.Run("should return error for invalid ID", func(t *testing.T) {
		w := makeTeamRequest(t, router, "GET", "/api/v1/teams/invalid", nil)

		assert.Equal(t, http.StatusBadRequest, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Invalid team ID")
	})

	t.Run("should return error for non-existent team", func(t *testing.T) {
		w := makeTeamRequest(t, router, "GET", "/api/v1/teams/999", nil)

		assert.Equal(t, http.StatusNotFound, w.Code)
		
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "Team not found")
	})
}

func TestUpdateTeam(t *testing.T) {
	router := setupTeamTestRouter()

	t.Run("should update team successfully", func(t *testing.T) {
		team := createTeamTestTeam(t, "Original Team", "old-logo.png")

		reqBody := models.CreateTeamRequest{
			Name: "Updated Team",
			Logo: "new-logo.png",
		}

		w := makeTeamRequest(t, router, "PUT", fmt.Sprintf("/api/v1/teams/%d", team.ID), reqBody)

		assert.Equal(t, http.StatusOK, w.Code)

		var response models.Team
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "Updated Team", response.Name)
		assert.Equal(t, "new-logo.png", response.Logo)
	})

	t.Run("should return error for invalid ID", func(t *testing.T) {
		reqBody := models.CreateTeamRequest{
			Name: "Test Team",
		}

		w := makeTeamRequest(t, router, "PUT", "/api/v1/teams/invalid", reqBody)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("should return error for non-existent team", func(t *testing.T) {
		reqBody := models.CreateTeamRequest{
			Name: "Test Team",
		}

		w := makeTeamRequest(t, router, "PUT", "/api/v1/teams/999", reqBody)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}

func TestDeleteTeam(t *testing.T) {
	router := setupTeamTestRouter()

	t.Run("should delete team successfully", func(t *testing.T) {
		team := createTeamTestTeam(t, "Team to Delete", "logo.png")

		w := makeTeamRequest(t, router, "DELETE", fmt.Sprintf("/api/v1/teams/%d", team.ID), nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["message"], "deleted successfully")
	})

	t.Run("should return error for invalid ID", func(t *testing.T) {
		w := makeTeamRequest(t, router, "DELETE", "/api/v1/teams/invalid", nil)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func createTeamTestTeam(t *testing.T, name, logo string) models.Team {
	team := models.Team{
		Name: name,
		Logo: logo,
	}

	err := database.GetDB().Create(&team).Error
	assert.NoError(t, err)

	return team
}

func createTeamTestPerson(t *testing.T, name, email, picture string) models.Person {
	person := models.Person{
		Name:    name,
		Email:   email,
		Picture: picture,
	}

	err := database.GetDB().Create(&person).Error
	assert.NoError(t, err)

	return person
}

func makeTeamRequest(t *testing.T, router *gin.Engine, method, url string, body interface{}) *httptest.ResponseRecorder {
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
