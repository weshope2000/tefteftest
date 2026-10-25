package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type JobRepository struct {
	db *pgxpool.Pool
}

func NewJobRepository(db *pgxpool.Pool) *JobRepository {
	return &JobRepository{db: db}
}

const jobColumns = `id, user_id, title, description, requirements, skills, budget, type,
	delivery_days, status, proposals_disclosed, created_at, updated_at`

type scanner interface {
	Scan(dest ...any) error
}

func scanJob(s scanner) (Job, error) {
	var j Job
	err := s.Scan(&j.ID, &j.UserID, &j.Title, &j.Description, &j.Requirements, &j.Skills,
		&j.Budget, &j.Type, &j.DeliveryDays, &j.Status, &j.ProposalsDisclosed,
		&j.CreatedAt, &j.UpdatedAt)
	return j, err
}

func (r *JobRepository) Create(ctx context.Context, job *Job) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO jobs (id, user_id, title, description, requirements, skills, budget, type,
			delivery_days, status, proposals_disclosed, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
		job.ID, job.UserID, job.Title, job.Description, job.Requirements, job.Skills,
		job.Budget, job.Type, job.DeliveryDays, job.Status, job.ProposalsDisclosed,
		time.Now(), time.Now(),
	)
	return err
}

func (r *JobRepository) ListByUser(ctx context.Context, userID string) ([]Job, error) {
	rows, err := r.db.Query(ctx,
		`SELECT `+jobColumns+` FROM jobs WHERE user_id = $1 ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	jobs := []Job{}
	for rows.Next() {
		j, err := scanJob(rows)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, j)
	}
	return jobs, rows.Err()
}

func (r *JobRepository) ListAll(ctx context.Context, status string) ([]Job, error) {
	query := `SELECT ` + jobColumns + ` FROM jobs`
	args := []any{}
	if status != "" {
		query += ` WHERE status = $1`
		args = append(args, status)
	}
	query += ` ORDER BY created_at DESC`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	jobs := []Job{}
	for rows.Next() {
		j, err := scanJob(rows)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, j)
	}
	return jobs, rows.Err()
}

func (r *JobRepository) GetByID(ctx context.Context, id string) (*Job, error) {
	j, err := scanJob(r.db.QueryRow(ctx, `SELECT `+jobColumns+` FROM jobs WHERE id = $1`, id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &j, nil
}

func (r *JobRepository) UpdateStatus(ctx context.Context, id, status string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE jobs SET status = $1, updated_at = $2 WHERE id = $3`,
		status, time.Now(), id)
	return err
}

// CountProposals counts the active (non-withdrawn) proposals submitted for a job.
func (r *JobRepository) CountProposals(ctx context.Context, jobID string) (int, error) {
	var count int
	err := r.db.QueryRow(ctx,
		`SELECT count(*) FROM bids WHERE job_id = $1 AND status <> 'withdrawn'`, jobID).Scan(&count)
	return count, err
}

func (r *JobRepository) IsSaved(ctx context.Context, userID, jobID string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM saved_jobs WHERE user_id = $1 AND job_id = $2)`,
		userID, jobID).Scan(&exists)
	return exists, err
}

func (r *JobRepository) SaveJob(ctx context.Context, userID, jobID string) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO saved_jobs (user_id, job_id, created_at) VALUES ($1, $2, $3)
		 ON CONFLICT (user_id, job_id) DO NOTHING`,
		userID, jobID, time.Now())
	return err
}

func (r *JobRepository) UnsaveJob(ctx context.Context, userID, jobID string) error {
	_, err := r.db.Exec(ctx,
		`DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2`, userID, jobID)
	return err
}

func (r *JobRepository) ListSavedJobs(ctx context.Context, userID string) ([]SavedJob, error) {
	rows, err := r.db.Query(ctx,
		`SELECT j.id, j.title, COALESCE(u.name, ''), j.budget, j.type, j.skills, j.status,
			s.created_at, j.created_at
		 FROM saved_jobs s
		 JOIN jobs j ON j.id = s.job_id
		 LEFT JOIN users u ON u.id = j.user_id
		 WHERE s.user_id = $1
		 ORDER BY s.created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	saved := []SavedJob{}
	for rows.Next() {
		var s SavedJob
		if err := rows.Scan(&s.JobID, &s.Title, &s.Company, &s.Budget, &s.Type, &s.Skills,
			&s.Status, &s.SavedAt, &s.CreatedAt); err != nil {
			return nil, err
		}
		saved = append(saved, s)
	}
	return saved, rows.Err()
}

func (r *JobRepository) CreateReport(ctx context.Context, jobID, reporterID, reason, details string) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO job_reports (job_id, reporter_id, reason, details, created_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		jobID, reporterID, reason, details, time.Now())
	return err
}
