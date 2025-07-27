package database

import (
	"fmt"
	"log"
	"time"
	"coaching-backend/config"
	"coaching-backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect(cfg *config.Config) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	var err error
	maxRetries := 30
	retryDelay := 2 * time.Second

	log.Printf("Attempting to connect to database at %s:%s", cfg.DBHost, cfg.DBPort)

	for i := 0; i < maxRetries; i++ {
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}

		log.Printf("Failed to connect to database (attempt %d/%d): %v", i+1, maxRetries, err)
		if i < maxRetries-1 {
			log.Printf("Retrying in %v...", retryDelay)
			time.Sleep(retryDelay)
		}
	}

	if err != nil {
		log.Fatal("Failed to connect to database after all retries:", err)
	}

	log.Println("Database connected successfully, starting migration...")

	err = DB.AutoMigrate(&models.Person{}, &models.Team{}, &models.Feedback{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database connected and migrated successfully")
}

func GetDB() *gorm.DB {
	return DB
}
