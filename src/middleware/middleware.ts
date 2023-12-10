import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload, RequestWithUserPayload } from "../types/request.interface";

const authenticateToken = (
  req: RequestWithUserPayload,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (typeof token !== "string") {
    return res.status(401).json({ error: "Unauthorized: Token is required." });
  }

  try {
    const secret_key = "secret_key";
    const decoded = jwt.verify(token, secret_key) as JWTPayload;

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Forbidden: Invalid token." });
  }
};
export default authenticateToken;
