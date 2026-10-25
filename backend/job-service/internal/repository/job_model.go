package repository

import "time"

type Job struct {
	ID                 string    `json:"id"`
	UserID             string    `json:"user_id"`
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	Requirements       string    `json:"requirements"`
	Skills             string    `json:"skills"`
	Budget             float64   `json:"budget"`
	Type               string    `json:"type"`
	DeliveryDays       int       `json:"delivery_days"`
	Status             string    `json:"status"`
	ProposalsDisclosed bool      `json:"proposals_disclosed"`
	ProposalCount      int       `json:"proposal_count"`
	IsSaved            bool      `json:"is_saved"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type JobDetail struct {
	Job
	Employer *Employer `json:"employer"`
}

type SavedJob struct {
	JobID     string    `json:"job_id"`
	Title     string    `json:"title"`
	Company   string    `json:"company"`
	Budget    float64   `json:"budget"`
	Type      string    `json:"type"`
	Skills    string    `json:"skills"`
	Status    string    `json:"status"`
	SavedAt   time.Time `json:"saved_at"`
	CreatedAt time.Time `json:"created_at"`
}
