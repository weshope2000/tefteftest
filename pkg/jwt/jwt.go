package jwtutil

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var Secret = func() []byte {
	if s := os.Getenv("JWT_SECRET"); s != "" {
		return []byte(s)
	}
	return []byte("dev_super_secret")
}()

func Generate(userID, role, name string) (string, error) {
	claims := jwt.MapClaims{
		"id":      userID,
		"user_id": userID,
		"name":    name,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(Secret)
}

func Validate(tokenStr string) (*jwt.Token, error) {
	return jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return Secret, nil
	})
}
