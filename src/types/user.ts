export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  lastname: string;
  birthdate: Date;
  createdAt: Date;
}

export type UserWithPassword = User & { password: string };
export type UserWithToken = User & { token: string };

export interface UserRegisterDto {
  username: string;
  email: string;
  name: string;
  lastname: string;
  birthdate: Date;
  password: string;
}


export interface IUserRepository {
  findByEmailOrUsername(emailOrUsername: string): Promise<UserWithPassword | null>;
  getList(): Promise<User[] | null>;
  get(id: number): Promise<User | null>;
  create(userData: UserRegisterDto): Promise<User>;
}



export interface IAuthUserService {
  login(emailOrUsername: string, password: string): Promise<UserWithToken>;
  register(user: UserRegisterDto): Promise<UserWithToken>;
}