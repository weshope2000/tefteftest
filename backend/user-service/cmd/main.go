package main

import (
	"context"
	"log"
	"os"

	"teftef.com/user/internal/handler"
	"teftef.com/user/internal/repository"
	"teftef.com/user/internal/service"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

func migrate(db *pgxpool.Pool) error {
	ctx := context.Background()
	_, err := db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS profiles (
			id UUID PRIMARY KEY,
			user_id UUID UNIQUE NOT NULL,
			full_name TEXT NOT NULL DEFAULT '',
			professional_title TEXT NOT NULL DEFAULT '',
			photo_url TEXT NOT NULL DEFAULT '',
			location TEXT NOT NULL DEFAULT '',
			bio TEXT NOT NULL DEFAULT '',
			experience TEXT NOT NULL DEFAULT '',
			education TEXT NOT NULL DEFAULT '',
			certifications TEXT NOT NULL DEFAULT '',
			hourly_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
			monthly_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
			fixed_price BOOLEAN NOT NULL DEFAULT false,
			weekly_capacity TEXT NOT NULL DEFAULT '',
			start_date TEXT NOT NULL DEFAULT '',
			availability TEXT NOT NULL DEFAULT '',
			verification_status TEXT NOT NULL DEFAULT 'unverified',
			languages TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS skills (
			id UUID PRIMARY KEY,
			user_id UUID NOT NULL,
			skill_name TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS portfolios (
			id UUID PRIMARY KEY,
			user_id UUID NOT NULL,
			title TEXT NOT NULL,
			description TEXT NOT NULL,
			file_url TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return err
	}
	alterStmts := []string{
		"ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_title TEXT NOT NULL DEFAULT ''",
		"ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT NOT NULL DEFAULT ''",
		"ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT ''",
		"ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience TEXT NOT NULL DEFAULT ''",
		"ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education TEXT NOT NULL DEFAULT ''",
		"ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications TEXT NOT NULL DEFAULT ''",
		"ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fixed_price BOOLEAN NOT NULL DEFAULT false",
		"ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_capacity TEXT NOT NULL DEFAULT ''",
		"ALTER TABLE profiles ADD COLUMN IF NOT EXISTS start_date TEXT NOT NULL DEFAULT ''",
	}
	for _, stmt := range alterStmts {
		if _, e := db.Exec(ctx, stmt); e != nil {
			return e
		}
	}
	return nil
}

func main() {
	dsn := os.Getenv("DATABASE_URL")
	db, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatal(err)
	}

	if err := migrate(db); err != nil {
		log.Fatal("Failed to migrate:", err)
	}

	repo := repository.NewUserRepository(db)
	userService := service.NewUserService(repo)
	userHandler := handler.NewUserHandler(userService)

	app := fiber.New()

	// Profile routes
	app.Post("/profile", userHandler.CreateProfile)
	app.Get("/profile/:user_id", userHandler.GetProfile)
	app.Put("/profile", userHandler.UpdateProfile)
	app.Get("/profile", userHandler.ListProfiles)

	// Skills routes
	app.Post("/skills", userHandler.AddSkill)
	app.Get("/skills/:user_id", userHandler.ListSkills)

	// Portfolio routes
	app.Post("/portfolio", userHandler.AddPortfolio)
	app.Get("/portfolio/:user_id", userHandler.ListPortfolio)

	// Find freelancers
	app.Get("/freelancers", userHandler.ListProfiles)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8007"
	}
	log.Printf("User service running on :%s", port)
	log.Fatal(app.Listen(":" + port))
}
