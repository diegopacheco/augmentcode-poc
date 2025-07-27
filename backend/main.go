package main

import (
	"log"
	"coaching-backend/config"
	"coaching-backend/database"
	"coaching-backend/handlers"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	
	database.Connect(cfg)

	r := gin.Default()

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
			persons.POST("/:id/remove-from-team", handlers.RemoveFromTeam)
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

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(r.Run(":" + cfg.Port))
}
