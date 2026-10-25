package database

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPostgres() *pgxpool.Pool {
	dsn := os.Getenv("DATABASE_URL")
	log.Printf("DATABASE_URL is set: %t", dsn != "")
	log.Println("Attempting to create database connection pool...")

	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatal("Failed to connect DB:", err)
	}
	log.Println("Database connection pool created successfully")

	return pool
}
