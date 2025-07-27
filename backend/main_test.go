package main

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHealthEndpoint(t *testing.T) {
	router := setupTestRouter()

	t.Run("should return health status", func(t *testing.T) {
		w := makeRequest(t, router, "GET", "/health", nil)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, "ok", response["status"])
	})
}

func TestCORSHeaders(t *testing.T) {
	router := setupTestRouter()

	t.Run("should set CORS headers for GET request", func(t *testing.T) {
		w := makeRequest(t, router, "GET", "/health", nil)

		assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
		assert.Equal(t, "GET, POST, PUT, DELETE, OPTIONS", w.Header().Get("Access-Control-Allow-Methods"))
		assert.Equal(t, "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization", w.Header().Get("Access-Control-Allow-Headers"))
	})

	t.Run("should handle OPTIONS request", func(t *testing.T) {
		w := makeRequest(t, router, "OPTIONS", "/api/v1/persons", nil)

		assert.Equal(t, http.StatusNoContent, w.Code)
		assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
	})
}

func TestAPIRoutes(t *testing.T) {
	router := setupTestRouter()

	t.Run("should have person routes", func(t *testing.T) {
		routes := []struct {
			method string
			path   string
			expectedCodes []int
		}{
			{"POST", "/api/v1/persons", []int{http.StatusBadRequest}},
			{"GET", "/api/v1/persons", []int{http.StatusOK}},
			{"GET", "/api/v1/persons/1", []int{http.StatusNotFound, http.StatusBadRequest}},
			{"PUT", "/api/v1/persons/1", []int{http.StatusNotFound, http.StatusBadRequest}},
			{"DELETE", "/api/v1/persons/1", []int{http.StatusOK, http.StatusBadRequest}},
		}

		for _, route := range routes {
			w := makeRequest(t, router, route.method, route.path, nil)
			assert.Contains(t, route.expectedCodes, w.Code, "Route %s %s should return expected status", route.method, route.path)
		}
	})

	t.Run("should have team routes", func(t *testing.T) {
		routes := []struct {
			method string
			path   string
			expectedCodes []int
		}{
			{"POST", "/api/v1/teams", []int{http.StatusBadRequest}},
			{"GET", "/api/v1/teams", []int{http.StatusOK}},
			{"GET", "/api/v1/teams/1", []int{http.StatusNotFound, http.StatusBadRequest}},
			{"PUT", "/api/v1/teams/1", []int{http.StatusNotFound, http.StatusBadRequest}},
			{"DELETE", "/api/v1/teams/1", []int{http.StatusOK, http.StatusBadRequest}},
		}

		for _, route := range routes {
			w := makeRequest(t, router, route.method, route.path, nil)
			assert.Contains(t, route.expectedCodes, w.Code, "Route %s %s should return expected status", route.method, route.path)
		}
	})

	t.Run("should have feedback routes", func(t *testing.T) {
		routes := []struct {
			method string
			path   string
			expectedCodes []int
		}{
			{"POST", "/api/v1/feedbacks", []int{http.StatusBadRequest}},
			{"GET", "/api/v1/feedbacks", []int{http.StatusOK}},
			{"GET", "/api/v1/feedbacks/1", []int{http.StatusNotFound, http.StatusBadRequest}},
			{"GET", "/api/v1/feedbacks/by-target", []int{http.StatusBadRequest}},
			{"DELETE", "/api/v1/feedbacks/1", []int{http.StatusOK, http.StatusBadRequest}},
		}

		for _, route := range routes {
			w := makeRequest(t, router, route.method, route.path, nil)
			assert.Contains(t, route.expectedCodes, w.Code, "Route %s %s should return expected status", route.method, route.path)
		}
	})

	t.Run("should have assign route", func(t *testing.T) {
		w := makeRequest(t, router, "POST", "/api/v1/assign", nil)
		assert.NotEqual(t, http.StatusNotFound, w.Code, "Assign route should exist")
	})
}

func TestIntegrationWorkflow(t *testing.T) {
	router := setupTestRouter()

	t.Run("should complete full workflow", func(t *testing.T) {
		personReq := map[string]interface{}{
			"name":    "John Doe",
			"email":   "john@example.com",
			"picture": "pic.jpg",
		}
		personResp := makeRequest(t, router, "POST", "/api/v1/persons", personReq)
		assert.Equal(t, http.StatusCreated, personResp.Code)

		var person map[string]interface{}
		err := json.Unmarshal(personResp.Body.Bytes(), &person)
		assert.NoError(t, err)
		personID := person["id"]

		teamReq := map[string]interface{}{
			"name": "Dev Team",
			"logo": "logo.png",
		}
		teamResp := makeRequest(t, router, "POST", "/api/v1/teams", teamReq)
		assert.Equal(t, http.StatusCreated, teamResp.Code)

		var team map[string]interface{}
		err = json.Unmarshal(teamResp.Body.Bytes(), &team)
		assert.NoError(t, err)
		teamID := team["id"]

		assignReq := map[string]interface{}{
			"person_id": personID,
			"team_id":   teamID,
		}
		assignResp := makeRequest(t, router, "POST", "/api/v1/assign", assignReq)
		assert.Equal(t, http.StatusOK, assignResp.Code)

		feedbackReq := map[string]interface{}{
			"content":     "Great work!",
			"target_type": "person",
			"target_id":   personID,
		}
		feedbackResp := makeRequest(t, router, "POST", "/api/v1/feedbacks", feedbackReq)
		assert.Equal(t, http.StatusCreated, feedbackResp.Code)

		personsResp := makeRequest(t, router, "GET", "/api/v1/persons", nil)
		assert.Equal(t, http.StatusOK, personsResp.Code)

		var persons []map[string]interface{}
		err = json.Unmarshal(personsResp.Body.Bytes(), &persons)
		assert.NoError(t, err)
		assert.Len(t, persons, 1)
		assert.Equal(t, "John Doe", persons[0]["name"])

		teamsResp := makeRequest(t, router, "GET", "/api/v1/teams", nil)
		assert.Equal(t, http.StatusOK, teamsResp.Code)

		var teams []map[string]interface{}
		err = json.Unmarshal(teamsResp.Body.Bytes(), &teams)
		assert.NoError(t, err)
		assert.Len(t, teams, 1)
		assert.Equal(t, "Dev Team", teams[0]["name"])

		feedbacksResp := makeRequest(t, router, "GET", "/api/v1/feedbacks", nil)
		assert.Equal(t, http.StatusOK, feedbacksResp.Code)

		var feedbacks []map[string]interface{}
		err = json.Unmarshal(feedbacksResp.Body.Bytes(), &feedbacks)
		assert.NoError(t, err)
		assert.Len(t, feedbacks, 1)
		assert.Equal(t, "Great work!", feedbacks[0]["content"])
	})
}

func TestErrorHandling(t *testing.T) {
	router := setupTestRouter()

	t.Run("should return 404 for non-existent routes", func(t *testing.T) {
		w := makeRequest(t, router, "GET", "/non-existent", nil)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("should handle malformed JSON", func(t *testing.T) {
		w := makeRequest(t, router, "POST", "/api/v1/persons", "invalid json")
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("should validate required fields", func(t *testing.T) {
		invalidReq := map[string]interface{}{
			"picture": "pic.jpg",
		}
		w := makeRequest(t, router, "POST", "/api/v1/persons", invalidReq)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
