import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../utils/jwt';
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map