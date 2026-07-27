import { API_BASE_URL } from '../services/api';

export const DEFAULT_IMAGE_FALLBACK = 'https://placehold.co/600x320/4a1209/fae3de?text=KICS';

const absoluteUrlPattern = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;

const encodeUrl = (url) => {
  try {
    return encodeURI(url);
  } catch {
    return url;
  }
};

// ✅ FIX: Create a storage URL without /api
const getStorageBaseUrl = () => {
  // Remove /api from the end of API_BASE_URL
  const base = API_BASE_URL.replace(/\/api$/, '').replace(/\/api\/$/, '');
  return base;
};

const withStorageBase = (path) => `${getStorageBaseUrl()}/${path.replace(/^\/+/, '')}`;

export const buildImageUrl = (value, fallback = DEFAULT_IMAGE_FALLBACK) => {
  if (value === null || value === undefined) return fallback;

  const image = String(value).trim();
  if (!image) return fallback;

  if (
    absoluteUrlPattern.test(image) ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return encodeUrl(image);
  }

  const normalized = image
    .replace(/\\/g, '/')
    .replace(/^public\//i, '')
    .replace(/^storage\/app\/public\//i, 'storage/')
    .replace(/^app\/public\//i, 'storage/');

  // Check if it's already a storage path
  if (/^\/?(?:storage|uploads)\//i.test(normalized)) {
    // Use storage base URL (without /api)
    return encodeUrl(withStorageBase(normalized));
  }

  if (normalized.startsWith('/')) {
    return encodeUrl(normalized);
  }

  // Default: add storage prefix and use storage base URL
  return encodeUrl(withStorageBase(`storage/${normalized}`));
};

export const getImageLoadingProps = ({
  eager = false,
  priority = eager ? 'high' : 'auto',
  sizes = '100vw',
} = {}) => ({
  loading: eager ? 'eager' : 'lazy',
  decoding: eager ? 'sync' : 'async',
  fetchpriority: priority,
  sizes,
});