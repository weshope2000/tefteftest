package repository

import "time"

type Milestone struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	DueInDays   int     `json:"due_in_days"`
}

type Bid struct {
	ID             int         `json:"id"`
	JobID          string      `json:"job_id"`
	JobTitle       string      `json:"job_title"`
	FreelancerID   string      `json:"freelancer_id"`
	FreelancerName string      `json:"freelancer_name"`
	Amount         float64     `json:"amount"`
	RateType       string      `json:"rate_type"`
	HourlyRate     float64     `json:"hourly_rate"`
	CoverLetter    string      `json:"cover_letter"`
	DeliveryDays   int         `json:"delivery_days"`
	Experience     string      `json:"experience"`
	Portfolio      []string    `json:"portfolio"`
	Milestones     []Milestone `json:"milestones"`
	Status         string      `json:"status"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
	WithdrawnAt    *time.Time  `json:"withdrawn_at"`
}

type JobInfo struct {
	ID     string `json:"id"`
	UserID string `json:"user_id"`
	Type   string `json:"type"`
	Status string `json:"status"`
}
