package model

import "time"

type Profile struct {
	ID                 string    `json:"id"`
	UserID             string    `json:"user_id"`
	FullName           string    `json:"full_name"`
	ProfessionalTitle  string    `json:"professional_title"`
	PhotoURL           string    `json:"photo_url"`
	Location           string    `json:"location"`
	Bio                string    `json:"bio"`
	Experience         string    `json:"experience"`
	Education          string    `json:"education"`
	Certifications     string    `json:"certifications"`
	HourlyRate         float64   `json:"hourly_rate"`
	MonthlyRate        float64   `json:"monthly_rate"`
	FixedPrice         bool      `json:"fixed_price"`
	WeeklyCapacity     string    `json:"weekly_capacity"`
	StartDate          string    `json:"start_date"`
	Availability       string    `json:"availability"`
	VerificationStatus string    `json:"verification_status"`
	Languages          string    `json:"languages"`
	CreatedAt          time.Time `json:"created_at"`
}