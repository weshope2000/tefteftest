package main

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"teftef.com/payment/internal/repository"
	"teftef.com/payment/internal/service"
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
		CREATE TABLE IF NOT EXISTS payments (
			id UUID PRIMARY KEY,
			contract_id UUID NOT NULL,
			client_id UUID NOT NULL,
			amount DOUBLE PRECISION DEFAULT 0,
			status VARCHAR(20) DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatal("Failed to migrate:", err)
	}

	repo := repository.NewPaymentRepository(db)
	svc := service.NewPaymentService(repo)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"service": "payment", "status": "ok"})
	})

	app.Post("/payments", createPaymentHandler(svc))
	app.Get("/payments", listPaymentsHandler(svc))
	app.Get("/payments/:id", getPaymentHandler(svc))
	app.Put("/payments/:id/pay", payPaymentHandler(svc))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8004"
	}
	log.Printf("Payment service running on :%s", port)
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

func createPaymentHandler(svc *service.PaymentService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		clientID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		var req service.CreatePaymentRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		payment, err := svc.CreatePayment(c.Context(), clientID, req)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(201).JSON(payment)
	}
}

func listPaymentsHandler(svc *service.PaymentService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		payments, err := svc.ListByClient(c.Context(), userID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		return c.JSON(payments)
	}
}

func getPaymentHandler(svc *service.PaymentService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		payment, err := svc.GetByID(c.Context(), id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		if payment == nil {
			return c.Status(404).JSON(fiber.Map{"error": "not found"})
		}
		return c.JSON(payment)
	}
}

func payPaymentHandler(svc *service.PaymentService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		id := c.Params("id")
		payment, err := svc.Pay(c.Context(), id, userID)
		if err != nil {
			return c.Status(403).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(payment)
	}
}