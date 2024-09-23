export interface Admin {
  username: string;
  email: string;
}

export type AdminWithToken = Admin & { token: string };

export type AdminWithPassword = Admin & { password: string };
