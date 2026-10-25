package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EmployerRepository struct {
	db *pgxpool.Pool
}

func NewEmployerRepository(db *pgxpool.Pool) *EmployerRepository {
	return &EmployerRepository{db: db}
}

const employerColumns = `u.id, COALESCE(u.name, ''), u.role,
	COALESCE(p.company_name, ''), COALESCE(p.headline, ''), COALESCE(p.bio, ''), COALESCE(p.country, ''),
	COALESCE(p.total_spent, 0), COALESCE(p.total_hired, 0), COALESCE(p.avg_rating, 0),
	COALESCE(p.verification_status, 'unverified'), p.verified_at, u.created_at`

func scanEmployer(s scanner) (Employer, error) {
	var e Employer
	err := s.Scan(&e.UserID, &e.Name, &e.Role, &e.CompanyName, &e.Headline, &e.Bio,
		&e.Country, &e.TotalSpent, &e.TotalHired, &e.AvgRating, &e.VerificationStatus,
		&e.VerifiedAt, &e.MemberSince)
	return e, err
}

func (r *EmployerRepository) GetByID(ctx context.Context, userID string) (*Employer, error) {
	e, err := scanEmployer(r.db.QueryRow(ctx,
		`SELECT `+employerColumns+`
		 FROM users u LEFT JOIN employer_profiles p ON p.user_id = u.id
		 WHERE u.id = $1`, userID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &e, nil
}

func (r *EmployerRepository) UpdateProfile(ctx context.Context, userID string, req UpdateEmployerRequest) (*Employer, error) {
	_, err := r.db.Exec(ctx,
		`INSERT INTO employer_profiles (user_id, company_name, headline, bio, country, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 ON CONFLICT (user_id) DO UPDATE
		 SET company_name = EXCLUDED.company_name,
				headline    = EXCLUDED.headline,
				bio         = EXCLUDED.bio,
				country     = EXCLUDED.country`,
		userID, req.CompanyName, req.Headline, req.Bio, req.Country, time.Now())
	if err != nil {
		return nil, err
	}
	return r.GetByID(ctx, userID)
}

func (r *EmployerRepository) UpdateVerification(ctx context.Context, userID, status string) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO employer_profiles (user_id, verification_status, verified_at, created_at)
		 VALUES ($1, $2, CASE WHEN $2 = 'verified' THEN $3 ELSE NULL END, $4)
		 ON CONFLICT (user_id) DO UPDATE
		 SET verification_status = EXCLUDED.verification_status,
				verified_at = EXCLUDED.verified_at`,
		userID, status, time.Now(), time.Now())
	return err
}
