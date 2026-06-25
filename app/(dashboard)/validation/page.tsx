import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EmailStatus } from "@prisma/client"
import ValidationQueue, { type ValidationItem } from "@/components/ValidationQueue"

export const dynamic = "force-dynamic"

export default async function ValidationPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.agencyId) redirect("/login")

  const emails = await prisma.emailMessage.findMany({
    where: {
      status: EmailStatus.DRAFT_READY,
      mailbox: { agencyId: session.user.agencyId },
      draft: { isNot: null },
    },
    include: { draft: true },
    orderBy: { receivedAt: "desc" },
    take: 50,
  })

  const items: ValidationItem[] = emails
    .filter((e) => e.draft)
    .map((e) => ({
      draftId: e.draft!.id,
      from: e.from,
      subject: e.subject,
      body: e.bodyText ?? e.snippet ?? "",
      category: e.category,
      priority: e.priority,
      receivedAt: e.receivedAt.toISOString(),
      draftContent: e.draft!.editedContent || e.draft!.content,
    }))

  return (
    <div className="flex flex-col min-h-full">
      {/* Topbar */}
      <div className="h-[60px] border-b border-line px-6 md:px-7 flex items-center shrink-0">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Brouillons à valider</h1>
          <p className="text-[12.5px] text-zinc-500 mt-px">
            {items.length > 0
              ? `${items.length} réponse${items.length > 1 ? "s" : ""} en attente de votre validation`
              : "Aucun brouillon en attente pour l'instant"}
          </p>
        </div>
      </div>

      <div className="p-6 md:p-7 max-w-5xl w-full mx-auto animate-fade-up">
        <ValidationQueue items={items} />
      </div>
    </div>
  )
}
