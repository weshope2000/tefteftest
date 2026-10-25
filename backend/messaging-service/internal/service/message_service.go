package service

import (
	"context"
	"errors"
	"time"

	"teftef.com/messaging/internal/repository"

	"github.com/google/uuid"
)

type MessageService struct {
	repo *repository.MessageRepository
}

func NewMessageService(r *repository.MessageRepository) *MessageService {
	return &MessageService{repo: r}
}

type SendMessageRequest struct {
	ContractID string `json:"contract_id"`
	ReceiverID string `json:"receiver_id"`
	Content    string `json:"content"`
}

func (s *MessageService) SendMessage(ctx context.Context, senderID string, req SendMessageRequest) (*repository.Message, error) {
	if req.Content == "" {
		return nil, errors.New("content is required")
	}
	m := &repository.Message{
		ID:         uuid.New().String(),
		ContractID: req.ContractID,
		SenderID:   senderID,
		ReceiverID: req.ReceiverID,
		Content:    req.Content,
		CreatedAt:  time.Now(),
	}
	if err := s.repo.Create(ctx, m); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *MessageService) ListByContract(ctx context.Context, contractID string) ([]repository.Message, error) {
	return s.repo.ListByContract(ctx, contractID)
}

func (s *MessageService) ListByUser(ctx context.Context, userID string) ([]repository.Message, error) {
	return s.repo.ListByUser(ctx, userID)
}