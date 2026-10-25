package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type AuditLog struct {
	ID            int    `json:"id"`
	ActorID       string `json:"actor_id"`
	ActorRole     string `json:"actor_role"`
	Action        string `json:"action"`
	TargetType    string `json:"target_type"`
	TargetID      string `json:"target_id"`
	Reason        string `json:"reason"`
	Outcome       string `json:"outcome"`
	CreatedAt     string `json:"created_at"`
}

type AuditRepository interface {
	List() ([]AuditLog, error)
	Create(log AuditLog) error
}

type auditRepo struct {
	db *pgxpool.Pool
}

func NewAuditRepository(db *pgxpool.Pool) AuditRepository {
	return &auditRepo{db: db}
}

func (r *auditRepo) List() ([]AuditLog, error) {
	rows, err := r.db.Query(context.Background(),
		"SELECT id, actor_id, actor_role, action, target_type, target_id, reason, outcome, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 100")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	logs := []AuditLog{}
	for rows.Next() {
		var l AuditLog
		if err := rows.Scan(&l.ID, &l.ActorID, &l.ActorRole, &l.Action, &l.TargetType, &l.TargetID, &l.Reason, &l.Outcome, &l.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, rows.Err()
}

func (r *auditRepo) Create(log AuditLog) error {
	_, err := r.db.Exec(context.Background(),
		"INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, reason, outcome) VALUES ($1,$2,$3,$4,$5,$6,$7)",
		log.ActorID, log.ActorRole, log.Action, log.TargetType, log.TargetID, log.Reason, log.Outcome)
	return err
}