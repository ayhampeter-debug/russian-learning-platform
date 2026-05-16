"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useExplanationLanguage } from "@/components/LanguageSelector";
import { getUiText, uiTextProps } from "@/lib/ui-translations";

const MAX_MESSAGE_LENGTH = 2000;

type FeedbackType =
  | "bug_report"
  | "suggestion"
  | "content_issue"
  | "translation_issue"
  | "other";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function FeedbackClient() {
  const { language } = useExplanationLanguage();
  const text = getUiText(language);
  const feedbackText = text.feedback;
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const [type, setType] = useState<FeedbackType>("bug_report");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const feedbackOptions = useMemo(
    () => [
      { value: "bug_report", label: feedbackText.bugReport },
      { value: "suggestion", label: feedbackText.suggestion },
      { value: "content_issue", label: feedbackText.contentIssue },
      { value: "translation_issue", label: feedbackText.translationIssue },
      { value: "other", label: feedbackText.other },
    ] satisfies { value: FeedbackType; label: string }[],
    [feedbackText],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setSubmitState("error");
      setErrorMessage(feedbackText.messageRequired);
      return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setSubmitState("error");
      setErrorMessage(feedbackText.messageTooLong);
      return;
    }

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          message: trimmedMessage,
          email: isSignedIn ? "" : email.trim(),
          page: pathname,
        }),
      });

      if (!response.ok) {
        throw new Error("Feedback request failed.");
      }

      setSubmitState("success");
      setMessage("");
      setEmail("");
      setType("bug_report");
    } catch {
      setSubmitState("error");
      setErrorMessage(feedbackText.somethingWentWrong);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <section className="mx-auto max-w-4xl px-4 pb-10 sm:px-6">
        <div className="mb-8" {...uiTextProps(language)}>
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">
            Beta
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl md:text-6xl">
            {feedbackText.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-semibold text-slate-200">
            {feedbackText.intro}
          </p>
          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            {feedbackText.explanation}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl shadow-cyan-950/30 sm:rounded-3xl sm:p-7"
          {...uiTextProps(language)}
        >
          <fieldset className="space-y-3">
            <legend className="text-lg font-black">
              {feedbackText.typeQuestion}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {feedbackOptions.map((option) => {
                const selected = type === option.value;

                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      selected
                        ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-100"
                        : "border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedbackType"
                      value={option.value}
                      checked={selected}
                      onChange={() => setType(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6">
            <label htmlFor="feedback-message" className="text-lg font-black">
              {feedbackText.yourMessage}
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={8}
              className="mt-3 min-h-44 w-full resize-y rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
              required
            />
            <p className="mt-2 text-sm text-slate-500">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </p>
          </div>

          {isLoaded && isSignedIn ? (
            <p className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100">
              {feedbackText.sendingAsAccount}
            </p>
          ) : null}

          {isLoaded && !isSignedIn ? (
            <div className="mt-6">
              <label htmlFor="feedback-email" className="text-lg font-black">
                {feedbackText.optionalEmail}
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
              />
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {feedbackText.anonymousAllowed}
              </p>
            </div>
          ) : null}

          {submitState === "success" ? (
            <div className="mt-6 rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-3 text-green-200">
              <p className="font-black">{feedbackText.feedbackSent}</p>
              <p className="mt-1 text-sm">{feedbackText.thankYou}</p>
            </div>
          ) : null}

          {submitState === "error" ? (
            <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-200">
              <p className="font-black">{feedbackText.somethingWentWrong}</p>
              <p className="mt-1 text-sm">{errorMessage}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitState === "submitting"}
            className="mt-7 w-full rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {feedbackText.submitFeedback}
          </button>
        </form>
      </section>
    </main>
  );
}
