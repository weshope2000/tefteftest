package main

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func envOrDefault(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}

func proxyTo(base string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		target := base + c.Path()
		if q := c.Context().QueryArgs().String(); q != "" {
			target += "?" + q
		}

		// Create a new HTTP request
		log.Printf("Proxying %s %s Auth=%s", c.Method(), target, c.Get("Authorization")); req, err := http.NewRequest(c.Method(), target, bytes.NewReader(c.Body()))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		// Copy headers
		c.Request().Header.VisitAll(func(key, value []byte) {
			req.Header.Set(string(key), string(value))
		})

		// Execute request
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return c.Status(502).JSON(fiber.Map{"error": err.Error()})
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return c.Status(502).JSON(fiber.Map{"error": err.Error()})
		}

		// Set response headers
		for key, values := range resp.Header {
			for _, v := range values {
				c.Set(key, v)
			}
		}
		c.Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Set("Access-Control-Allow-Credentials", "true")

		// Return response
		return c.Status(resp.StatusCode).Send(body)
	}
}

func proxyAuth(base string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		target := base + strings.TrimPrefix(c.Path(), "/auth")
		if q := c.Context().QueryArgs().String(); q != "" {
			target += "?" + q
		}

		log.Printf("Proxying %s %s Auth=%s", c.Method(), target, c.Get("Authorization")); req, err := http.NewRequest(c.Method(), target, bytes.NewReader(c.Body()))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		c.Request().Header.VisitAll(func(key, value []byte) {
			req.Header.Set(string(key), string(value))
		})

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return c.Status(502).JSON(fiber.Map{"error": err.Error()})
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return c.Status(502).JSON(fiber.Map{"error": err.Error()})
		}

		for key, values := range resp.Header {
			for _, v := range values {
				c.Set(key, v)
			}
		}
		c.Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Set("Access-Control-Allow-Credentials", "true")

		return c.Status(resp.StatusCode).Send(body)
	}
}

func main() {
	app := fiber.New()

	app.Use(func(c *fiber.Ctx) error {
		origin := c.Get("Origin")
		if origin == "http://localhost:3000" || origin == "" {
			c.Set("Access-Control-Allow-Origin", "http://localhost:3000")
		}
		c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization")
		c.Set("Access-Control-Allow-Credentials", "true")
		if c.Method() == "OPTIONS" {
			return c.SendStatus(fiber.StatusOK)
		}
		return c.Next()
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"gateway": "running"})
	})

	authBase := envOrDefault("AUTH_SERVICE_URL", "http://localhost:5000")
	app.All("/auth", proxyAuth(authBase))
	app.All("/auth/*", proxyAuth(authBase))

	jobBase := envOrDefault("JOB_SERVICE_URL", "http://localhost:8001")
	app.All("/jobs", proxyTo(jobBase))
	app.All("/jobs/*", proxyTo(jobBase))

	bidBase := envOrDefault("BID_SERVICE_URL", "http://localhost:8002")
	app.All("/bids", proxyTo(bidBase))
	app.All("/bids/*", proxyTo(bidBase))

	contractBase := envOrDefault("CONTRACT_SERVICE_URL", "http://localhost:8003")
	app.All("/contracts", proxyTo(contractBase))
	app.All("/contracts/*", proxyTo(contractBase))

	paymentBase := envOrDefault("PAYMENT_SERVICE_URL", "http://localhost:8004")
	app.All("/payments", proxyTo(paymentBase))
	app.All("/payments/*", proxyTo(paymentBase))

	msgBase := envOrDefault("MESSAGING_SERVICE_URL", "http://localhost:8005")
	app.All("/messages", proxyTo(msgBase))
	app.All("/messages/*", proxyTo(msgBase))

	reviewBase := envOrDefault("REVIEW_SERVICE_URL", "http://localhost:8006")
	app.All("/reviews", proxyTo(reviewBase))
	app.All("/reviews/*", proxyTo(reviewBase))

	employerBase := envOrDefault("EMPLOYER_SERVICE_URL", "http://localhost:8001")
	userBase := envOrDefault("USER_SERVICE_URL", "http://localhost:8007")
	app.All("/employers", proxyTo(employerBase))
	app.All("/employers/*", proxyTo(employerBase))
	app.All("/profile", proxyTo(userBase))
	app.All("/profile/*", proxyTo(userBase))
	app.All("/skills", proxyTo(userBase))
	app.All("/skills/*", proxyTo(userBase))
	app.All("/portfolio", proxyTo(userBase))
	app.All("/portfolio/*", proxyTo(userBase))
	app.All("/freelancers", proxyTo(userBase))
	app.All("/freelancers/*", proxyTo(userBase))

	log.Println("API Gateway running on :8000")
	log.Fatal(app.Listen(":8000"))
}