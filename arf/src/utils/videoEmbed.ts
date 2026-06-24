const YT_ID = /^[a-zA-Z0-9_-]{11}$/;

function isYouTubeVideoId(s: string): boolean {
  return YT_ID.test(s);
}

/** Parse YouTube `t` / time strings into seconds (best effort). */
function parseTimeToSeconds(t: string): number | null {
  const trimmed = t.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^\d+s$/i.test(trimmed)) return parseInt(trimmed, 10);
  let sec = 0;
  const h = trimmed.match(/(\d+)\s*h/i);
  const m = trimmed.match(/(\d+)\s*m/i);
  const s = trimmed.match(/(\d+)\s*s/i);
  if (h) sec += parseInt(h[1], 10) * 3600;
  if (m) sec += parseInt(m[1], 10) * 60;
  if (s) sec += parseInt(s[1], 10);
  if (h || m || s) return sec;
  const n = parseInt(trimmed, 10);
  return Number.isFinite(n) ? n : null;
}

function readStartSeconds(params: URLSearchParams): number | undefined {
  const start = params.get('start');
  if (start != null && /^\d+$/.test(start)) return parseInt(start, 10);
  const t = params.get('t');
  if (t != null) {
    const sec = parseTimeToSeconds(t);
    if (sec != null) return sec;
  }
  return undefined;
}

export function normalizeVideoUrlInput(raw: string): string {
  let u = raw.trim();
  if (!u) return u;
  if (isYouTubeVideoId(u)) return u;
  if (u.startsWith('//')) u = `https:${u}`;
  if (!/^https?:\/\//i.test(u)) {
    if (/youtube\.com|youtu\.be|youtube-nocookie\.com/i.test(u)) {
      u = `https://${u.replace(/^\/+/, '')}`;
    }
  }
  return u;
}

export interface ParsedYouTube {
  videoId: string;
  start?: number;
  end?: number;
}

export function parseYouTube(raw: string): ParsedYouTube | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (isYouTubeVideoId(trimmed)) {
    return { videoId: trimmed };
  }

  const input = normalizeVideoUrlInput(trimmed);
  if (isYouTubeVideoId(input)) {
    return { videoId: input };
  }

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (id && isYouTubeVideoId(id)) {
        const start = readStartSeconds(url.searchParams);
        return start != null ? { videoId: id, start } : { videoId: id };
      }
      return null;
    }

    const isYouTubeHost =
      host.endsWith('youtube.com') || host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com');
    if (!isYouTubeHost) return null;

    const path = url.pathname;
    const params = url.searchParams;

    const fromPath = (prefix: string): string | null => {
      if (!path.startsWith(prefix)) return null;
      const rest = path.slice(prefix.length).split('/')[0];
      const id = rest?.split('?')[0];
      return id && isYouTubeVideoId(id) ? id : null;
    };

    let videoId: string | null =
      fromPath('/embed/') ||
      fromPath('/shorts/') ||
      fromPath('/live/') ||
      fromPath('/v/');

    if (!videoId) {
      const v = params.get('v');
      if (v && isYouTubeVideoId(v)) videoId = v;
    }

    if (!videoId) return null;

    const start = readStartSeconds(params);
    let end: number | undefined;
    const endParam = params.get('end');
    if (endParam && /^\d+$/.test(endParam)) {
      end = parseInt(endParam, 10);
    }

    const out: ParsedYouTube = { videoId };
    if (start !== undefined) out.start = start;
    if (end !== undefined) out.end = end;
    return out;
  } catch {
    return null;
  }
}

const NOCOOKIE_BASE = 'https://www.youtube-nocookie.com/embed';

export function getYouTubeNoCookieEmbedUrl(raw: string): string | null {
  const parsed = parseYouTube(raw);
  if (!parsed) return null;

  const q = new URLSearchParams();
  q.set('modestbranding', '1');
  q.set('rel', '0');
  if (parsed.start != null) q.set('start', String(parsed.start));
  if (parsed.end != null) q.set('end', String(parsed.end));

  const qs = q.toString();
  return `${NOCOOKIE_BASE}/${parsed.videoId}${qs ? `?${qs}` : ''}`;
}

/** Vimeo, Dailymotion, Google Drive — not YouTube (handle YouTube via getYouTubeNoCookieEmbedUrl). */
export function getOtherPlatformEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;
  const normalized = normalizeVideoUrlInput(url);
  if (parseYouTube(normalized)) return null;

  const u = normalized;
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  const dmMatch = u.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/i);
  if (dmMatch) {
    return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
  }

  const driveMatch = u.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  return null;
}

const VIDEO_EXT = /\.(mp4|webm|ogg|m4v|mov)(\?|$)/i;

export function looksLikeDirectVideoFile(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (parseYouTube(u) || parseYouTube(normalizeVideoUrlInput(u))) return false;
  if (getOtherPlatformEmbedUrl(u)) return false;
  if (VIDEO_EXT.test(u)) return true;
  if (u.startsWith('/') && !u.includes('://')) return true;
  return false;
}
