package handlers

import (
	"net/http"
	"strconv"
	"coaching-backend/database"
	"coaching-backend/models"
	"github.com/gin-gonic/gin"
)

func CreateFeedback(c *gin.Context) {
	var req models.CreateFeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var targetName string
	if req.TargetType == "person" {
		var person models.Person
		if err := database.GetDB().First(&person, req.TargetID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Person not found"})
			return
		}
		targetName = person.Name
	} else if req.TargetType == "team" {
		var team models.Team
		if err := database.GetDB().First(&team, req.TargetID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}
		targetName = team.Name
	}

	feedback := models.Feedback{
		Content:    req.Content,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		TargetName: targetName,
	}

	if err := database.GetDB().Create(&feedback).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create feedback"})
		return
	}

	c.JSON(http.StatusCreated, feedback)
}

func GetFeedbacks(c *gin.Context) {
	var feedbacks []models.Feedback
	if err := database.GetDB().Order("created_at desc").Find(&feedbacks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch feedbacks"})
		return
	}

	c.JSON(http.StatusOK, feedbacks)
}

func GetFeedback(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid feedback ID"})
		return
	}

	var feedback models.Feedback
	if err := database.GetDB().First(&feedback, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Feedback not found"})
		return
	}

	c.JSON(http.StatusOK, feedback)
}

func GetFeedbacksByTarget(c *gin.Context) {
	targetType := c.Query("target_type")
	targetIDStr := c.Query("target_id")

	if targetType == "" || targetIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "target_type and target_id are required"})
		return
	}

	targetID, err := strconv.Atoi(targetIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid target_id"})
		return
	}

	var feedbacks []models.Feedback
	if err := database.GetDB().Where("target_type = ? AND target_id = ?", targetType, targetID).
		Order("created_at desc").Find(&feedbacks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch feedbacks"})
		return
	}

	c.JSON(http.StatusOK, feedbacks)
}

func DeleteFeedback(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid feedback ID"})
		return
	}

	if err := database.GetDB().Delete(&models.Feedback{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete feedback"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Feedback deleted successfully"})
}
