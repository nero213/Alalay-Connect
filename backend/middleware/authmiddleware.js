import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeaders = req.headers.authorization;

  if (!authHeaders) {
    return res.status(401).json({ message: "no Token provided" });
  }

  const token = authHeaders.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "invalid token format" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;

    next();
  } catch (err) {
    return res.status(401).json({ message: "token invalid or expired" });
  }
};
