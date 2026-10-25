package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"teftef.com/bid/internal/repository"
)

type BidService struct {
	repo *repository.BidRepository
}

func NewBidService(r *repository.BidRepository) *BidService {
	return &BidService{repo: r}
}

type CreateBidRequest struct {
	JobID        string                 `json:"job_id"`
	Amount       float64                `json:"amount"`
	RateType     string                 `json:"rate_type"`
	HourlyRate   float64                `json:"hourly_rate"`
	CoverLetter  string                 `json:"cover_letter"`
	DeliveryDays int                    `json:"delivery_days"`
	Experience   string                 `json:"experience"`
	Portfolio    []string               `json:"portfolio"`
	Milestones   []repository.Milestone `json:"milestones"`
}

const (
	rateTypeFixed  = "fixed"
	rateTypeHourly = "hourly"

	statusPending    = "pending"
	statusShortlisted = "shortlisted"
	statusAccepted   = "accepted"
	statusRejected   = "rejected"
	statusWithdrawn  = "withdrawn"
)

var (
	ErrJobNotOpen       = errors.New("job is not open for proposals")
	ErrAlreadyProposed  = errors.New("you already have a proposal on this job")
	ErrNotProposalOwner = errors.New("only the freelancer who submitted this proposal can change it")
	ErrNotEditable      = errors.New("this proposal can no longer be edited")
	ErrNotWithdrawable  = errors.New("this proposal can no longer be withdrawn")
	ErrOwnJob           = errors.New("you cannot submit a proposal on your own job")
)

func (s *BidService) CreateBid(ctx context.Context, freelancerID string, req CreateBidRequest) (*repository.Bid, error) {
	if req.JobID == "" {
		return nil, errors.New("job_id is required")
	}

	job, err := s.repo.GetJobInfo(ctx, req.JobID)
	if err != nil {
		return nil, err
	}
	if job == nil {
		return nil, errors.New("job not found")
	}
	if job.UserID == freelancerID {
		return nil, ErrOwnJob
	}
	if job.Status != "open" {
		return nil, ErrJobNotOpen
	}

	existing, err := s.repo.GetActiveByFreelancerAndJob(ctx, req.JobID, freelancerID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, ErrAlreadyProposed
	}

	if err := validateProposal(&req, job.Type); err != nil {
		return nil, err
	}

	bid := &repository.Bid{
		JobID:        req.JobID,
		FreelancerID: freelancerID,
		Amount:       req.Amount,
		RateType:     req.RateType,
		HourlyRate:   req.HourlyRate,
		CoverLetter:  strings.TrimSpace(req.CoverLetter),
		DeliveryDays: req.DeliveryDays,
		Experience:   strings.TrimSpace(req.Experience),
		Portfolio:    cleanPortfolio(req.Portfolio),
		Milestones:   cleanMilestones(req.Milestones),
		Status:       statusPending,
	}
	if err := s.repo.Create(ctx, bid); err != nil {
		return nil, err
	}
	return bid, nil
}

// UpdateBid lets a freelancer revise a proposal while the job is open and the
// proposal has not been decided on yet.
func (s *BidService) UpdateBid(ctx context.Context, bidID int, freelancerID string, req CreateBidRequest) (*repository.Bid, error) {
	bid, job, err := s.loadForOwner(ctx, bidID, freelancerID)
	if err != nil {
		return nil, err
	}
	if bid.Status != statusPending {
		return nil, ErrNotEditable
	}
	if job.Status != "open" {
		return nil, ErrJobNotOpen
	}

	if err := validateProposal(&req, job.Type); err != nil {
		return nil, err
	}

	bid.Amount = req.Amount
	bid.RateType = req.RateType
	bid.HourlyRate = req.HourlyRate
	bid.CoverLetter = strings.TrimSpace(req.CoverLetter)
	bid.DeliveryDays = req.DeliveryDays
	bid.Experience = strings.TrimSpace(req.Experience)
	bid.Portfolio = cleanPortfolio(req.Portfolio)
	bid.Milestones = cleanMilestones(req.Milestones)

	return s.repo.Update(ctx, bidID, bid)
}

// WithdrawBid withdraws a proposal. Withdrawn proposals stay on record but no
// longer count towards the job's proposal total.
func (s *BidService) WithdrawBid(ctx context.Context, bidID int, freelancerID string) (*repository.Bid, error) {
	bid, job, err := s.loadForOwner(ctx, bidID, freelancerID)
	if err != nil {
		return nil, err
	}
	if bid.Status != statusPending && bid.Status != statusShortlisted {
		return nil, ErrNotWithdrawable
	}
	if job.Status != "open" {
		return nil, ErrJobNotOpen
	}
	return s.repo.Withdraw(ctx, bidID)
}

func (s *BidService) GetByJob(ctx context.Context, jobID string) ([]repository.Bid, error) {
	return s.repo.GetByJob(ctx, jobID)
}

// GetJobInfo exposes the job a proposal belongs to so the caller can check
// whether they are allowed to see its proposals.
func (s *BidService) GetJobInfo(ctx context.Context, jobID string) (*repository.JobInfo, error) {
	return s.repo.GetJobInfo(ctx, jobID)
}

func (s *BidService) GetByFreelancer(ctx context.Context, freelancerID string) ([]repository.Bid, error) {
	return s.repo.GetByFreelancer(ctx, freelancerID)
}

func (s *BidService) GetByID(ctx context.Context, id int) (*repository.Bid, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *BidService) ListAll(ctx context.Context) ([]repository.Bid, error) {
	return s.repo.ListAll(ctx)
}

func (s *BidService) ListByEmployer(ctx context.Context, employerID string) ([]repository.Bid, error) {
	return s.repo.ListByEmployer(ctx, employerID)
}

// UpdateStatus is the employer side of a proposal: shortlisting, rejecting or
// accepting. Only the employer who owns the job may decide on its proposals.
func (s *BidService) UpdateStatus(ctx context.Context, id int, status, requesterID, requesterRole string) (*repository.Bid, error) {
	switch status {
	case statusShortlisted, statusRejected, statusAccepted:
	default:
		return nil, errors.New("invalid status")
	}

	bid, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if bid == nil {
		return nil, errors.New("bid not found")
	}

	job, err := s.repo.GetJobInfo(ctx, bid.JobID)
	if err != nil {
		return nil, err
	}
	if job == nil {
		return nil, errors.New("job not found")
	}
	if job.UserID != requesterID && requesterRole != "admin" {
		return nil, errors.New("only the employer who posted this job can review its proposals")
	}

result, err := s.repo.UpdateStatus(ctx, id, status)
	if err != nil {
		return nil, err
	}
	if status == statusAccepted {
		_ = s.repo.CloseJob(ctx, bid.JobID)
	}
	return result, nil
}

func (s *BidService) loadForOwner(ctx context.Context, bidID int, freelancerID string) (*repository.Bid, *repository.JobInfo, error) {
	bid, err := s.repo.GetByID(ctx, bidID)
	if err != nil {
		return nil, nil, err
	}
	if bid == nil {
		return nil, nil, errors.New("bid not found")
	}
	if bid.FreelancerID != freelancerID {
		return nil, nil, ErrNotProposalOwner
	}
	job, err := s.repo.GetJobInfo(ctx, bid.JobID)
	if err != nil {
		return nil, nil, err
	}
	if job == nil {
		return nil, nil, errors.New("job not found")
	}
	return bid, job, nil
}

func validateProposal(req *CreateBidRequest, jobType string) error {
	if req.RateType == "" {
		req.RateType = rateTypeFixed
	}
	if req.RateType != rateTypeFixed && req.RateType != rateTypeHourly {
		return errors.New("rate_type must be either fixed or hourly")
	}

	if req.RateType == rateTypeFixed {
		if req.Amount <= 0 {
			return errors.New("amount must be greater than 0")
		}
		if req.HourlyRate > 0 {
			return errors.New("hourly_rate cannot be set on a fixed price proposal")
		}
	} else {
		if req.HourlyRate <= 0 {
			return errors.New("hourly_rate must be greater than 0")
		}
		if req.Amount < 0 {
			return errors.New("amount cannot be negative")
		}
	}

	if strings.TrimSpace(req.CoverLetter) == "" {
		return errors.New("cover_letter is required")
	}
	if len(req.CoverLetter) > 5000 {
		return errors.New("cover_letter must be 5000 characters or fewer")
	}
	if req.DeliveryDays <= 0 {
		return errors.New("delivery_days must be greater than 0")
	}
	if len(req.Experience) > 5000 {
		return errors.New("experience must be 5000 characters or fewer")
	}

	if len(req.Portfolio) > 10 {
		return errors.New("portfolio may contain at most 10 links")
	}
	for _, link := range req.Portfolio {
		link = strings.TrimSpace(link)
		if link == "" {
			continue
		}
		if !strings.HasPrefix(link, "http://") && !strings.HasPrefix(link, "https://") {
			return errors.New("portfolio links must start with http:// or https://")
		}
	}

	if len(req.Milestones) > 0 {
		if jobType != rateTypeFixed {
			return errors.New("milestones are only available for fixed price projects")
		}
		if len(req.Milestones) > 20 {
			return errors.New("a proposal may contain at most 20 milestones")
		}
		total := 0.0
		for _, m := range req.Milestones {
			if strings.TrimSpace(m.Title) == "" {
				return errors.New("every milestone needs a title")
			}
			if m.Amount <= 0 {
				return errors.New("every milestone needs an amount greater than 0")
			}
			if m.DueInDays < 0 {
				return errors.New("milestone due_in_days cannot be negative")
			}
			total += m.Amount
		}
		if req.RateType == rateTypeFixed && total > req.Amount {
			return fmt.Errorf("milestone amounts total %g, which is more than the proposed price of %g", total, req.Amount)
		}
	}

	return nil
}

func cleanPortfolio(links []string) []string {
	cleaned := []string{}
	for _, link := range links {
		link = strings.TrimSpace(link)
		if link != "" {
			cleaned = append(cleaned, link)
		}
	}
	return cleaned
}

func cleanMilestones(milestones []repository.Milestone) []repository.Milestone {
	cleaned := []repository.Milestone{}
	for _, m := range milestones {
		m.Title = strings.TrimSpace(m.Title)
		m.Description = strings.TrimSpace(m.Description)
		if m.Title == "" {
			continue
		}
		cleaned = append(cleaned, m)
	}
	return cleaned
}
