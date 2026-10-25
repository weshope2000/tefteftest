package service

import (
	"errors"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"teftef.com/auth/internal/model"
	"teftef.com/auth/internal/repository"
	jwtutil "teftef.com/pkg/jwt"
)

var ErrEmailExists = errors.New("email already exists")

type AuthService struct {
	repo repository.UserRepository
}

func NewAuthService(repo repository.UserRepository) *AuthService {
	return &AuthService{repo: repo}
}

func (s *AuthService) Register(email, password, role, name string) error {
	_, err := s.repo.GetByEmail(email)
	if err == nil {
		return ErrEmailExists
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user := model.User{
		ID:           uuid.New().String(),
		Name:         name,
		Email:        email,
		PasswordHash: string(hashed),
		Role:         role,
	}
	return s.repo.Create(user)
}

func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return "", err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", errors.New("invalid credentials")
	}
	token, err := jwtutil.Generate(user.ID, user.Role, user.Name)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *AuthService) ListUsers() ([]model.User, error) {
	return s.repo.ListAll()
}

func (s *AuthService) UpdateUserStatus(id string, status string) error {
	return s.repo.UpdateStatus(id, status)
}