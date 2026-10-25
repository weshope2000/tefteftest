package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type MessageRepository struct {
	db *pgxpool.Pool
}

func NewMessageRepository(db *pgxpool.Pool) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) Create(ctx context.Context, m *Message) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO messages (id, contract_id, sender_id, receiver_id, content, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		m.ID, m.ContractID, m.SenderID, m.ReceiverID, m.Content, time.Now(),
	)
	return err
}

func (r *MessageRepository) ListByContract(ctx context.Context, contractID string) ([]Message, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, contract_id, sender_id, receiver_id, content, created_at
		 FROM messages WHERE contract_id = $1 ORDER BY created_at ASC`, contractID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var m Message
		if err := rows.Scan(&m.ID, &m.ContractID, &m.SenderID, &m.ReceiverID,
			&m.Content, &m.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	if messages == nil {
		messages = []Message{}
	}
	return messages, nil
}

func (r *MessageRepository) ListByUser(ctx context.Context, userID string) ([]Message, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, contract_id, sender_id, receiver_id, content, created_at
		 FROM messages WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var m Message
		if err := rows.Scan(&m.ID, &m.ContractID, &m.SenderID, &m.ReceiverID,
			&m.Content, &m.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	if messages == nil {
		messages = []Message{}
	}
	return messages, nil
}
