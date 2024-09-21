export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  lastname: string;
  birthdate: Date;
  createdAt: Date;
}

export interface UserRegisterDto {
  username: string;
  email: string;
  name: string;
  lastname: string;
  birthdate: Date;
  password: string;
}


export interface IUserRepository {
  getList(): Promise<User[] | null>;
  get(id: number): Promise<User | null>;
  create(userData: UserRegisterDto): Promise<User>;
}



export interface IAuthUserService {
  login(emailOrUsername: string, password: string): Promise<User>;
  register(user: UserRegisterDto): Promise<User>;
}