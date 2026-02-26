import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export function generateToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string;
  };
}

export async function getUserFromCookie() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}