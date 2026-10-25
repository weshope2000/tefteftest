package repository

import (
	"context"

	"teftef.com/auth/internal/model"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository interface {
	Create(user model.User) error
	GetByEmail(email string) (model.User, error)
	ListAll() ([]model.User, error)
	UpdateStatus(id string, status string) error
}

type userRepo struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) Create(user model.User) error {
	_, err := r.db.Exec(context.Background(),
		"INSERT INTO users (id, name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5, $6)",
		user.ID, user.Name, user.Email, user.PasswordHash, user.Role, "active",
	)
	return err
}

func (r *userRepo) GetByEmail(email string) (model.User, error) {
	var u model.User
	err := r.db.QueryRow(context.Background(),
		"SELECT id, name, email, password_hash, role, status, created_at FROM users WHERE email=$1", email,
	).Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.Status, &u.CreatedAt)
	return u, err
}

func (r *userRepo) ListAll() ([]model.User, error) {
	rows, err := r.db.Query(context.Background(),
		"SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	users := []model.User{}
	for rows.Next() {
		var u model.User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.Status, &u.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

func (r *userRepo) UpdateStatus(id string, status string) error {
	_, err := r.db.Exec(context.Background(),
		"UPDATE users SET status=$1 WHERE id=$2", status, id)
	return err
}