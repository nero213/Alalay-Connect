import { body } from "express-validator";

export const registerValidators = [
  body("email").isEmail().notEmpty().normalizeEmail(),
  body("firstName").notEmpty(),
  body("lastName").notEmpty(),
  body("password").notEmpty().isLength({ min: 6 }),
  body("phone").optional().isMobilePhone(),
  body("role").optional().isIn(["resident", "skilled", "admin"]),
];
