export class InvalidCredentialsError extends Error {
  detail: string;

  constructor(detail: string) {
    super(`Email or password are incorrect`);
    this.detail = detail;
    this.name = 'InvalidCredentials';
  }
}



