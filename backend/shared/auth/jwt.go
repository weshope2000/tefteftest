package auth

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var Secret = []byte(os.Getenv("JWT_SECRET"))

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenStr := strings.TrimPrefix(c.Get("Authorization"), "Bearer ")
		if tokenStr == "" {
			return c.Status(401).JSON(fiber.Map{"error": "Missing token"})
		}
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return Secret, nil
		})
		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
		}
		return c.Next()
	}
}
