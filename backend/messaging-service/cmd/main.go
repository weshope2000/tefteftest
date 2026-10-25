package main

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"teftef.com/messaging/internal/repository"
	"teftef.com/messaging/internal/service"
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
		CREATE TABLE IF NOT EXISTS messages (
			id UUID PRIMARY KEY,
			contract_id UUID NOT NULL,
			sender_id UUID NOT NULL,
			receiver_id UUID NOT NULL,
			content TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatal("Failed to migrate:", err)
	}

	repo := repository.NewMessageRepository(db)
	svc := service.NewMessageService(repo)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"service": "messaging", "status": "ok"})
	})

	app.Post("/messages", sendMessageHandler(svc))
	app.Get("/messages", listMessagesHandler(svc))
	app.Get("/contract/:contractID", listByContractHandler(svc))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8005"
	}
	log.Printf("Messaging service running on :%s", port)
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

func sendMessageHandler(svc *service.MessageService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		senderID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		var req service.SendMessageRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		msg, err := svc.SendMessage(c.Context(), senderID, req)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(201).JSON(msg)
	}
}

func listMessagesHandler(svc *service.MessageService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		messages, err := svc.ListByUser(c.Context(), userID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		return c.JSON(messages)
	}
}

func listByContractHandler(svc *service.MessageService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		_, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		contractID := c.Params("contractID")
		messages, err := svc.ListByContract(c.Context(), contractID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		return c.JSON(messages)
	}
}