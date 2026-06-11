import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/crypto"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const agencyId = searchParams.get("state")
  const error = searchParams.get("error")

  if (error || !code || !agencyId) {
    return NextResponse.redirect(
      new URL("/settings?error=gmail_auth_failed", BASE_URL)
    )
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${BASE_URL}/api/gmail/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        new URL("/settings?error=gmail_no_tokens", BASE_URL)
      )
    }

    oauth2Client.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()
    const gmailEmail = userInfo.data.email

    if (!gmailEmail) {
      return NextResponse.redirect(
        new URL("/settings?error=gmail_no_email", BASE_URL)
      )
    }

    const accessTokenEnc = encrypt(tokens.access_token)
    const refreshTokenEnc = encrypt(tokens.refresh_token)
    const tokenExpiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : null

    await prisma.mailbox.upsert({
      where: {
        // Use a compound search since there's no unique on email alone
        // We'll find by agencyId + email
        id: (
          await prisma.mailbox.findFirst({
            where: { agencyId, email: gmailEmail },
          })
        )?.id ?? "new",
      },
      update: {
        accessTokenEnc,
        refreshTokenEnc,
        tokenExpiresAt,
        status: "ACTIVE",
      },
      create: {
        agencyId,
        email: gmailEmail,
        provider: "GMAIL",
        accessTokenEnc,
        refreshTokenEnc,
        tokenExpiresAt,
        status: "ACTIVE",
      },
    })

    return NextResponse.redirect(
      new URL("/settings?success=gmail_connected", BASE_URL)
    )
  } catch (error) {
    console.error("Gmail callback error:", error)
    return NextResponse.redirect(
      new URL("/settings?error=gmail_callback_failed", BASE_URL)
    )
  }
}
