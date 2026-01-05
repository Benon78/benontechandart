import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import Seo from '../Seo';

// Ensure a DOM environment for Seo
const { window } = new JSDOM('<!doctype html><html><head></head><body></body></html>');
global.window = window;
global.document = window.document;

describe('Seo component', () => {
  test('sets document title and meta description', () => {
    // Ensure no existing description meta
    const existing = document.querySelector('meta[name="description"]');
    if (existing) existing.remove();

    render(<Seo title="Test Title" description="Test description" />);
    expect(document.title).toBe('Test Title');
    const meta = document.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta.content).toBe('Test description');
  });
});
