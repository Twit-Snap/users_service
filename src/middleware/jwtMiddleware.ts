import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/jwtService';
import { AuthenticationError } from '../types/customUserErrors';

export const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) throw new AuthenticationError(); 

  const jwtService = new JWTService()
  const decoded = jwtService.verify(token);
  // Attach the decoded user information to the request object
  (req as any).user = decoded;
  next();
};