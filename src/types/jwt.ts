import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// Interface definition
export interface IJWTService {
  sign(payload: JwtCustomPayload): string;
  verify(token: string): JwtPayload | string;
  decode(token: string): JwtPayload | string | null;
}

export type JwtCustomPayload = JwtUserPayload | JwtAdminPayload;

export type JwtUserPayload = {
  type: 'user';
  userId: number;
  email: string;
  username: string;
  phoneNumber: string;
};

export type JwtAdminPayload = {
  type: 'admin';
  username: string;
  email: string;
};

export type UserRequest = Request & { user: JwtUserPayload };
export type AdminRequest = Request & { user: JwtAdminPayload };
