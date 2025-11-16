import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { AuthToken } from "./auth-types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-keys");

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: AuthToken): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<AuthToken | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (
      typeof payload.userId === "string" &&
      typeof payload.username === "string" &&
      (payload.role === "user" || payload.role === "admin")
    ) {
      return payload as unknown as AuthToken;
    }

    return null;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
