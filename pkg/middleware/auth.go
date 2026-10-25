package middleware

import (
	"strings"

	jwtutil "teftef.com/pkg/jwt"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func JWTMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {

		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{"error": "missing token"})
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwtutil.Validate(tokenStr)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "invalid token"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(401).JSON(fiber.Map{"error": "invalid token claims"})
		}

		userID, ok := claims["id"].(string)
		if !ok {
			return c.Status(401).JSON(fiber.Map{"error": "invalid user id"})
		}

		// Store userID in context
		c.Locals("user_id", userID)

		return c.Next()
	}
}
