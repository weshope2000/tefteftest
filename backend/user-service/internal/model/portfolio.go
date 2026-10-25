package model

import "time"

type Portfolio struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	FileURL     string    `json:"file_url"`
	CreatedAt   time.Time `json:"created_at"`
}
