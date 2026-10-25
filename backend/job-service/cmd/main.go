package main

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"teftef/job/internal/repository"
	"teftef/job/internal/service"
	jwtutil "teftef.com/pkg/jwt"
)

func migrate(db *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS jobs (
			id UUID PRIMARY KEY,
			user_id UUID NOT NULL,
			title VARCHAR(255) NOT NULL,
			description TEXT NOT NULL,
			skills VARCHAR(512),
			budget DOUBLE PRECISION DEFAULT 0,
			type VARCHAR(20) DEFAULT 'fixed',
			status VARCHAR(20) DEFAULT 'open',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return err
	}

	_, err = db.Exec(ctx, `
		ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements TEXT NOT NULL DEFAULT '';
		ALTER TABLE jobs ADD COLUMN IF NOT EXISTS delivery_days INT NOT NULL DEFAULT 0;
		ALTER TABLE jobs ADD COLUMN IF NOT EXISTS proposals_disclosed BOOLEAN NOT NULL DEFAULT TRUE;
	`)
	if err != nil {
		return err
	}

	_, err = db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS saved_jobs (
			id SERIAL PRIMARY KEY,
			user_id UUID NOT NULL,
			job_id UUID NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (user_id, job_id)
		);
	`)
	if err != nil {
		return err
	}

	_, err = db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS job_reports (
			id SERIAL PRIMARY KEY,
			job_id UUID NOT NULL,
			reporter_id UUID NOT NULL,
			reason VARCHAR(100) NOT NULL,
			details TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return err
	}

	_, err = db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS employer_profiles (
			user_id UUID PRIMARY KEY,
			company_name VARCHAR(255) NOT NULL DEFAULT '',
			headline VARCHAR(255) NOT NULL DEFAULT '',
			bio TEXT NOT NULL DEFAULT '',
			country VARCHAR(100) NOT NULL DEFAULT '',
			total_spent DOUBLE PRECISION NOT NULL DEFAULT 0,
			total_hired INT NOT NULL DEFAULT 0,
			avg_rating DOUBLE PRECISION NOT NULL DEFAULT 0,
			verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified',
			verified_at TIMESTAMP,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`)
	return err
}

func main() {
	app := fiber.New()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")
	}
	db, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := migrate(db); err != nil {
		log.Fatal("Failed to migrate:", err)
	}

	repo := repository.NewJobRepository(db)
	employerRepo := repository.NewEmployerRepository(db)
	svc := service.NewJobService(repo, employerRepo)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"service": "job", "status": "ok"})
	})

	app.Post("/jobs", createJobHandler(svc))
	app.Get("/jobs", listJobsHandler(svc))
	app.Get("/jobs/saved", listSavedJobsHandler(svc))
	app.Get("/jobs/:id", getJobHandler(svc))
	app.Put("/jobs/:id/close", closeJobHandler(svc))
	app.Post("/jobs/:id/save", saveJobHandler(svc))
	app.Delete("/jobs/:id/save", unsaveJobHandler(svc))
	app.Post("/jobs/:id/report", reportJobHandler(svc))

	app.Get("/employers/:id", getEmployerHandler(svc))
	app.Put("/employers/:id", updateEmployerHandler(svc))
	app.Put("/employers/:id/verification", updateVerificationHandler(svc))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8001"
	}
	log.Printf("Job service running on :%s", port)
	log.Fatal(app.Listen(":" + port))
}

func getUserID(c *fiber.Ctx) (string, error) {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return "", fiber.ErrUnauthorized
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwtutil.Validate(tokenStr)
	if err != nil {
		return "", fiber.ErrUnauthorized
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", fiber.ErrUnauthorized
	}
	userID, ok := claims["id"].(string)
	if !ok {
		return "", fiber.ErrUnauthorized
	}
	return userID, nil
}

// optionalUserID resolves the viewer when a token is supplied but never rejects
// the request, so public job listings stay readable while signed-in viewers get
// their saved-job state.
func optionalUserID(c *fiber.Ctx) string {
	userID, err := getUserID(c)
	if err != nil {
		return ""
	}
	return userID
}

func getRole(c *fiber.Ctx) string {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return ""
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwtutil.Validate(tokenStr)
	if err != nil {
		return ""
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return ""
	}
	role, _ := claims["role"].(string)
	return role
}

func createJobHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Write auth header to file for debugging
		os.WriteFile("D:\\debug_auth.txt", []byte(c.Get("Authorization")), 0644)
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		var req service.CreateJobRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		job, err := svc.CreateJob(c.Context(), userID, req)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(201).JSON(job)
	}
}

func listJobsHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := optionalUserID(c)
		var jobs []repository.Job
		var err error
		role := getRole(c)
		if role == "freelancer" {
			jobs, err = svc.ListAll(c.Context(), "open")
		} else if role == "admin" {
			jobs, err = svc.ListAll(c.Context(), "")
		} else if userID != "" {
			jobs, err = svc.ListByUser(c.Context(), userID)
		} else {
			jobs, err = svc.ListAll(c.Context(), "open")
		}
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		status := c.Query("status")
		if status != "" {
			var filtered []repository.Job
			for _, j := range jobs {
				if j.Status == status {
					filtered = append(filtered, j)
				}
			}
			jobs = filtered
		}
		if jobs == nil {
			jobs = []repository.Job{}
		}
		return c.JSON(jobs)
	}
}

func getJobHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		detail, err := svc.GetDetail(c.Context(), id, optionalUserID(c))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		if detail == nil {
			return c.Status(404).JSON(fiber.Map{"error": "not found"})
		}
		return c.JSON(detail)
	}
}

func closeJobHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		id := c.Params("id")
		job, err := svc.CloseJob(c.Context(), id, userID)
		if err != nil {
			return c.Status(403).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(job)
	}
}

func saveJobHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		if _, err := svc.SaveJob(c.Context(), userID, c.Params("id")); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(fiber.Map{"saved": true})
	}
}

func unsaveJobHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		if err := svc.UnsaveJob(c.Context(), userID, c.Params("id")); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(fiber.Map{"saved": false})
	}
}

func listSavedJobsHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		saved, err := svc.ListSavedJobs(c.Context(), userID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		return c.JSON(saved)
	}
}

func reportJobHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		var req service.ReportJobRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		if err := svc.ReportJob(c.Context(), c.Params("id"), userID, req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(201).JSON(fiber.Map{"message": "Report submitted"})
	}
}

func getEmployerHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		employer, err := svc.GetEmployer(c.Context(), c.Params("id"))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		if employer == nil {
			return c.Status(404).JSON(fiber.Map{"error": "not found"})
		}
		return c.JSON(employer)
	}
}

func updateEmployerHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		if userID != c.Params("id") {
			return c.Status(403).JSON(fiber.Map{"error": "unauthorized"})
		}
		var req repository.UpdateEmployerRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		employer, err := svc.UpdateEmployerProfile(c.Context(), userID, req)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(employer)
	}
}

func updateVerificationHandler(svc *service.JobService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if _, err := getUserID(c); err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		if getRole(c) != "admin" {
			return c.Status(403).JSON(fiber.Map{"error": "only administrators can change verification status"})
		}
		var body struct {
			Status string `json:"status"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		if err := svc.UpdateVerification(c.Context(), c.Params("id"), body.Status); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(fiber.Map{"message": "Verification status updated"})
	}
}
