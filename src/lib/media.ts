const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export function getApiOrigin(): string {
  return API_URL.replace(/\/api\/v1\/?$/, '');
}

export function resolveMediaUrl(url: string | null | undefined, fallback = ''): string {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const origin = getApiOrigin();
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
}
