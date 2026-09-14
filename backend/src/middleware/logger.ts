import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const latencyMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    
    // Do not log request bodies to protect student privacy
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: 'API_REQUEST',
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latency_ms: Number(latencyMs),
      user_id: (req as any).user ? (req as any).user.user_id : 'unauthenticated',
      ip: req.ip || 'unknown'
    };

    if (res.statusCode >= 400) {
      console.error(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  });

  next();
};
