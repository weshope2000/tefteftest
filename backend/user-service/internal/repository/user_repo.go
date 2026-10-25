package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"teftef.com/user/internal/model"
)

type UserRepository interface {
	CreateProfile(model.Profile) error
	GetProfile(string) (model.Profile, error)
	UpdateProfile(model.Profile) error
	AddSkill(model.Skill) error
	ListSkills(string) ([]model.Skill, error)
	AddPortfolio(model.Portfolio) error
	ListPortfolio(string) ([]model.Portfolio, error)
	ListProfiles() ([]model.Profile, error)
}

type userRepo struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *userRepo {
	return &userRepo{db: db}
}

func (r *userRepo) CreateProfile(profile model.Profile) error {
	profile.ID = uuid.New().String()
	profile.CreatedAt = time.Now()
	_, err := r.db.Exec(context.Background(),
		"INSERT INTO profiles (id,user_id,full_name,professional_title,photo_url,location,bio,experience,education,certifications,hourly_rate,monthly_rate,fixed_price,weekly_capacity,start_date,availability,verification_status,languages,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)",
		profile.ID, profile.UserID, profile.FullName, profile.ProfessionalTitle, profile.PhotoURL, profile.Location, profile.Bio, profile.Experience, profile.Education, profile.Certifications, profile.HourlyRate, profile.MonthlyRate, profile.FixedPrice, profile.WeeklyCapacity, profile.StartDate, profile.Availability, profile.VerificationStatus, profile.Languages, profile.CreatedAt)
	return err
}

func (r *userRepo) GetProfile(userID string) (model.Profile, error) {
	var p model.Profile
	err := r.db.QueryRow(context.Background(),
		"SELECT id,user_id,full_name,professional_title,photo_url,location,bio,experience,education,certifications,hourly_rate,monthly_rate,fixed_price,weekly_capacity,start_date,availability,verification_status,languages,created_at FROM profiles WHERE user_id=$1", userID).
		Scan(&p.ID, &p.UserID, &p.FullName, &p.ProfessionalTitle, &p.PhotoURL, &p.Location, &p.Bio, &p.Experience, &p.Education, &p.Certifications, &p.HourlyRate, &p.MonthlyRate, &p.FixedPrice, &p.WeeklyCapacity, &p.StartDate, &p.Availability, &p.VerificationStatus, &p.Languages, &p.CreatedAt)
	return p, err
}

func (r *userRepo) UpdateProfile(profile model.Profile) error {
	_, err := r.db.Exec(context.Background(),
		"INSERT INTO profiles (id,user_id,full_name,professional_title,photo_url,location,bio,experience,education,certifications,hourly_rate,monthly_rate,fixed_price,weekly_capacity,start_date,availability,verification_status,languages) VALUES (gen_random_uuid(),$17,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT (user_id) DO UPDATE SET full_name=$1,professional_title=$2,photo_url=$3,location=$4,bio=$5,experience=$6,education=$7,certifications=$8,hourly_rate=$9,monthly_rate=$10,fixed_price=$11,weekly_capacity=$12,start_date=$13,availability=$14,verification_status=$15,languages=$16",
		profile.FullName, profile.ProfessionalTitle, profile.PhotoURL, profile.Location, profile.Bio, profile.Experience, profile.Education, profile.Certifications, profile.HourlyRate, profile.MonthlyRate, profile.FixedPrice, profile.WeeklyCapacity, profile.StartDate, profile.Availability, profile.VerificationStatus, profile.Languages, profile.UserID)
	return err
}

func (r *userRepo) AddSkill(skill model.Skill) error {
	skill.ID = uuid.New().String()
	_, err := r.db.Exec(context.Background(),
		"INSERT INTO skills (id,user_id,skill_name) VALUES ($1,$2,$3)",
		skill.ID, skill.UserID, skill.Name)
	return err
}

func (r *userRepo) ListSkills(userID string) ([]model.Skill, error) {
	rows, err := r.db.Query(context.Background(), "SELECT id,user_id,skill_name,created_at FROM skills WHERE user_id=$1", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var skills []model.Skill
	for rows.Next() {
		var s model.Skill
		rows.Scan(&s.ID, &s.UserID, &s.Name, &s.CreatedAt)
		skills = append(skills, s)
	}
	return skills, nil
}

func (r *userRepo) AddPortfolio(p model.Portfolio) error {
	p.ID = uuid.New().String()
	_, err := r.db.Exec(context.Background(),
		"INSERT INTO portfolios (id,user_id,title,description,file_url) VALUES ($1,$2,$3,$4,$5)",
		p.ID, p.UserID, p.Title, p.Description, p.FileURL)
	return err
}

func (r *userRepo) ListPortfolio(userID string) ([]model.Portfolio, error) {
	rows, err := r.db.Query(context.Background(), "SELECT id,user_id,title,description,file_url,created_at FROM portfolios WHERE user_id=$1", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var portfolio []model.Portfolio
	for rows.Next() {
		var p model.Portfolio
		rows.Scan(&p.ID, &p.UserID, &p.Title, &p.Description, &p.FileURL, &p.CreatedAt)
		portfolio = append(portfolio, p)
	}
	return portfolio, nil
}

func (r *userRepo) ListProfiles() ([]model.Profile, error) {
	rows, err := r.db.Query(context.Background(), "SELECT id,user_id,full_name,professional_title,photo_url,location,bio,experience,education,certifications,hourly_rate,monthly_rate,fixed_price,weekly_capacity,start_date,availability,verification_status,languages,created_at FROM profiles ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var profiles []model.Profile
	for rows.Next() {
		var p model.Profile
		if err := rows.Scan(&p.ID, &p.UserID, &p.FullName, &p.ProfessionalTitle, &p.PhotoURL, &p.Location, &p.Bio, &p.Experience, &p.Education, &p.Certifications, &p.HourlyRate, &p.MonthlyRate, &p.FixedPrice, &p.WeeklyCapacity, &p.StartDate, &p.Availability, &p.VerificationStatus, &p.Languages, &p.CreatedAt); err != nil {
			continue
		}
		profiles = append(profiles, p)
	}
	if profiles == nil {
		profiles = []model.Profile{}
	}
	return profiles, nil
}