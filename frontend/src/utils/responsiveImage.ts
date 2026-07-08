import { API_BASE_URL } from '../services/api';

export interface ImageSrcSet {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/**
 * Parses an image URL and, if it matches the backend uploads server, generates
 * optimal srcSet and sizes attributes to enable native browser resource resolution.
 * Also dynamically rewrites domain hosts to ensure portability of SQLite dumps.
 * 
 * @param url The image URL (external or local backend)
 * @param sizesAttr The media query sizes specification (default: "100vw")
 */
export function getResponsiveImageProps(url: string | undefined, sizesAttr: string = "100vw"): ImageSrcSet {
  if (!url) {
    return { src: '' };
  }
  
  if (!url.includes('/api/images/')) {
    return { src: url };
  }
  
  // Extract the base path of the image (strip trailing size paths like /original, /480, etc.)
  let base = url.split('?')[0].replace(/\/original$|\/1920$|\/1280$|\/768$|\/480$|\/xl$|\/lg$|\/md$|\/sm$/, '');
  
  // Portability fix: dynamically rewrite the host to match the currently running API base
  const pathIndex = base.indexOf('/api/images/');
  if (pathIndex !== -1) {
    const apiHost = API_BASE_URL.replace(/\/api$/, ''); // e.g. http://localhost:8000
    const imagePath = base.substring(pathIndex); // e.g. /api/images/uuid-xxxx
    
    if (apiHost.startsWith('/')) {
      base = window.location.origin + imagePath;
    } else {
      base = apiHost + imagePath;
    }
  }
  
  const srcSet = [
    `${base}/480 480w`,
    `${base}/768 768w`,
    `${base}/1280 1280w`,
    `${base}/1920 1920w`
  ].join(', ');
  
  return {
    src: `${base}/original`,
    srcSet,
    sizes: sizesAttr
  };
}
