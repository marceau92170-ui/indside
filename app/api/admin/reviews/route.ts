import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Modération d'un avis : approve | reject. Réservé à l'admin.
export async function POST(req: Request) {
  const me = await currentUser();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  const action = String(form.get("action") ?? "");

  if (id && (action === "approve" || action === "reject")) {
    await prisma.review.update({
      where: { id },
      data: { status: action === "approve" ? "approved" : "rejected" },
    });
    // Rafraîchit la landing immédiatement pour refléter l'avis publié/retiré.
    revalidatePath("/");
  }

  // 303 : après un POST de formulaire, on redirige en GET vers la page de modération.
  return NextResponse.redirect(new URL("/admin/avis", req.url), 303);
}
