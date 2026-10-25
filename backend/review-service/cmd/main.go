package main

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"teftef.com/review/internal/repository"
	"teftef.com/review/internal/service"
	jwtutil "teftef.com/pkg/jwt"
)

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

	_, err = db.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS reviews (
			id UUID PRIMARY KEY,
			contract_id UUID NOT NULL,
			reviewer_id UUID NOT NULL,
			reviewee_id UUID NOT NULL,
			rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
			feedback TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatal("Failed to migrate:", err)
	}

	repo := repository.NewReviewRepository(db)
	svc := service.NewReviewService(repo)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"service": "review", "status": "ok"})
	})

	app.Post("/reviews", createReviewHandler(svc))
	app.Get("/reviews", listReviewsHandler(svc))
	app.Get("/contract/:contractID", listByContractHandler(svc))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8006"
	}
	log.Printf("Review service running on :%s", port)
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

func createReviewHandler(svc *service.ReviewService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		reviewerID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		var req service.CreateReviewRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		review, err := svc.CreateReview(c.Context(), reviewerID, req)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(201).JSON(review)
	}
}

func listReviewsHandler(svc *service.ReviewService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		_, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		revieweeID := c.Query("reviewee_id")
		if revieweeID == "" {
			return c.Status(400).JSON(fiber.Map{"error": "reviewee_id query param required"})
		}
		reviews, err := svc.ListByReviewee(c.Context(), revieweeID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		return c.JSON(reviews)
	}
}

func listByContractHandler(svc *service.ReviewService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		_, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		contractID := c.Params("contractID")
		reviews, err := svc.ListByContract(c.Context(), contractID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		return c.JSON(reviews)
	}
}