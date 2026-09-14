import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.session_id;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await AuthService.validateSession(token);
    if (!user) {
      res.clearCookie('session_id');
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
