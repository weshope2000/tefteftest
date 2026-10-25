package repository

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BidRepository struct {
	db *pgxpool.Pool
}

func NewBidRepository(db *pgxpool.Pool) *BidRepository {
	return &BidRepository{db: db}
}

const bidColumns = `b.id, b.job_id, b.freelancer_id, b.amount, b.rate_type, b.hourly_rate, b.cover_letter, b.delivery_days, b.experience, b.portfolio, b.milestones, b.status, b.created_at, b.updated_at, b.withdrawn_at, u.name, j.title, j.user_id`
const bidFrom = ` FROM bids b LEFT JOIN users u ON u.id = b.freelancer_id LEFT JOIN jobs j ON j.id = b.job_id`

func scanBid(rows pgx.Rows) (Bid, error) {
	var b Bid
	var portfolioJSON, milestonesJSON []byte
	var userName, jobTitle, jobUserID *string
	err := rows.Scan(
		&b.ID, &b.JobID, &b.FreelancerID, &b.Amount, &b.RateType, &b.HourlyRate,
		&b.CoverLetter, &b.DeliveryDays, &b.Experience, &portfolioJSON, &milestonesJSON,
		&b.Status, &b.CreatedAt, &b.UpdatedAt, &b.WithdrawnAt, &userName, &jobTitle, &jobUserID,
	)
	if err != nil {
		return b, err
	}
	if userName != nil {
		b.FreelancerName = *userName
	}
	if jobTitle != nil {
		b.JobTitle = *jobTitle
	}
	if len(portfolioJSON) > 0 {
		json.Unmarshal(portfolioJSON, &b.Portfolio)
	}
	if len(milestonesJSON) > 0 {
		json.Unmarshal(milestonesJSON, &b.Milestones)
	}
	return b, nil
}

func (r *BidRepository) GetByJob(ctx context.Context, jobID string) ([]Bid, error) {
	rows, err := r.db.Query(ctx, `SELECT `+bidColumns+bidFrom+` WHERE b.job_id = $1 ORDER BY b.created_at DESC`, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	bids := []Bid{}
	for rows.Next() {
		b, err := scanBid(rows)
		if err != nil {
			return nil, err
		}
		bids = append(bids, b)
	}
	return bids, rows.Err()
}

func (r *BidRepository) GetByFreelancer(ctx context.Context, freelancerID string) ([]Bid, error) {
	rows, err := r.db.Query(ctx, `SELECT `+bidColumns+bidFrom+` WHERE b.freelancer_id = $1 ORDER BY b.created_at DESC`, freelancerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	bids := []Bid{}
	for rows.Next() {
		b, err := scanBid(rows)
		if err != nil {
			return nil, err
		}
		bids = append(bids, b)
	}
	return bids, rows.Err()
}

func (r *BidRepository) GetByID(ctx context.Context, id int) (*Bid, error) {
	row := r.db.QueryRow(ctx, `SELECT `+bidColumns+bidFrom+` WHERE b.id = $1`, id)
	b, err := scanBidRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &b, nil
}

func scanBidRow(row pgx.Row) (Bid, error) {
	var b Bid
	var portfolioJSON, milestonesJSON []byte
	var userName, jobTitle, jobUserID *string
	err := row.Scan(
		&b.ID, &b.JobID, &b.FreelancerID, &b.Amount, &b.RateType, &b.HourlyRate,
		&b.CoverLetter, &b.DeliveryDays, &b.Experience, &portfolioJSON, &milestonesJSON,
		&b.Status, &b.CreatedAt, &b.UpdatedAt, &b.WithdrawnAt, &userName, &jobTitle, &jobUserID,
	)
	if err != nil {
		return b, err
	}
	if userName != nil {
		b.FreelancerName = *userName
	}
	if jobTitle != nil {
		b.JobTitle = *jobTitle
	}
	if len(portfolioJSON) > 0 {
		json.Unmarshal(portfolioJSON, &b.Portfolio)
	}
	if len(milestonesJSON) > 0 {
		json.Unmarshal(milestonesJSON, &b.Milestones)
	}
	return b, nil
}

func (r *BidRepository) GetJobInfo(ctx context.Context, jobID string) (*JobInfo, error) {
	var info JobInfo
	err := r.db.QueryRow(ctx, `SELECT id, user_id, type, status FROM jobs WHERE id = $1`, jobID).Scan(&info.ID, &info.UserID, &info.Type, &info.Status)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &info, nil
}

func (r *BidRepository) GetActiveByFreelancerAndJob(ctx context.Context, jobID, freelancerID string) (*Bid, error) {
	row := r.db.QueryRow(ctx, `SELECT `+bidColumns+bidFrom+` WHERE b.job_id = $1 AND b.freelancer_id = $2 AND b.status != 'withdrawn'`, jobID, freelancerID)
	b, err := scanBidRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &b, nil
}

func (r *BidRepository) Create(ctx context.Context, bid *Bid) error {
	_, err := r.db.Exec(ctx, `INSERT INTO bids (job_id, freelancer_id, amount, rate_type, hourly_rate, cover_letter, delivery_days, experience, portfolio, milestones, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
		bid.JobID, bid.FreelancerID, bid.Amount, bid.RateType, bid.HourlyRate, bid.CoverLetter, bid.DeliveryDays, bid.Experience, bid.Portfolio, bid.Milestones, "pending")
	return err
}

func (r *BidRepository) Update(ctx context.Context, id int, bid *Bid) (*Bid, error) {
	_, err := r.db.Exec(ctx, `UPDATE bids SET amount=$1, rate_type=$2, hourly_rate=$3, cover_letter=$4, delivery_days=$5, experience=$6, portfolio=$7, milestones=$8, updated_at=$9 WHERE id=$10`,
		bid.Amount, bid.RateType, bid.HourlyRate, bid.CoverLetter, bid.DeliveryDays, bid.Experience, bid.Portfolio, bid.Milestones, time.Now(), id)
	if err != nil {
		return nil, err
	}
	return r.GetByID(ctx, id)
}

func (r *BidRepository) Withdraw(ctx context.Context, id int) (*Bid, error) {
	_, err := r.db.Exec(ctx, `UPDATE bids SET status='withdrawn', withdrawn_at=$1 WHERE id=$2`, time.Now(), id)
	if err != nil {
		return nil, err
	}
	return r.GetByID(ctx, id)
}

func (r *BidRepository) UpdateStatus(ctx context.Context, id int, status string) (*Bid, error) {
	_, err := r.db.Exec(ctx, `UPDATE bids SET status=$1, updated_at=$2 WHERE id=$3`, status, time.Now(), id)
	if err != nil {
		return nil, err
	}
	return r.GetByID(ctx, id)
}

func (r *BidRepository) ListAll(ctx context.Context) ([]Bid, error) {
	rows, err := r.db.Query(ctx, `SELECT `+bidColumns+bidFrom+` ORDER BY b.created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	bids := []Bid{}
	for rows.Next() {
		b, err := scanBid(rows)
		if err != nil {
			return nil, err
		}
		bids = append(bids, b)
	}
	return bids, rows.Err()
}

func (r *BidRepository) CloseJob(ctx context.Context, jobID string) error {
	_, err := r.db.Exec(ctx, `UPDATE jobs SET status='closed', updated_at=$1 WHERE id=$2`, time.Now(), jobID)
	return err
}

func (r *BidRepository) ListByEmployer(ctx context.Context, employerID string) ([]Bid, error) {
	rows, err := r.db.Query(ctx, `SELECT `+bidColumns+bidFrom+` WHERE j.user_id = $1 ORDER BY b.created_at DESC`, employerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	bids := []Bid{}
	for rows.Next() {
		b, err := scanBid(rows)
		if err != nil {
			return nil, err
		}
		bids = append(bids, b)
	}
	return bids, rows.Err()
}