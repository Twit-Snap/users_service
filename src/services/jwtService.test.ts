import { JwtCustomPayload } from 'jwt';
import { AuthenticationError } from '../types/customErrors';
import { JWTService } from './jwtService';

describe('JWTService', () => {
  let jwtService: JWTService;
  const mockPayload: JwtCustomPayload = { userId: 123, email: 'test@test.com', username: 'test', phoneNumber: '1234567890', verified: true, type: 'user' };
  let token: string;

  beforeAll(() => {
    process.env.JWT_SECRET_KEY = 'test_key';
    jwtService = new JWTService();
  });

  test('should sign a token', () => {
    token = jwtService.sign(mockPayload);
    expect(token).toBeDefined();
  });

  test('should verify a valid token', () => {
    const verifiedPayload = jwtService.verify(token);
    expect(verifiedPayload).toHaveProperty('userId', mockPayload.userId);
  });

  test('should throw AuthenticationError for invalid token', () => {
    expect(() => jwtService.verify('invalid.token')).toThrow(AuthenticationError);
  });

  test('should decode a token', () => {
    const decodedPayload = jwtService.decode(token);
    expect(decodedPayload).toHaveProperty('userId', mockPayload.userId);
  });
});
