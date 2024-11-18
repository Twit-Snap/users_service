import { getTwilio } from '../app';
import { AuthenticationError, ServiceUnavailableError } from '../types/customErrors';

const serviceSid = 'VAd5cfbce4c82388e75e9e2bf0a9fdb565';

export async function sendVerification(to: string, channel: 'sms' | 'email'): Promise<void> {
  try {
    await getTwilio().verify.v2.services(serviceSid).verifications.create({ to, channel });
  } catch (error) {
    console.error(error);
    throw new ServiceUnavailableError();
  }
}

export async function checkVerification(to: string, code: string): Promise<void> {
  await getTwilio()
    .verify.v2.services(serviceSid)
    .verificationChecks.create({
      code,
      to
    })
    .catch(() => {
      throw new ServiceUnavailableError();
    })
    .then(({ status }: { status: string }) => {
      if (status !== 'approved') {
        throw new AuthenticationError();
      }
    });
}
