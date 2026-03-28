import { body } from "express-validator";

export const registerValidators = [
  body("email")
    .isEmail()
    .notEmpty()
    .withMessage("email is required"),
  body("firstName").notEmpty().withMessage("firstName is required"),
  body("lastName").notEmpty().withMessage("lastName is required"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .isStrongPassword()
    .withMessage("Password is to weak"),
  body("phone")
    .matches(/^(09|\+639|639)\d{9}$/)
    .withMessage("Invalid Philippine phone number format.")
    .customSanitizer((value) => {
      // +639XXXXXXXXX → 09XXXXXXXXX
      if (value.startsWith("+639")) {
        return "0" + value.slice(3);
      }

      if (value.startsWith("639")) {
        return "0" + value.slice(2);
      }

      // already starting with 09
      return value;
    }),
  body("role").optional().isIn(["resident", "skilled", "admin"]),
  body("city").optional().isString().withMessage("City must be a string"),
  body("barangay")
    .optional()
    .isString()
    .withMessage("Barangay must be a string"),
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
