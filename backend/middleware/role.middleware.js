const role = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "not authenticated" });
    }

    if (req.user.role !== requiredRole) {
      return res
        .status(403)
        .json({ message: "Forbidden: not the right role " });
    }
    next();
  };
};

export default role;
