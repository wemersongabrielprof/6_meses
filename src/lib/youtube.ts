const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;
const youtubeHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function parseYouTubeVideoId(value: string) {
  const candidate = value.trim();
  if (youtubeIdPattern.test(candidate)) return candidate;

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (youtubeHosts.has(host)) {
      videoId = url.searchParams.get("v");
      if (!videoId) {
        const segments = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(segments[0] ?? "")) videoId = segments[1] ?? null;
      }
    }

    return videoId && youtubeIdPattern.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export function buildYouTubeEmbedUrl(videoId: string, origin: string) {
  if (!youtubeIdPattern.test(videoId)) throw new Error("ID do YouTube inválido.");
  const params = new URLSearchParams({
    autoplay: "1",
    enablejsapi: "1",
    origin,
    playsinline: "1",
    rel: "0",
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function buildYouTubeWatchUrl(videoId: string) {
  if (!youtubeIdPattern.test(videoId)) return "https://www.youtube.com/";
  return `https://www.youtube.com/watch?v=${videoId}`;
}
