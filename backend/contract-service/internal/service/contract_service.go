package service

import (
	"context"
	"errors"
	"time"

	"teftef.com/contract/internal/repository"

	"github.com/google/uuid"
)

type ContractService struct {
	repo *repository.ContractRepository
}

func NewContractService(r *repository.ContractRepository) *ContractService {
	return &ContractService{repo: r}
}

type CreateContractRequest struct {
	JobID        string  `json:"job_id"`
	FreelancerID string  `json:"freelancer_id"`
	Amount       float64 `json:"amount"`
}

func (s *ContractService) CreateContract(ctx context.Context, clientID string, req CreateContractRequest) (*repository.Contract, error) {
	if req.JobID == "" {
		return nil, errors.New("job_id is required")
	}
	if req.FreelancerID == "" {
		return nil, errors.New("freelancer_id is required")
	}
	if req.Amount <= 0 {
		return nil, errors.New("amount must be greater than 0")
	}
	c := &repository.Contract{
		ID:           uuid.New().String(),
		JobID:        req.JobID,
		ClientID:     clientID,
		FreelancerID: req.FreelancerID,
		Amount:       req.Amount,
		Status:       "active",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	if err := s.repo.Create(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *ContractService) ListByClient(ctx context.Context, clientID string) ([]repository.Contract, error) {
	return s.repo.ListByClient(ctx, clientID)
}

func (s *ContractService) ListByFreelancer(ctx context.Context, freelancerID string) ([]repository.Contract, error) {
	return s.repo.ListByFreelancer(ctx, freelancerID)
}

func (s *ContractService) GetByID(ctx context.Context, id string) (*repository.Contract, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *ContractService) CompleteContract(ctx context.Context, id, clientID string) (*repository.Contract, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if c == nil {
		return nil, errors.New("contract not found")
	}
	if c.ClientID != clientID {
		return nil, errors.New("unauthorized")
	}
	return s.repo.UpdateStatus(ctx, id, "completed")
}