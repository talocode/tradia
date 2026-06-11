const PROD_FALLBACK_ORIGIN = "https://www.tradiaai.app";

function isInternalHost(host: string): boolean {
  const clean = host.trim().toLowerCase();
  return (
    !clean ||
    clean.startsWith("0.0.0.0") ||
    clean.startsWith("127.0.0.1") ||
    clean === "localhost:10000" ||
    clean.endsWith(":10000")
  );
}

function fromConfiguredEnv(): string | null {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL;

  if (!configured?.trim()) return null;
  return configured.trim().replace(/\/$/, "");
}

/** Resolve the public site origin for redirects and email links on Render/proxies. */
export function resolvePublicOrigin(request?: Request): string {
  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host");

    if (host && !isInternalHost(host)) {
      const forwardedProto = request.headers.get("x-forwarded-proto");
      const protocol =
        forwardedProto || (host.includes("localhost") ? "http" : "https");
      return `${protocol}://${host.trim()}`.replace(/\/$/, "");
    }
  }

  return fromConfiguredEnv() || PROD_FALLBACK_ORIGIN;
}