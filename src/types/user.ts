export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}