import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LanguageDescription } from '@codemirror/language';
import { getLanguage, supportedLanguages } from './languages';

describe('languages', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Mock window for SSR tests
    global.window = originalWindow;
  });

  afterEach(() => {
    // Restore window
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  describe('getLanguage', () => {
    it('returns undefined during SSR', async () => {
      // Remove window to simulate SSR
      global.window = undefined as any;
      const result = await getLanguage('test.ts');
      expect(result).toBeUndefined();
    });

    it('returns undefined for unsupported file extensions', async () => {
      const result = await getLanguage('test.unknown');
      expect(result).toBeUndefined();
    });

    it('handles errors gracefully', async () => {
      const loggerSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock LanguageDescription.matchFilename to throw an error
      const originalMatchFilename = vi.spyOn(LanguageDescription, 'matchFilename');
      originalMatchFilename.mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = await getLanguage('test.ts');
      
      expect(result).toBeUndefined();
      expect(loggerSpy).toHaveBeenCalled();
      
      // Restore the original implementation
      originalMatchFilename.mockRestore();
    });

    it('handles module loading errors gracefully', async () => {
      const loggerSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Find TypeScript language description
      const tsLang = supportedLanguages.find(l => l.name === 'TS');
      expect(tsLang).toBeDefined();

      // Force the load function to throw
      const result = await tsLang!.load().catch(e => undefined);
      
      expect(result).toBeUndefined();
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('prevents language loading during SSR for all languages', async () => {
      // Remove window to simulate SSR
      global.window = undefined as any;
      const loggerSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Try to load each language
      for (const lang of supportedLanguages) {
        const result = await lang.load().catch(e => e);
        expect(result).toBeInstanceOf(Error);
        expect(result.message).toBe('Cannot load language module during SSR');
      }

      expect(loggerSpy).not.toHaveBeenCalled();
    });
  });

  describe('supportedLanguages', () => {
    it('includes all expected language descriptions', () => {
      const expectedLanguages = new Set([
        'TS', 'JS', 'TSX', 'JSX', 'HTML', 'CSS',
        'SASS', 'SCSS', 'JSON', 'Markdown', 'Wasm',
        'Python', 'C++'
      ]);

      const actualLanguages = new Set(supportedLanguages.map(lang => lang.name));
      expect(actualLanguages).toEqual(expectedLanguages);
      expect(actualLanguages.size).toBe(expectedLanguages.size);
    });

    it('maps file extensions correctly', () => {
      const extensionMap = new Map([
        ['test.ts', 'TS'],
        ['test.js', 'JS'],
        ['test.tsx', 'TSX'],
        ['test.jsx', 'JSX'],
        ['test.html', 'HTML'],
        ['test.css', 'CSS'],
        ['test.sass', 'SASS'],
        ['test.scss', 'SCSS'],
        ['test.json', 'JSON'],
        ['test.md', 'Markdown'],
        ['test.wat', 'Wasm'],
        ['test.py', 'Python'],
        ['test.cpp', 'C++']
      ]);

      for (const [filename, expectedLang] of extensionMap) {
        const lang = supportedLanguages.find(l => 
          l.extensions.some(ext => filename.endsWith(`.${ext}`))
        );
        expect(lang?.name).toBe(expectedLang);
      }
    });

    it('handles multiple extensions for JavaScript', () => {
      const jsExtensions = ['js', 'mjs', 'cjs'];
      const jsLang = supportedLanguages.find(l => l.name === 'JS');

      expect(jsLang).toBeDefined();
      expect(jsLang?.extensions).toEqual(jsExtensions);
    });
  });
});
