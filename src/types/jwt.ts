import { Request } from 'express';
import { JwtPayload, SignOptions } from 'jsonwebtoken';

// Interface definition
export interface IJWTService {
  sign(payload: JwtCustomPayload, options?: SignOptions): string;
  verify(token: string): JwtPayload | string;
  decode(token: string): JwtPayload | string | null;
}

export type JwtCustomPayload = JwtUserPayload | JwtAdminPayload | JwtResetPasswordPayload;

export type JwtUserPayload = {
  type: 'user';
  userId: number;
  email: string;
  username: string;
  phoneNumber: string;
  verified: boolean;
};

export type JwtAdminPayload = {
  type: 'admin';
  username: string;
  email: string;
};

export type JwtResetPasswordPayload = {
  type: 'resetPassword';
  userId: number;
  email: string;
};

export type UserRequest = Request & { user: JwtUserPayload };
export type AdminRequest = Request & { user: JwtAdminPayload };
