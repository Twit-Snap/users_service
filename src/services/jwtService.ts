/* istanbul ignore file */
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IJWTService, JwtCustomPayload } from 'jwt';
import { AuthenticationError } from '../types/customErrors';

// JWT Service class implementation
export class JWTService implements IJWTService {
  readonly expiresIn = '365 days';
  readonly secret = process.env.JWT_SECRET_KEY!;

  sign(payload: JwtCustomPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token: string): JwtPayload | string {
    try {
      return jwt.verify(token, this.secret);
    } catch {
      throw new AuthenticationError();
    }
  }

  decode(token: string): JwtPayload | string | null {
    return jwt.decode(token);
  }
}
