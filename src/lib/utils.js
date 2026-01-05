import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import createDOMPurify from 'dompurify';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Use DOMPurify for robust sanitization in the browser
export function sanitizeHtml(input = '') {
  if (typeof input !== 'string') return '';
  try {
    // Create a DOMPurify instance bound to the current window if available
    const purify = typeof window !== 'undefined' && createDOMPurify ? createDOMPurify(window) : null;
    if (purify && typeof purify.sanitize === 'function') {
      return purify.sanitize(input, { USE_PROFILES: { html: true } });
    }
    // Fallback: return input unchanged if sanitizer isn't available
    return input;
  } catch (e) {
    // Fallback to empty string on error
    console.error('sanitizeHtml error', e);
    return '';
  }
}
