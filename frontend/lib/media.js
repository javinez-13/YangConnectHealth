export function getMediaUrl(url) {
  if (!url) return url;
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const API_BASE = API_URL.replace(/\/api\/?$/, '');
    if (url.startsWith('http') || url.startsWith('//')) return url;
    if (url.startsWith('/')) return API_BASE + url;
    return url;
  } catch (e) {
    return url;
  }
}
