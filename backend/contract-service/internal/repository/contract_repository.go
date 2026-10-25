package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ContractRepository struct {
	db *pgxpool.Pool
}

func NewContractRepository(db *pgxpool.Pool) *ContractRepository {
	return &ContractRepository{db: db}
}

func (r *ContractRepository) Create(ctx context.Context, c *Contract) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO contracts (id, job_id, client_id, freelancer_id, amount, status, version, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		c.ID, c.JobID, c.ClientID, c.FreelancerID, c.Amount, c.Status, c.Version, time.Now(), time.Now(),
	)
	return err
}

func (r *ContractRepository) ListByClient(ctx context.Context, clientID string) ([]Contract, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, job_id, client_id, freelancer_id, amount, status, version, created_at, updated_at
		 FROM contracts WHERE client_id = $1 ORDER BY created_at DESC`, clientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contracts []Contract
	for rows.Next() {
		var c Contract
		if err := rows.Scan(&c.ID, &c.JobID, &c.ClientID, &c.FreelancerID,
			&c.Amount, &c.Status, &c.Version, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		contracts = append(contracts, c)
	}
	if contracts == nil {
		contracts = []Contract{}
	}
	return contracts, nil
}

func (r *ContractRepository) ListByFreelancer(ctx context.Context, freelancerID string) ([]Contract, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, job_id, client_id, freelancer_id, amount, status, version, created_at, updated_at
		 FROM contracts WHERE freelancer_id = $1 ORDER BY created_at DESC`, freelancerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contracts []Contract
	for rows.Next() {
		var c Contract
		if err := rows.Scan(&c.ID, &c.JobID, &c.ClientID, &c.FreelancerID,
			&c.Amount, &c.Status, &c.Version, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		contracts = append(contracts, c)
	}
	if contracts == nil {
		contracts = []Contract{}
	}
	return contracts, nil
}

func (r *ContractRepository) GetByID(ctx context.Context, id string) (*Contract, error) {
	var c Contract
	err := r.db.QueryRow(ctx,
		`SELECT id, job_id, client_id, freelancer_id, amount, status, version, created_at, updated_at
		 FROM contracts WHERE id = $1`, id).Scan(
		&c.ID, &c.JobID, &c.ClientID, &c.FreelancerID,
		&c.Amount, &c.Status, &c.Version, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &c, nil
}

func (r *ContractRepository) UpdateStatus(ctx context.Context, id, status string) (*Contract, error) {
	var c Contract
	err := r.db.QueryRow(ctx,
		`UPDATE contracts SET status = $1, updated_at = $2 WHERE id = $3
		 RETURNING id, job_id, client_id, freelancer_id, amount, status, version, created_at, updated_at`,
		status, time.Now(), id).Scan(
		&c.ID, &c.JobID, &c.ClientID, &c.FreelancerID,
		&c.Amount, &c.Status, &c.Version, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
