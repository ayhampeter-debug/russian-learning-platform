import { syncCurrentUser } from "@/lib/current-user";
import { getPrismaClient } from "@/lib/prisma";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 254;
const MAX_PAGE_LENGTH = 300;

const feedbackTypes = new Set([
  "bug_report",
  "suggestion",
  "content_issue",
  "translation_issue",
  "other",
]);

export const runtime = "nodejs";

type FeedbackRequestBody = {
  type?: unknown;
  message?: unknown;
  email?: unknown;
  page?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FeedbackRequestBody;
    const type = typeof body.type === "string" ? body.type : "other";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const page = typeof body.page === "string" ? body.page.trim() : "";

    if (!message) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return Response.json({ error: "Message is too long." }, { status: 400 });
    }

    if (email.length > MAX_EMAIL_LENGTH || page.length > MAX_PAGE_LENGTH) {
      return Response.json({ error: "Invalid feedback payload." }, { status: 400 });
    }

    const { user } = await syncCurrentUser();
    const prisma = getPrismaClient();

    const feedback = await prisma.feedback.create({
      data: {
        type: feedbackTypes.has(type) ? type : "other",
        message,
        email: user ? null : email || null,
        userId: user?.id ?? null,
        page: page || null,
      },
      select: {
        id: true,
      },
    });

    return Response.json({ ok: true, id: feedback.id });
  } catch (error) {
    console.warn("Feedback submission failed.", error);

    return Response.json(
      { error: "Feedback could not be saved." },
      { status: 500 },
    );
  }
}
