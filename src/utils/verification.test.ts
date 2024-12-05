import { getTwilio } from '../app'; // Adjust the import based on your project structure
import { AuthenticationError, ServiceUnavailableError } from '../types/customErrors';
import { checkVerification, sendVerification } from './verification';

jest.mock('../app'); // Mock the app module to control the getTwilio function

describe.skip('Verification', () => {
  const mockTwilio = {
    verify: {
      v2: {
        services: jest.fn().mockReturnThis(),
        verifications: {
          create: jest.fn()
        },
        verificationChecks: {
          create: jest.fn()
        }
      }
    }
  };

  beforeEach(() => {
    (getTwilio as jest.Mock).mockReturnValue(mockTwilio);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should send a verification code', async () => {
    const to = 'test@example.com';
    const channel = 'email';

    await sendVerification(to, channel);

    expect(mockTwilio.verify.v2.services().verifications.create).toHaveBeenCalledWith({ to, channel });
  });

  it('should check a verification code', async () => {
    const to = 'test@example.com';
    const code = '123456';

    mockTwilio.verify.v2.services().verificationChecks.create.mockResolvedValue({ status: 'approved' });

    await checkVerification(to, code);

    expect(mockTwilio.verify.v2.services().verificationChecks.create).toHaveBeenCalledWith({ code, to });
  });

  it('should throw ServiceUnavailableError on failure to send verification', async () => {
    const to = 'test@example.com';
    const channel = 'email';
    (mockTwilio.verify.v2.services().verifications.create as jest.Mock).mockRejectedValue(new Error('Twilio error'));

    await expect(sendVerification(to, channel)).rejects.toThrow(ServiceUnavailableError);
  });

  it('should throw AuthenticationError if verification fails', async () => {
    const to = 'test@example.com';
    const code = '123456';
    mockTwilio.verify.v2.services().verificationChecks.create.mockResolvedValue({ status: 'not approved' });

    await expect(checkVerification(to, code)).rejects.toThrow(AuthenticationError);
  });
});
