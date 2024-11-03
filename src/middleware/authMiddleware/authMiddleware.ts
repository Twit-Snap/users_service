import { NextFunction, Request, Response } from 'express';
import { JwtCustomPayload } from 'jwt';
import { JWTService } from '../../services/jwtService';
import { UserService } from '../../services/userService';
import { AuthenticationError, BlockedError } from '../../types/customErrors';

export const decodeToken = (authHeader: string | undefined): JwtCustomPayload => {
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('Middleware: No token provided');
    throw new AuthenticationError();
  }

  const jwtService = new JWTService();
  return jwtService.verify(token) as JwtCustomPayload;
};

export const checkBlockedUser = async (decodedToken: JwtCustomPayload) => {
  if (decodedToken.type === 'admin') {
    return;
  }

  const user = await new UserService().get(decodedToken.userId);

  if (user?.isBlocked != undefined ? user.isBlocked : true) {
    throw new BlockedError();
  }
};

/* istanbul ignore next */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader: string | undefined = req.headers['authorization'];

    const decoded: JwtCustomPayload = decodeToken(authHeader);
    await checkBlockedUser(decoded);

    // Attach the decoded user information to the request object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
