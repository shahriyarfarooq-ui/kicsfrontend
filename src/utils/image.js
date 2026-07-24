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

const withApiBase = (path) => `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;

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

  if (/^\/?(?:storage|uploads)\//i.test(normalized)) {
    return encodeUrl(withApiBase(normalized));
  }

  if (normalized.startsWith('/')) {
    return encodeUrl(normalized);
  }

  return encodeUrl(withApiBase(`storage/${normalized}`));
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
