import { JSDOM } from 'jsdom';
import { describe, test, expect } from 'vitest';

// Setup a DOM for DOMPurify
const { window } = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;
global.document = window.document;

import { sanitizeHtml } from '../utils';

describe('sanitizeHtml', () => {
  test('removes script tags and event handlers', () => {
    const dangerous = '<div onclick="alert(1)">Click</div><script>alert(2)</script><p>Safe</p>';
    const out = sanitizeHtml(dangerous);
    expect(out).toContain('Click');
    expect(out).toContain('Safe');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('onclick');
  });

  test('removes javascript: URIs', () => {
    const dangerous = '<a href="javascript:alert(1)">link</a>';
    const out = sanitizeHtml(dangerous);
    expect(out).toContain('link');
    expect(out).not.toContain('javascript:alert');
  });
});
