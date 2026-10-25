package service

import (
	"context"
	"errors"
	"time"

	"teftef.com/review/internal/repository"

	"github.com/google/uuid"
)

type ReviewService struct {
	repo *repository.ReviewRepository
}

func NewReviewService(r *repository.ReviewRepository) *ReviewService {
	return &ReviewService{repo: r}
}

type CreateReviewRequest struct {
	ContractID string `json:"contract_id"`
	RevieweeID string `json:"reviewee_id"`
	Rating     int    `json:"rating"`
	Feedback   string `json:"feedback"`
}

func (s *ReviewService) CreateReview(ctx context.Context, reviewerID string, req CreateReviewRequest) (*repository.Review, error) {
	if req.Rating < 1 || req.Rating > 5 {
		return nil, errors.New("rating must be between 1 and 5")
	}
	exists, err := s.repo.Exists(ctx, req.ContractID, reviewerID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("review already exists for this contract")
	}
	rv := &repository.Review{
		ID:         uuid.New().String(),
		ContractID: req.ContractID,
		ReviewerID: reviewerID,
		RevieweeID: req.RevieweeID,
		Rating:     req.Rating,
		Feedback:   req.Feedback,
		CreatedAt:  time.Now(),
	}
	if err := s.repo.Create(ctx, rv); err != nil {
		return nil, err
	}
	return rv, nil
}

func (s *ReviewService) ListByReviewee(ctx context.Context, revieweeID string) ([]repository.Review, error) {
	return s.repo.ListByReviewee(ctx, revieweeID)
}

func (s *ReviewService) ListByContract(ctx context.Context, contractID string) ([]repository.Review, error) {
	return s.repo.ListByContract(ctx, contractID)
}