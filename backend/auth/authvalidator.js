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
    .withMessage("password is required")
    .isLength({ min: 6 })
    .isStrongPassword()
    .withMessage("Password is to weak"),
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
