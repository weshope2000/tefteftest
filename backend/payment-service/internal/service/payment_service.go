package service

import (
	"context"
	"errors"
	"time"

	"teftef.com/payment/internal/repository"

	"github.com/google/uuid"
)

type PaymentService struct {
	repo *repository.PaymentRepository
}

func NewPaymentService(r *repository.PaymentRepository) *PaymentService {
	return &PaymentService{repo: r}
}

type CreatePaymentRequest struct {
	ContractID string  `json:"contract_id"`
	Amount     float64 `json:"amount"`
}

func (s *PaymentService) CreatePayment(ctx context.Context, clientID string, req CreatePaymentRequest) (*repository.Payment, error) {
	if req.ContractID == "" {
		return nil, errors.New("contract_id is required")
	}
	if req.Amount <= 0 {
		return nil, errors.New("amount must be greater than 0")
	}
	p := &repository.Payment{
		ID:         uuid.New().String(),
		ContractID: req.ContractID,
		ClientID:   clientID,
		Amount:     req.Amount,
		Status:     "pending",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	if err := s.repo.Create(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *PaymentService) ListByClient(ctx context.Context, clientID string) ([]repository.Payment, error) {
	return s.repo.ListByClient(ctx, clientID)
}

func (s *PaymentService) GetByID(ctx context.Context, id string) (*repository.Payment, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *PaymentService) Pay(ctx context.Context, id, clientID string) (*repository.Payment, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, errors.New("payment not found")
	}
	if p.ClientID != clientID {
		return nil, errors.New("unauthorized")
	}
	return s.repo.UpdateStatus(ctx, id, "paid")
}