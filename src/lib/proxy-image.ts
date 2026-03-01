/**
 * Wraps an external image URL through our proxy to avoid
 * Vercel's OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED error.
 */
export function proxyImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Local/relative URLs don't need proxying
  if (url.startsWith("/")) return url;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}
