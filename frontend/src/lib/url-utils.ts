const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

/**
 * Prepends the backend API URL to a file path if it's a relative upload path.
 * @param path The file path or URL
 * @returns An absolute URL
 */
export function getFileUrl(path: string | undefined | null): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Ensure relative paths starting with / are handled correctly
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
}
