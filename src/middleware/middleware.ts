// middleware.ts
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']; // Assuming the token is passed in the 'Authorization' header

  if (typeof token !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: Token is required.' });
  }

  // Here you would validate the token (e.g., check against a database or validate using a library like JWT)

  // For demonstration purposes, let's assume a simple check where the token is 'validtoken'
  if (token !== 'validtoken') {
    return res.status(403).json({ error: 'Forbidden: Invalid token.' });
  }

  next(); // Token is valid, proceed to the next middleware or route handler
};
