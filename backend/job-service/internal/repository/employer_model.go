package repository

import "time"

type Employer struct {
	UserID             string     `json:"user_id"`
	Name               string     `json:"name"`
	Role               string     `json:"role"`
	CompanyName        string     `json:"company_name"`
	Headline           string     `json:"headline"`
	Bio                string     `json:"bio"`
	Country            string     `json:"country"`
	TotalSpent         float64    `json:"total_spent"`
	TotalHired         int        `json:"total_hired"`
	AvgRating          float64    `json:"avg_rating"`
	VerificationStatus string     `json:"verification_status"`
	VerifiedAt         *time.Time `json:"verified_at"`
	MemberSince        time.Time  `json:"member_since"`
}

type UpdateEmployerRequest struct {
	CompanyName string `json:"company_name"`
	Headline    string `json:"headline"`
	Bio         string `json:"bio"`
	Country     string `json:"country"`
}
