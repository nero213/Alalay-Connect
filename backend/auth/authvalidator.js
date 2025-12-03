import { body } from "express-validator";

export const registerValidators = [
  body("email")
    .isEmail()
    .notEmpty()
    .normalizeEmail()
    .withMessage("email is required"),
  body("firstName").notEmpty().withMessage("firstName is required"),
  body("lastName").notEmpty().withMessage("lastName is required"),
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .isStrongPassword()
    .withMessage("password is required"),
  body("phone").optional().isMobilePhone().withMessage("phone is required"),
  body("role").optional().isIn(["resident", "skilled", "admin"]),
];

export const loginValidators = [
  body("email")
    .isEmail()
    .notEmpty()
    .normalizeEmail()
    .withMessage("email is required"),
  body("password")
    .notEmpty()
    .isStrongPassword()
    .isLength({ min: 6 })
    .withMessage("password is required"),
];
