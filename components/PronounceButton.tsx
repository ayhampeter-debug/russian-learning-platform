"use client";

export function isRussianText(text: string) {
  return /[\u0400-\u04ff]/.test(text);
}

export function normalizeRussianText(text: string) {
  if (!isRussianText(text)) {
    return text;
  }

  const decodedText = decodeWindows1251Mojibake(text);

  if (decodedText.includes("\ufffd") || !isRussianText(decodedText)) {
    return text;
  }

  return decodedText;
}

function decodeWindows1251Mojibake(text: string) {
  const bytes = Array.from(text, (character) => getWindows1251Byte(character));

  if (bytes.some((byte) => byte === undefined)) {
    return text;
  }

  return new TextDecoder("utf-8").decode(new Uint8Array(bytes as number[]));
}

function getWindows1251Byte(character: string) {
  const codePoint = character.codePointAt(0);

  if (codePoint === undefined) {
    return undefined;
  }

  if (codePoint < 0x80) {
    return codePoint;
  }

  if (codePoint >= 0x0410 && codePoint <= 0x044f) {
    return codePoint - 0x0350;
  }

  const specialCodePoints = [
    0x0402, 0x0403, 0x201a, 0x0453, 0x201e, 0x2026, 0x2020, 0x2021,
    0x20ac, 0x2030, 0x0409, 0x2039, 0x040a, 0x040c, 0x040b, 0x040f,
    0x0452, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
    undefined, 0x2122, 0x0459, 0x203a, 0x045a, 0x045c, 0x045b, 0x045f,
    0x00a0, 0x040e, 0x045e, 0x0408, 0x00a4, 0x0490, 0x00a6, 0x00a7,
    0x0401, 0x00a9, 0x0404, 0x00ab, 0x00ac, 0x00ad, 0x00ae, 0x0407,
    0x00b0, 0x00b1, 0x0406, 0x0456, 0x0491, 0x00b5, 0x00b6, 0x00b7,
    0x0451, 0x2116, 0x0454, 0x00bb, 0x0458, 0x0405, 0x0455, 0x0457,
  ];
  const specialIndex = specialCodePoints.indexOf(codePoint);

  if (specialIndex >= 0) {
    return specialIndex + 0x80;
  }

  return undefined;
}

export function PronounceButton({
  text,
  className = "",
  disabled = false,
  ariaLabel,
  title = "Pronounce Russian",
}: {
  text: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
}) {
  const spokenText = normalizeRussianText(text);
  const speechUnavailable =
    typeof window !== "undefined" &&
    (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window));

  function pronounce() {
    if (
      disabled ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = "ru-RU";
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const russianVoice =
      voices.find((voice) => voice.lang === "ru-RU") ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("ru"));

    if (russianVoice) {
      utterance.voice = russianVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={pronounce}
      disabled={disabled || speechUnavailable}
      aria-label={ariaLabel ?? `Pronounce ${spokenText}`}
      title={speechUnavailable ? "Speech synthesis is not available in this browser" : title}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    </button>
  );
}
