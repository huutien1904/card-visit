export interface User {
  id: string;
  username: string;
  password: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  username: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface AuthToken {
  userId: string;
  username: string;
  role: "user" | "admin";
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: "user" | "admin";
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}
