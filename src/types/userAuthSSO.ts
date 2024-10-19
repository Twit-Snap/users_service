export interface UserSSORegisterDto {
  idToken: string;
  email: string;
  name: string;
  photoURL?: string;
  username?: string;
  birthdate?: Date;
}
