export interface Admin {
    username: string;
    email: string;
}

export interface AdminInfoDto {
    username: string;
    email: string;
    password: string;
}

export interface LoginAdminDto {
    email: string;
    password: string;
}