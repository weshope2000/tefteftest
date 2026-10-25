package main

import (
	"context"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"teftef.com/contract/internal/repository"
	"teftef.com/contract/internal/service"
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
		CREATE TABLE IF NOT EXISTS contracts (
			id UUID PRIMARY KEY,
			job_id UUID NOT NULL,
			client_id UUID NOT NULL,
			freelancer_id UUID NOT NULL,
			amount DOUBLE PRECISION DEFAULT 0,
			status VARCHAR(20) DEFAULT 'active',
			version INT DEFAULT 1,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatal("Failed to migrate:", err)
	}

	repo := repository.NewContractRepository(db)
	svc := service.NewContractService(repo)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"service": "contract", "status": "ok"})
	})

	app.Post("/contracts", createContractHandler(svc))
	app.Get("/contracts", listContractsHandler(svc))
	app.Get("/contracts/:id", getContractHandler(svc))
	app.Put("/contracts/:id/complete", completeContractHandler(svc))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8003"
	}
	log.Printf("Contract service running on :%s", port)
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

func createContractHandler(svc *service.ContractService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		clientID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		var req service.CreateContractRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
		}
		contract, err := svc.CreateContract(c.Context(), clientID, req)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(201).JSON(contract)
	}
}

func listContractsHandler(svc *service.ContractService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		role := getRole(c)
		var contracts []repository.Contract
		if role == "freelancer" {
			contracts, err = svc.ListByFreelancer(c.Context(), userID)
		} else {
			contracts, err = svc.ListByClient(c.Context(), userID)
		}
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		if contracts == nil {
			contracts = []repository.Contract{}
		}
		return c.JSON(contracts)
	}
}

func getContractHandler(svc *service.ContractService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		contract, err := svc.GetByID(c.Context(), id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "db error"})
		}
		if contract == nil {
			return c.Status(404).JSON(fiber.Map{"error": "not found"})
		}
		return c.JSON(contract)
	}
}

func completeContractHandler(svc *service.ContractService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, err := getUserID(c)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
		}
		id := c.Params("id")
		contract, err := svc.CompleteContract(c.Context(), id, userID)
		if err != nil {
			return c.Status(403).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(contract)
	}
}