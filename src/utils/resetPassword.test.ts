import { resetPasswordTemplate } from './resetPassword';

describe('Reset Password Template', () => {
  it('should return a valid HTML template', () => {
    const url = 'http://example.com/reset';
    const result = resetPasswordTemplate(url);
    expect(result).toContain('<h1>Reset Password</h1>');
    expect(result).toContain(url);
  });
});
