import { describe, it, expect } from 'vitest';
import { isSyllable, splits } from '../syllable';

describe('syllable', () => {
    it('recognizes common syllables', () => {
        expect(isSyllable('phát')).toBe(true);
        expect(isSyllable('hành')).toBe(true);
        expect(isSyllable('phá')).toBe(true);
        expect(isSyllable('thành')).toBe(true);
        expect(isSyllable('học')).toBe(true);
        expect(isSyllable('sinh')).toBe(true);
    });

    it('finds ambiguous splits', () => {
        const s = splits('pháthành');
        const stringified = s.map(([a, b]) => `${a}+${b}`);
        expect(stringified).toContain('phát+hành');
        expect(stringified).toContain('phá+thành');
    });
});
