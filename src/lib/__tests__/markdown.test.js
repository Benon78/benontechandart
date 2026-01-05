import { JSDOM } from 'jsdom';
import { describe, test, expect } from 'vitest';
const { window } = new JSDOM('<!doctype html><html><body></body></html>');
global.window = window;
global.document = window.document;

import { markdownToHtml, looksLikeMarkdown } from '../markdown';

describe('markdownToHtml', () => {
  test('converts markdown to sanitized HTML', () => {
    const md = '# Title\n\nThis is **bold** and a [link](https://example.com).';
    const out = markdownToHtml(md);
    expect(out).toContain('<h1');
    expect(out).toContain('<strong');
    expect(out).toContain('href="https://example.com"');
  });

  test('detects markdown-like text', () => {
    expect(looksLikeMarkdown('# Heading')).toBe(true);
    expect(looksLikeMarkdown('Just a line')).toBe(false);
  });
});
