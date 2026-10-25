package repository

import "time"

type Contract struct {
	ID            string    `json:"id"`
	JobID         string    `json:"job_id"`
	ClientID      string    `json:"client_id"`
	FreelancerID  string    `json:"freelancer_id"`
	Amount        float64   `json:"amount"`
	Status        string    `json:"status"`
	Version       int       `json:"version"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}