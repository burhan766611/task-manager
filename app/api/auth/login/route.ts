import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (!user)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const valid = await bcrypt.compare(
      parsed.password,
      user.password
    );

    if (!valid)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const token = generateToken(user.id);

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}