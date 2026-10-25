package handler

import (
	"github.com/gofiber/fiber/v2"
	"teftef.com/user/internal/model"
	"teftef.com/user/internal/service"
)

type UserHandler struct {
	service *service.UserService
}

func NewUserHandler(s *service.UserService) *UserHandler {
	return &UserHandler{service: s}
}

func (h *UserHandler) CreateProfile(c *fiber.Ctx) error {
	var p model.Profile
	if err := c.BodyParser(&p); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
	}
	err := h.service.CreateProfile(p)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Profile created"})
}

func (h *UserHandler) GetProfile(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	profile, err := h.service.GetProfile(userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "profile not found"})
	}
	return c.JSON(profile)
}

func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	var p model.Profile
	if err := c.BodyParser(&p); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
	}
	err := h.service.UpdateProfile(p)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "Profile updated"})
}

func (h *UserHandler) AddSkill(c *fiber.Ctx) error {
	var s model.Skill
	if err := c.BodyParser(&s); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
	}
	return h.service.AddSkill(s)
}

func (h *UserHandler) ListSkills(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	skills, err := h.service.ListSkills(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(skills)
}

func (h *UserHandler) AddPortfolio(c *fiber.Ctx) error {
	var p model.Portfolio
	if err := c.BodyParser(&p); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
	}
	return h.service.AddPortfolio(p)
}

func (h *UserHandler) ListPortfolio(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	portfolio, err := h.service.ListPortfolio(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(portfolio)
}

func (h *UserHandler) ListProfiles(c *fiber.Ctx) error {
	profiles, err := h.service.ListProfiles()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(profiles)
}
