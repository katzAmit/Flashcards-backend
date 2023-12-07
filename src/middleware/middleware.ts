
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];

  if (typeof token !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: Token is required.' });
  }

  try {
    const secret_key = process.env.JWT_SECRET || 'secret_key'
    const decoded = jwt.verify(token, secret_key);
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid token.' });
  }
};
export default authenticateToken
