package repository

import "time"

type Review struct {
	ID         string    `json:"id"`
	ContractID string    `json:"contract_id"`
	ReviewerID string    `json:"reviewer_id"`
	RevieweeID string    `json:"reviewee_id"`
	Rating     int       `json:"rating"`
	Feedback   string    `json:"feedback"`
	CreatedAt  time.Time `json:"created_at"`
}