import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  title: z.string().min(2).max(120),
  targetDate: z.string().nullable(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const count = await prisma.goal.count({ where: { userId: user.id, done: false } });
  if (count >= 5) {
    return NextResponse.json({ error: "Limite de 5 objectifs actifs à la fois — termines-en un d'abord." }, { status: 400 });
  }

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
    },
  });

  return NextResponse.json({ ok: true, goal });
}

const UpdateSchema = z.object({ id: z.string().min(1), done: z.boolean() });

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = UpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const goal = await prisma.goal.findFirst({ where: { id: parsed.data.id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.goal.update({
    where: { id: goal.id },
    data: { done: parsed.data.done, doneAt: parsed.data.done ? new Date() : null },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({ id: null }));
  if (typeof id !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 });

  await prisma.goal.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
