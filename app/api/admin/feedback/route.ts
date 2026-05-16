import { getAdminAccess } from "@/lib/admin";
import { getPrismaClient } from "@/lib/prisma";

const feedbackStatuses = new Set(["new", "reviewed", "resolved"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FeedbackPatchBody = {
  id?: unknown;
  status?: unknown;
};

function forbiddenResponse() {
  return Response.json({ error: "Access denied." }, { status: 403 });
}

export async function GET(request: Request) {
  const access = await getAdminAccess();

  if (!access.isAdmin) {
    return forbiddenResponse();
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const prisma = getPrismaClient();

  const feedback = await prisma.feedback.findMany({
    where:
      status && feedbackStatuses.has(status)
        ? {
            status,
          }
        : undefined,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      type: true,
      message: true,
      email: true,
      userId: true,
      page: true,
      status: true,
      createdAt: true,
    },
  });

  return Response.json({
    feedback: feedback.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(request: Request) {
  const access = await getAdminAccess();

  if (!access.isAdmin) {
    return forbiddenResponse();
  }

  const body = (await request.json()) as FeedbackPatchBody;
  const id = typeof body.id === "string" ? body.id : "";
  const status = typeof body.status === "string" ? body.status : "";

  if (!id || !feedbackStatuses.has(status)) {
    return Response.json(
      { error: "A valid feedback id and status are required." },
      { status: 400 },
    );
  }

  const prisma = getPrismaClient();
  const feedback = await prisma.feedback.update({
    where: {
      id,
    },
    data: {
      status,
    },
    select: {
      id: true,
      type: true,
      message: true,
      email: true,
      userId: true,
      page: true,
      status: true,
      createdAt: true,
    },
  });

  return Response.json({
    feedback: {
      ...feedback,
      createdAt: feedback.createdAt.toISOString(),
    },
  });
}
