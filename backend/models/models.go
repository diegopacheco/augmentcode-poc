package models

import (
	"time"
)

type Person struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Name     string `json:"name" gorm:"not null"`
	Email    string `json:"email" gorm:"unique;not null"`
	Picture  string `json:"picture"`
	TeamID   *uint  `json:"team_id"`
	Team     *Team  `json:"team,omitempty" gorm:"foreignKey:TeamID"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Team struct {
	ID        uint     `json:"id" gorm:"primaryKey"`
	Name      string   `json:"name" gorm:"not null"`
	Logo      string   `json:"logo"`
	Members   []Person `json:"members,omitempty" gorm:"foreignKey:TeamID"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Feedback struct {
	ID         uint   `json:"id" gorm:"primaryKey"`
	Content    string `json:"content" gorm:"not null"`
	TargetType string `json:"target_type" gorm:"not null"`
	TargetID   uint   `json:"target_id" gorm:"not null"`
	TargetName string `json:"target_name" gorm:"not null"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type CreatePersonRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Picture string `json:"picture"`
}

type CreateTeamRequest struct {
	Name string `json:"name" binding:"required"`
	Logo string `json:"logo"`
}

type AssignToTeamRequest struct {
	PersonID uint `json:"person_id" binding:"required"`
	TeamID   uint `json:"team_id" binding:"required"`
}

type CreateFeedbackRequest struct {
	Content    string `json:"content" binding:"required"`
	TargetType string `json:"target_type" binding:"required,oneof=person team"`
	TargetID   uint   `json:"target_id" binding:"required"`
}
