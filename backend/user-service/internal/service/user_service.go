package service

import (
	"teftef.com/user/internal/model"
	"teftef.com/user/internal/repository"
)

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(r repository.UserRepository) *UserService {
	return &UserService{repo: r}
}

func (s *UserService) CreateProfile(p model.Profile) error {
	return s.repo.CreateProfile(p)
}

func (s *UserService) GetProfile(userID string) (model.Profile, error) {
	return s.repo.GetProfile(userID)
}

func (s *UserService) UpdateProfile(p model.Profile) error {
	return s.repo.UpdateProfile(p)
}

func (s *UserService) AddSkill(skill model.Skill) error {
	return s.repo.AddSkill(skill)
}

func (s *UserService) ListSkills(userID string) ([]model.Skill, error) {
	return s.repo.ListSkills(userID)
}

func (s *UserService) AddPortfolio(p model.Portfolio) error {
	return s.repo.AddPortfolio(p)
}

func (s *UserService) ListPortfolio(userID string) ([]model.Portfolio, error) {
	return s.repo.ListPortfolio(userID)
}

func (s *UserService) ListProfiles() ([]model.Profile, error) {
	return s.repo.ListProfiles()
}
