import { prisma } from "@/lib/db";
import { taskSchema } from "@/lib/validators";
import { encrypt, decrypt } from "@/lib/encrypt";
import { getUserFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { TaskStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );

    const body = await req.json();
    const parsed = taskSchema.parse(body);

    const encryptedDescription = encrypt(parsed.description);

    const task = await prisma.task.create({
      data: {
        title: parsed.title,
        description: encryptedDescription,
        status: parsed.status || "PENDING",
        userId: user.userId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Prisma.TaskWhereInput = {
      userId: user.userId,
    };

    if (status) where.status = status as TaskStatus;

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.task.count({ where });

    const decryptedTasks = tasks.map((task) => ({
      ...task,
      description: decrypt(task.description),
    }));

    return NextResponse.json(
      {
        data: decryptedTasks,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}