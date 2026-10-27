import { SITE_URL } from "@/components/site";

const names = new Set(["CLS", "FCP", "INP", "LCP", "TTFB"]);
const ratings = new Set(["good", "needs-improvement", "poor"]);
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  // Beacon requests are same-origin. Reject cross-site submissions before logging.
  const origin = request.headers.get("origin");
  // Next.js may construct request.url with an internal hostname. Compare the
  // browser-facing Host as well, so localhost and reverse proxies still work.
  const host = request.headers.get("host");
  const sameHost = host && (origin === `https://${host}` || origin === `http://${host}`);
  if (origin && !sameHost && origin !== new URL(request.url).origin && origin !== SITE_URL) {
    return new Response(null, { status: 403, headers });
  }
  // Bound streamed bodies as well as requests with Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers });
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1024) {
      await reader.cancel();
      return new Response(null, { status: 413, headers });
    }
    chunks.push(value);
  }
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const metric = JSON.parse(new TextDecoder().decode(bytes));
    if (!metric || !names.has(metric.name) || !ratings.has(metric.rating)
      || typeof metric.value !== "number" || !Number.isFinite(metric.value) || metric.value < 0
      || typeof metric.id !== "string" || !/^[\w.-]{1,100}$/.test(metric.id)) {
      return new Response(null, { status: 400, headers });
    }
    // Hosting runtime logs are the first-party monitoring sink. Whitelist fields
    // instead of persisting arbitrary client input or request headers.
    console.info(JSON.stringify({
      event: "web-vital", name: metric.name, value: metric.value,
      rating: metric.rating, id: metric.id,
    }));
    return new Response(null, { status: 204, headers });
  } catch {
    return new Response(null, { status: 400, headers });
  }
}
