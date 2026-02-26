import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encrypt";
import { getUserFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const user = await getUserFromCookie();
    if (!user)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );

    const body = await req.json();

    const existing = await prisma.task.findFirst({
      where: {
        id: id,
        userId: user.userId,
      },
    });

    if (!existing)
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );

    const updated = await prisma.task.update({
      where: { id: id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && {
          description: encrypt(body.description),
        }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    // console.log("PUT ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;  // ✅ FIX

    const user = getUserFromCookie();
    if (!user)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );

    const existing = await prisma.task.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existing)
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    // console.log("DELETE ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}