package repository

import "time"

type Payment struct {
	ID         string    `json:"id"`
	ContractID string    `json:"contract_id"`
	ClientID   string    `json:"client_id"`
	Amount     float64   `json:"amount"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}