/** Resolve stored photo paths to a full URL for img src. */
export function resolvePhotoUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}
