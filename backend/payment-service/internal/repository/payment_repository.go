package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PaymentRepository struct {
	db *pgxpool.Pool
}

func NewPaymentRepository(db *pgxpool.Pool) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) Create(ctx context.Context, p *Payment) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO payments (id, contract_id, client_id, amount, status, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		p.ID, p.ContractID, p.ClientID, p.Amount, p.Status, time.Now(), time.Now(),
	)
	return err
}

func (r *PaymentRepository) ListByClient(ctx context.Context, clientID string) ([]Payment, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, contract_id, client_id, amount, status, created_at, updated_at
		 FROM payments WHERE client_id = $1 ORDER BY created_at DESC`, clientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []Payment
	for rows.Next() {
		var p Payment
		if err := rows.Scan(&p.ID, &p.ContractID, &p.ClientID, &p.Amount,
			&p.Status, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		payments = append(payments, p)
	}
	if payments == nil {
		payments = []Payment{}
	}
	return payments, nil
}

func (r *PaymentRepository) GetByID(ctx context.Context, id string) (*Payment, error) {
	var p Payment
	err := r.db.QueryRow(ctx,
		`SELECT id, contract_id, client_id, amount, status, created_at, updated_at
		 FROM payments WHERE id = $1`, id).Scan(
		&p.ID, &p.ContractID, &p.ClientID, &p.Amount,
		&p.Status, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *PaymentRepository) UpdateStatus(ctx context.Context, id, status string) (*Payment, error) {
	var p Payment
	err := r.db.QueryRow(ctx,
		`UPDATE payments SET status = $1, updated_at = $2 WHERE id = $3
		 RETURNING id, contract_id, client_id, amount, status, created_at, updated_at`,
		status, time.Now(), id).Scan(
		&p.ID, &p.ContractID, &p.ClientID, &p.Amount,
		&p.Status, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}
