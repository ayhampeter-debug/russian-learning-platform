"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";

type FeedbackStatus = "new" | "reviewed" | "resolved";
type FeedbackFilter = "all" | FeedbackStatus;

type FeedbackItem = {
  id: string;
  type: string;
  message: string;
  email: string | null;
  userId: string | null;
  page: string | null;
  status: string;
  createdAt: string;
};

type LoadState = "loading" | "ready" | "error";

const filters: { value: FeedbackFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
];

const statusLabels: Record<FeedbackStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function FeedbackAdminClient({
  adminEmail,
}: {
  adminEmail: string | null;
}) {
  const [filter, setFilter] = useState<FeedbackFilter>("all");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeedback() {
      setLoadState("loading");
      setErrorMessage("");

      try {
        const query = filter === "all" ? "" : `?status=${filter}`;
        const response = await fetch(`/api/admin/feedback${query}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Feedback could not be loaded.");
        }

        const data = (await response.json()) as { feedback: FeedbackItem[] };
        setFeedback(data.feedback);
        setLoadState("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadState("error");
        setErrorMessage("Feedback could not be loaded.");
      }
    }

    loadFeedback();

    return () => controller.abort();
  }, [filter]);

  async function updateStatus(id: string, status: FeedbackStatus) {
    setUpdatingId(id);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error("Feedback status could not be updated.");
      }

      const data = (await response.json()) as { feedback: FeedbackItem };
      setFeedback((current) =>
        current
          .map((item) => (item.id === id ? data.feedback : item))
          .filter((item) => filter === "all" || item.status === filter),
      );
    } catch {
      setErrorMessage("Feedback status could not be updated.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
              Admin
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              Feedback management
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Review beta reports, triage issues, and mark resolved feedback.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-300">
            Signed in as{" "}
            <span className="font-bold text-white">{adminEmail ?? "admin"}</span>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {filters.map((item) => {
            const selected = filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                  selected
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-400/10"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl shadow-cyan-950/20 sm:rounded-3xl">
          {loadState === "loading" ? (
            <div className="p-6 text-slate-300" role="status" aria-live="polite">
              Loading beta feedback...
            </div>
          ) : null}

          {loadState === "error" ? (
            <div className="p-6 text-slate-300">
              Feedback is not available right now. Confirm the admin account is
              signed in, then try again.
            </div>
          ) : null}

          {loadState === "ready" && feedback.length === 0 ? (
            <div className="p-6 text-slate-300">
              No feedback found for this filter.
            </div>
          ) : null}

          {loadState === "ready" && feedback.length > 0 ? (
            <div className="divide-y divide-white/10">
              {feedback.map((item) => (
                <FeedbackCard
                  key={item.id}
                  feedback={item}
                  disabled={updatingId === item.id}
                  onUpdate={updateStatus}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function FeedbackCard({
  feedback,
  disabled,
  onUpdate,
}: {
  feedback: FeedbackItem;
  disabled: boolean;
  onUpdate: (id: string, status: FeedbackStatus) => void;
}) {
  const status = isFeedbackStatus(feedback.status) ? feedback.status : "new";

  return (
    <article className="grid gap-5 p-5 lg:grid-cols-[1fr_17rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-100">
            {formatType(feedback.type)}
          </span>
          <StatusPill status={status} />
          <span className="text-sm text-slate-500">
            {dateFormatter.format(new Date(feedback.createdAt))}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-slate-100">
          {feedback.message}
        </p>
      </div>

      <aside className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <dl className="grid gap-3 text-sm">
          <MetaLine label="Email" value={feedback.email} />
          <MetaLine label="User ID" value={feedback.userId} />
          <MetaLine label="Page" value={feedback.page} />
          <MetaLine label="Status" value={statusLabels[status]} />
        </dl>
        <div className="mt-5 grid gap-2">
          <button
            type="button"
            disabled={disabled || status === "reviewed"}
            onClick={() => onUpdate(feedback.id, "reviewed")}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark as reviewed
          </button>
          <button
            type="button"
            disabled={disabled || status === "resolved"}
            onClick={() => onUpdate(feedback.id, "resolved")}
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark as resolved
          </button>
        </div>
      </aside>
    </article>
  );
}

function MetaLine({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="font-bold text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-slate-100">{value || "Not provided"}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: FeedbackStatus }) {
  const className = {
    new: "border-yellow-400/25 bg-yellow-400/10 text-yellow-200",
    reviewed: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
    resolved: "border-green-400/25 bg-green-400/10 text-green-200",
  }[status];

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${className}`}>
      {statusLabels[status]}
    </span>
  );
}

function isFeedbackStatus(status: string): status is FeedbackStatus {
  return status === "new" || status === "reviewed" || status === "resolved";
}

function formatType(type: string) {
  return type
    .split("_")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
