import { marked } from 'marked';
import createDOMPurify from 'dompurify';

export function markdownToHtml(md = '') {
  if (typeof md !== 'string' || !md) return '';
  // Convert markdown to HTML then sanitize
  const html = marked.parse(md);
  try {
    const purify = typeof window !== 'undefined' && createDOMPurify ? createDOMPurify(window) : null;
    if (purify && typeof purify.sanitize === 'function') {
      return purify.sanitize(html, { USE_PROFILES: { html: true } });
    }
    return html;
  } catch (e) {
    console.error('markdownToHtml sanitize error', e);
    return html;
  }
}

export function looksLikeMarkdown(text = '') {
  if (typeof text !== 'string' || !text) return false;
  const mdIndicators = [/^#{1,6}\s+/m, /\*\*.+\*\*/m, /\*.+\*/m, /`{1,3}[^`]+`{1,3}/m, /\[.+\]\(.+\)/m, /^>\s+/m, /-{3,}/m];
  return mdIndicators.some((r) => r.test(text));
}
