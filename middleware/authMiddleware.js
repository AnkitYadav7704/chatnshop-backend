const jwt = require("jsonwebtoken");

const protectRoute = (req, res, next) => {
    
  const authHeader = req.headers.authorization;
  console.log("Auth header:", req.headers.authorization);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // Attach user ID to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = protectRoute;
