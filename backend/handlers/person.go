package handlers

import (
	"net/http"
	"strconv"
	"coaching-backend/database"
	"coaching-backend/models"
	"github.com/gin-gonic/gin"
)

func CreatePerson(c *gin.Context) {
	var req models.CreatePersonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	person := models.Person{
		Name:    req.Name,
		Email:   req.Email,
		Picture: req.Picture,
	}

	if err := database.GetDB().Create(&person).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create person"})
		return
	}

	c.JSON(http.StatusCreated, person)
}

func GetPersons(c *gin.Context) {
	var persons []models.Person
	if err := database.GetDB().Preload("Team").Find(&persons).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch persons"})
		return
	}

	c.JSON(http.StatusOK, persons)
}

func GetPerson(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid person ID"})
		return
	}

	var person models.Person
	if err := database.GetDB().Preload("Team").First(&person, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Person not found"})
		return
	}

	c.JSON(http.StatusOK, person)
}

func UpdatePerson(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid person ID"})
		return
	}

	var req models.CreatePersonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var person models.Person
	if err := database.GetDB().First(&person, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Person not found"})
		return
	}

	person.Name = req.Name
	person.Email = req.Email
	person.Picture = req.Picture

	if err := database.GetDB().Save(&person).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update person"})
		return
	}

	c.JSON(http.StatusOK, person)
}

func DeletePerson(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid person ID"})
		return
	}

	if err := database.GetDB().Delete(&models.Person{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete person"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Person deleted successfully"})
}

func AssignToTeam(c *gin.Context) {
	var req models.AssignToTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var person models.Person
	if err := database.GetDB().First(&person, req.PersonID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Person not found"})
		return
	}

	var team models.Team
	if err := database.GetDB().First(&team, req.TeamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	person.TeamID = &req.TeamID
	if err := database.GetDB().Save(&person).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign person to team"})
		return
	}

	if err := database.GetDB().Preload("Team").First(&person, req.PersonID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated person"})
		return
	}

	c.JSON(http.StatusOK, person)
}

func RemoveFromTeam(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid person ID"})
		return
	}

	var person models.Person
	if err := database.GetDB().First(&person, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Person not found"})
		return
	}

	person.TeamID = nil
	if err := database.GetDB().Save(&person).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove person from team"})
		return
	}

	if err := database.GetDB().Preload("Team").First(&person, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated person"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Person removed from team successfully", "person": person})
}
