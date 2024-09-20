export interface Admin {
    username: string;
    email: string;
}

export interface CreateAdminDto {
    username: string;
    email: string;
    password: string;
}