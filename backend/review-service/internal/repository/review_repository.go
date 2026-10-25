package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ReviewRepository struct {
	db *pgxpool.Pool
}

func NewReviewRepository(db *pgxpool.Pool) *ReviewRepository {
	return &ReviewRepository{db: db}
}

func (r *ReviewRepository) Create(ctx context.Context, rv *Review) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO reviews (id, contract_id, reviewer_id, reviewee_id, rating, feedback, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		rv.ID, rv.ContractID, rv.ReviewerID, rv.RevieweeID, rv.Rating, rv.Feedback, time.Now(),
	)
	return err
}

func (r *ReviewRepository) ListByReviewee(ctx context.Context, revieweeID string) ([]Review, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, contract_id, reviewer_id, reviewee_id, rating, feedback, created_at
		 FROM reviews WHERE reviewee_id = $1 ORDER BY created_at DESC`, revieweeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []Review
	for rows.Next() {
		var rv Review
		if err := rows.Scan(&rv.ID, &rv.ContractID, &rv.ReviewerID, &rv.RevieweeID,
			&rv.Rating, &rv.Feedback, &rv.CreatedAt); err != nil {
			return nil, err
		}
		reviews = append(reviews, rv)
	}
	if reviews == nil {
		reviews = []Review{}
	}
	return reviews, nil
}

func (r *ReviewRepository) ListByContract(ctx context.Context, contractID string) ([]Review, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, contract_id, reviewer_id, reviewee_id, rating, feedback, created_at
		 FROM reviews WHERE contract_id = $1 ORDER BY created_at DESC`, contractID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []Review
	for rows.Next() {
		var rv Review
		if err := rows.Scan(&rv.ID, &rv.ContractID, &rv.ReviewerID, &rv.RevieweeID,
			&rv.Rating, &rv.Feedback, &rv.CreatedAt); err != nil {
			return nil, err
		}
		reviews = append(reviews, rv)
	}
	if reviews == nil {
		reviews = []Review{}
	}
	return reviews, nil
}

func (r *ReviewRepository) Exists(ctx context.Context, contractID, reviewerID string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM reviews WHERE contract_id = $1 AND reviewer_id = $2)`,
		contractID, reviewerID).Scan(&exists)
	return exists, err
}
