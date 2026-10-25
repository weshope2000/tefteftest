package repository

import "time"

type Message struct {
	ID         string    `json:"id"`
	ContractID string    `json:"contract_id"`
	SenderID   string    `json:"sender_id"`
	ReceiverID string    `json:"receiver_id"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
}