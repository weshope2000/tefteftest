package main

import (
	"context"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"teftef.com/auth/internal/handler"
	"teftef.com/auth/internal/repository"
	"teftef.com/auth/internal/service"
)

// migrate creates the users table if it does not exist
func migrate(db *pgxpool.Pool) error {
	_, err := db.Exec(context.Background(), `
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY,
		name VARCHAR(255) NOT NULL DEFAULT '',
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		role VARCHAR(20) NOT NULL,
		status VARCHAR(20) DEFAULT 'active',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`)
	return err
}

func main() {
	// Get database URL from environment
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	// Connect to PostgreSQL
	db, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migration
	if err := migrate(db); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migration complete")

	// Initialize repository, service, handler
	repo := repository.NewUserRepository(db)
	authService := service.NewAuthService(repo)
	authHandler := handler.NewAuthHandler(authService)
	auditRepo := repository.NewAuditRepository(db)

	// Fiber app
	app := fiber.New()

	// Enable CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"service": "auth", "status": "running"})
	})

	// Auth routes
	app.Post("/register", authHandler.Register)
	app.Post("/login", authHandler.Login)
	app.Get("/users", authHandler.ListUsers)
	app.Put("/users/:id/status", authHandler.UpdateUserStatus)
	app.Get("/audit", func(c *fiber.Ctx) error {
		logs, err := auditRepo.List()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(logs)
	})

	// Start server
	log.Println("Auth service running on :5000")
	log.Fatal(app.Listen(":5000")) // must match Docker EXPOSE
}
