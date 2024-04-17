export interface RegisterRequestBody{
    first_name: string
    last_name: string
    email: string;
    password: string;
}

export interface LoginRequestBody{
    email: string;
    password: string;
}

export interface updateProfileRequestBody{
    first_name?: string
    last_name?: string
    email?: string;
}

export const userFields = {
    id: true,
    first_name: true,
    last_name: true,
    email: true,
    created_at: true,
    username: true
}