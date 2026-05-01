import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { mistral } from "@ai-sdk/mistral";
import { generateText } from "ai";

export const dynamic = 'force-dynamic';

const VOICE_SYSTEM_PROMPT = `You are Tradia AI, an expert trading coach.
Keep answers concise, practical, and risk-first.
Never claim guaranteed outcomes.`;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const rateLimitBucket = new Map<string, number[]>();

const getClientIp = (req: Request): string => {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0]?.trim() || "unknown-ip";
  }
  return req.headers.get("x-real-ip") || "unknown-ip";
};

const isRateLimited = (key: string): boolean => {
  const now = Date.now();
  const existing = rateLimitBucket.get(key) || [];
  const recent = existing.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitBucket.set(key, recent);
    return true;
  }

  recent.push(now);
  rateLimitBucket.set(key, recent);
  return false;
};

const dataUrlToFile = (audioDataUrl: string): File | null => {
  const match = audioDataUrl.match(/^data:(audio\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;

  const mimeType = match[1];
  const base64Payload = match[2];
  const binaryString = atob(base64Payload);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new File([bytes], "voice-input.webm", { type: mimeType });
};

const transcribeAudioWithOpenAI = async (
  audioDataUrl: string
): Promise<{ transcript: string | null; error: string | null }> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { transcript: null, error: "Audio transcription is unavailable: OPENAI_API_KEY is not configured." };
  }

  const file = dataUrlToFile(audioDataUrl);
  if (!file) {
    return { transcript: null, error: "Audio payload is invalid. Expected base64 data URL." };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");
  formData.append("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = typeof payload?.error?.message === "string"
      ? payload.error.message
      : "Transcription provider rejected audio.";
    return { transcript: null, error: message };
  }

  const payload = await response.json().catch(() => null);
  const transcript = typeof payload?.text === "string" ? payload.text.trim() : "";
  if (!transcript) {
    return { transcript: null, error: "No speech detected in provided audio." };
  }
  return { transcript, error: null };
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limiterKey = `${session.user.id}:${getClientIp(req)}`;
    if (isRateLimited(limiterKey)) {
      return NextResponse.json(
        { error: "Too many voice requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const rawText = typeof body.text === "string" ? body.text.trim() : "";
    const rawAudio = typeof body.audio === "string" ? body.audio.trim() : "";
    const source = rawAudio ? "audio" : "text";

    let transcription = rawText;
    let transcriptionError: string | null = null;
    if (!transcription && rawAudio) {
      const result = await transcribeAudioWithOpenAI(rawAudio);
      transcription = result.transcript || "";
      transcriptionError = result.error;
    }

    if (!transcription) {
      return NextResponse.json(
        {
          error: "No voice input detected",
          message: transcriptionError || "Provide `text` or base64 `audio` payload.",
          source,
        },
        { status: rawAudio ? 422 : 400 }
      );
    }

    const aiResult = await generateText({
      model: mistral("mistral-large-latest") as any,
      system: VOICE_SYSTEM_PROMPT,
      prompt: transcription,
      temperature: 0.3,
      maxTokens: 450,
    });

    return NextResponse.json({
      transcription,
      response: aiResult.text.trim(),
      confidence: 0.9,
      model: "mistral-large-latest",
      source,
    });
  } catch (error) {
    console.error("Voice API error:", error);
    return NextResponse.json(
      { error: "Voice processing failed" },
      { status: 500 }
    );
  }
}