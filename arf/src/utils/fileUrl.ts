/**
 * Converts a relative file path (e.g. /uploads/thumbnails/...) into a full URL
 * pointing to the API backend server where the files are actually hosted.
 * 
 * Without this, the browser resolves relative paths against the frontend domain,
 * which doesn't serve the uploaded files.
 */
export const getFileUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
};
