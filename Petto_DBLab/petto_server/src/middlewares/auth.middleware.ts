import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "customer" | "staff" | "admin";
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"] as string;
  const userRole = req.headers["x-role"] as string;

  if (!userId) {
    return res.status(401).json({ error: "Missing x-user-id header. Unauthorized." });
  }

  req.user = {
    id: userId,
    role: (userRole as any) || "customer",
  };

  next();
}

export function requireRole(roles: Array<"customer" | "staff" | "admin">) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
    }
    next();
  };
}
