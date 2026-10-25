package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"teftef/job/internal/repository"

	"github.com/google/uuid"
)

type JobService struct {
	repo     *repository.JobRepository
	employer *repository.EmployerRepository
}

func NewJobService(r *repository.JobRepository, e *repository.EmployerRepository) *JobService {
	return &JobService{repo: r, employer: e}
}

type CreateJobRequest struct {
	Title              string  `json:"title"`
	Description        string  `json:"description"`
	Requirements       string  `json:"requirements"`
	Skills             string  `json:"skills"`
	Budget             float64 `json:"budget"`
	Type               string  `json:"type"`
	DeliveryDays       int     `json:"delivery_days"`
	ProposalsDisclosed *bool   `json:"proposals_disclosed"`
}

type ReportJobRequest struct {
	Reason  string `json:"reason"`
	Details string `json:"details"`
}

var reportReasons = map[string]bool{
	"spam":            true,
	"scam":            true,
	"inappropriate":   true,
	"duplicate":       true,
	"misleading":      true,
	"offensive":       true,
	"other":           true,
}

func (s *JobService) CreateJob(ctx context.Context, userID string, req CreateJobRequest) (*repository.Job, error) {
	if req.Title == "" {
		return nil, errors.New("title is required")
	}
	if req.Type == "" {
		req.Type = "fixed"
	}
	if req.Type != "fixed" && req.Type != "hourly" {
		return nil, errors.New("type must be either fixed or hourly")
	}
	if req.Budget < 0 {
		return nil, errors.New("budget cannot be negative")
	}
	if req.DeliveryDays < 0 {
		return nil, errors.New("delivery_days cannot be negative")
	}
	disclosed := true
	if req.ProposalsDisclosed != nil {
		disclosed = *req.ProposalsDisclosed
	}
	job := &repository.Job{
		ID:                 uuid.New().String(),
		UserID:             userID,
		Title:              req.Title,
		Description:        req.Description,
		Requirements:       req.Requirements,
		Skills:             req.Skills,
		Budget:             req.Budget,
		Type:               req.Type,
		DeliveryDays:       req.DeliveryDays,
		Status:             "open",
		ProposalsDisclosed: disclosed,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}
	if err := s.repo.Create(ctx, job); err != nil {
		return nil, err
	}
	return job, nil
}

func (s *JobService) ListByUser(ctx context.Context, userID string) ([]repository.Job, error) {
	return s.repo.ListByUser(ctx, userID)
}

func (s *JobService) ListAll(ctx context.Context, status string) ([]repository.Job, error) {
	return s.repo.ListAll(ctx, status)
}

// GetDetail assembles the job detail view: the job itself, the employer profile
// with verification status, the proposal count (when the employer has not
// disclosed it) and whether the viewer has saved the job.
func (s *JobService) GetDetail(ctx context.Context, jobID, viewerID string) (*repository.JobDetail, error) {
	job, err := s.repo.GetByID(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if job == nil {
		return nil, nil
	}

	detail := &repository.JobDetail{Job: *job}

	if viewerID != "" {
		saved, err := s.repo.IsSaved(ctx, viewerID, jobID)
		if err != nil {
			return nil, err
		}
		detail.IsSaved = saved
	}

	if job.ProposalsDisclosed {
		count, err := s.repo.CountProposals(ctx, jobID)
		if err != nil {
			return nil, err
		}
		detail.ProposalCount = count
	}

	employer, err := s.employer.GetByID(ctx, job.UserID)
	if err != nil {
		return nil, err
	}
	detail.Employer = employer

	return detail, nil
}

func (s *JobService) CloseJob(ctx context.Context, jobID, userID string) (*repository.Job, error) {
	job, err := s.repo.GetByID(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if job == nil {
		return nil, errors.New("job not found")
	}
	if job.UserID != userID {
		return nil, errors.New("unauthorized")
	}
	if err := s.repo.UpdateStatus(ctx, jobID, "closed"); err != nil {
		return nil, err
	}
	job.Status = "closed"
	return job, nil
}

func (s *JobService) SaveJob(ctx context.Context, userID, jobID string) (bool, error) {
	job, err := s.repo.GetByID(ctx, jobID)
	if err != nil {
		return false, err
	}
	if job == nil {
		return false, errors.New("job not found")
	}
	if job.UserID == userID {
		return false, errors.New("you cannot save your own job")
	}
	if err := s.repo.SaveJob(ctx, userID, jobID); err != nil {
		return false, err
	}
	return true, nil
}

func (s *JobService) UnsaveJob(ctx context.Context, userID, jobID string) error {
	return s.repo.UnsaveJob(ctx, userID, jobID)
}

func (s *JobService) ListSavedJobs(ctx context.Context, userID string) ([]repository.SavedJob, error) {
	return s.repo.ListSavedJobs(ctx, userID)
}

func (s *JobService) ReportJob(ctx context.Context, jobID, reporterID string, req ReportJobRequest) error {
	job, err := s.repo.GetByID(ctx, jobID)
	if err != nil {
		return err
	}
	if job == nil {
		return errors.New("job not found")
	}
	if job.UserID == reporterID {
		return errors.New("you cannot report your own job")
	}
	reason := strings.ToLower(strings.TrimSpace(req.Reason))
	if reason == "" {
		return errors.New("reason is required")
	}
	if !reportReasons[reason] {
		return errors.New("invalid report reason")
	}
	if len(req.Details) > 2000 {
		return errors.New("details must be 2000 characters or fewer")
	}
	return s.repo.CreateReport(ctx, jobID, reporterID, reason, req.Details)
}

func (s *JobService) GetEmployer(ctx context.Context, userID string) (*repository.Employer, error) {
	return s.employer.GetByID(ctx, userID)
}

func (s *JobService) UpdateEmployerProfile(ctx context.Context, userID string, req repository.UpdateEmployerRequest) (*repository.Employer, error) {
	employer, err := s.employer.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if employer == nil {
		return nil, errors.New("user not found")
	}
	if len(req.CompanyName) > 255 || len(req.Headline) > 255 || len(req.Country) > 100 {
		return nil, errors.New("field too long")
	}
	if len(req.Bio) > 2000 {
		return nil, errors.New("bio must be 2000 characters or fewer")
	}
	return s.employer.UpdateProfile(ctx, userID, req)
}

func (s *JobService) UpdateVerification(ctx context.Context, userID, status string) error {
	switch status {
	case "unverified", "pending", "verified", "rejected":
	default:
		return errors.New("invalid verification status")
	}
	employer, err := s.employer.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	if employer == nil {
		return errors.New("user not found")
	}
	return s.employer.UpdateVerification(ctx, userID, status)
}
