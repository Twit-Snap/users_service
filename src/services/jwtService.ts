import { IJWTService, JwtCustomPayload } from 'jwt';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  decode(token: string): JwtPayload | string | null {
    return jwt.decode(token);
  }
}
