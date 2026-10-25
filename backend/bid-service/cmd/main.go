package main

import (
	"context"
	"errors"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"teftef.com/bid/internal/repository"
	"teftef.com/bid/internal/service"
	jwtutil "teftef.com/pkg/jwt"
)

func migrate(db *pgxpool.Pool) error {
	ctx := context.Background()

	_, err := db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS bids (
			id SERIAL PRIMARY KEY,
			job_id UUID NOT NULL,
			freelancer_id UUID NOT NULL,
			amount DOUBLE PRECISION DEFAULT 0,
			cover_letter TEXT,
			delivery_days INT DEFAULT 0,
			status VARCHAR(20) DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return err
	}

	_, err = db.Exec(ctx, `
		ALTER TABLE bids ADD COLUMN IF NOT EXISTS rate_type VARCHAR(20) NOT NULL DEFAULT 'fixed';
		ALTER TABLE bids ADD COLUMN IF NOT EXISTS hourly_rate DOUBLE PRECISION NOT NULL DEFAULT 0;
		ALTER TABLE bids ADD COLUMN IF NOT EXISTS experience TEXT NOT NULL DEFAULT '';
		ALTER TABLE bids ADD COLUMN IF NOT EXISTS portfolio JSONB NOT NULL DEFAULT '[]'::jsonb;
		ALTER TABLE bids ADD COLUMN IF NOT EXISTS milestones JSONB NOT NULL DEFAULT '[]'::jsonb;
		ALTER TABLE bids ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMP;
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

	repo := repository.NewBidRepository(db)
	svc := service.NewBidService(repo)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"service": "bid", "status": "ok"})
	})

	app.Post("/bids", createBidHandler(svc))
	app.Get("/bids", listBidsHandler(svc))
	app.Get("/bids/:id", getBidHandler(svc))
	app.Put("/bids/:id", updateBidHandler(svc))
	app.Put("/bids/:id/withdraw", withdrawBidHandler(svc))
	app.Put("/bids/:id/shortlist", shortlistBidHandler(svc))
	app.Put("/bids/:id/reject", rejectBidHandler(svc))
	app.Put("/bids/:id/accept", acceptBidHandler(svc))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8002"
	}
	log.Printf("Bid service running on :%s", port)
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

// bidID parses the bid identifier and rejects malformed values.
func bidID(c *fiber.Ctx) (int, error) {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return 0, errors.New("invalid bid id")
	}
	return id, nil
}

func createBidHandler(svc *service.BidService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		freelancerID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		var req service.CreateBidRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		bid, err := svc.CreateBid(c.Context(), freelancerID, req)
		if err != nil {
			return statusForError(c, err)
		}
		return c.Status(201).JSON(bid)
	}
}

func listBidsHandler(svc *service.BidService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		role := getRole(c)
		jobID := c.Query("job_id")
		status := c.Query("status")
		var bids []repository.Bid
		if jobID != "" {
			if role == "freelancer" {
				// A freelancer only ever sees their own proposal on a job.
				all, err := svc.GetByJob(c.Context(), jobID)
				if err != nil {
					return c.Status(500).JSON(fiber.Map{"error": "db error"})
				}
				bids = []repository.Bid{}
				for _, b := range all {
					if b.FreelancerID == userID {
						bids = append(bids, b)
					}
				}
			} else {
				// The proposals on a job are only visible to the employer who posted it.
				job, err := svc.GetJobInfo(c.Context(), jobID)
				if err != nil {
					return c.Status(500).JSON(fiber.Map{"error": "db error"})
				}
				if job == nil {
					return c.Status(404).JSON(fiber.Map{"error": "job not found"})
				}
				if job.UserID != userID && role != "admin" {
					return c.Status(403).JSON(fiber.Map{"error": "only the employer who posted this job can see its proposals"})
				}
				bids, err = svc.GetByJob(c.Context(), jobID)
				if err != nil {
					return c.Status(500).JSON(fiber.Map{"error": "db error"})
				}
			}
		} else if role == "freelancer" {
			bids, err = svc.GetByFreelancer(c.Context(), userID)
		} else if role == "admin" {
			bids, err = svc.ListAll(c.Context())
		} else {
			bids, err = svc.ListByEmployer(c.Context(), userID)
		}
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		if status != "" {
			filtered := []repository.Bid{}
			for _, b := range bids {
				if b.Status == status {
					filtered = append(filtered, b)
				}
			}
			bids = filtered
		}
		if bids == nil {
			bids = []repository.Bid{}
		}
		return c.JSON(bids)
	}
}

func getBidHandler(svc *service.BidService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id, err := bidID(c)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		bid, err := svc.GetByID(c.Context(), id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		if bid == nil {
			return c.Status(404).JSON(fiber.Map{"error": "not found"})
		}
		return c.JSON(bid)
	}
}

func updateBidHandler(svc *service.BidService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		freelancerID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		id, err := bidID(c)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		var req service.CreateBidRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		bid, err := svc.UpdateBid(c.Context(), id, freelancerID, req)
		if err != nil {
			return statusForError(c, err)
		}
		return c.JSON(bid)
	}
}

func withdrawBidHandler(svc *service.BidService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		freelancerID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		id, err := bidID(c)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		bid, err := svc.WithdrawBid(c.Context(), id, freelancerID)
		if err != nil {
			return statusForError(c, err)
		}
		return c.JSON(bid)
	}
}

func shortlistBidHandler(svc *service.BidService) fiber.Handler {
	return updateBidStatusHandler(svc, "shortlisted")
}

func rejectBidHandler(svc *service.BidService) fiber.Handler {
	return updateBidStatusHandler(svc, "rejected")
}

func acceptBidHandler(svc *service.BidService) fiber.Handler {
	return updateBidStatusHandler(svc, "accepted")
}

func updateBidStatusHandler(svc *service.BidService, status string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		requesterID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		id, err := bidID(c)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		bid, err := svc.UpdateStatus(c.Context(), id, status, requesterID, getRole(c))
		if err != nil {
			return statusForError(c, err)
		}
		return c.JSON(bid)
	}
}

// statusForError maps a rule violation onto the matching HTTP status.
func statusForError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, service.ErrNotProposalOwner),
		errors.Is(err, service.ErrJobNotOpen),
		errors.Is(err, service.ErrNotEditable),
		errors.Is(err, service.ErrNotWithdrawable),
		errors.Is(err, service.ErrOwnJob):
		return c.Status(403).JSON(fiber.Map{"error": err.Error()})
	case errors.Is(err, service.ErrAlreadyProposed):
		return c.Status(409).JSON(fiber.Map{"error": err.Error()})
	default:
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
}
