import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async requestOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await AuthService.requestRegistrationOTP(email);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyOTP(email, otp);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async completeRegistration(req: Request, res: Response) {
    try {
      const { token, firstName, lastName, password } = req.body;
      const result = await AuthService.completeRegistration(token, firstName, lastName, password);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const ip = req.ip || '';
      const ua = req.headers['user-agent'] || '';
      const result = await AuthService.login(email, password, ip, ua);
      
      res.cookie('session_id', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });
      
      res.json({ user: result.user });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async googleLogin(req: Request, res: Response) {
    try {
      const { idToken } = req.body;
      const ip = req.ip || '';
      const ua = req.headers['user-agent'] || '';
      const result = await AuthService.googleLogin(idToken, ip, ua);

      res.cookie('session_id', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
      
      res.json({ user: result.user });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const token = req.cookies.session_id;
      if (token) {
        await AuthService.logout(token);
      }
      res.clearCookie('session_id');
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async me(req: Request, res: Response) {
    // Requires auth middleware
    res.json({ user: (req as any).user });
  }
}
