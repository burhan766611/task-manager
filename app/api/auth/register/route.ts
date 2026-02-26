import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const hashed = await bcrypt.hash(parsed.password, 10);

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        password: hashed,
      },
    });

    return NextResponse.json(
      { message: "User created" },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}