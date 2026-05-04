import { describe, it, expect } from 'vitest';
import { joinVietnamese } from '../joiner';

describe('joiner', () => {
    it('joins known 2-syllable compounds solidly', () => {
        expect(joinVietnamese('phát hành')).toBe('pháthành');
        expect(joinVietnamese('học sinh')).toBe('họcsinh');
        expect(joinVietnamese('tiếng việt')).toBe('tiếngviệt');
    });

    it('preserves casing', () => {
        expect(joinVietnamese('Học Sinh')).toBe('HọcSinh');
    });

    it('joins all known compounds in a punctuated sentence', () => {
        // "xin chào" and "học sinh" are both known Wiktionary compounds
        expect(joinVietnamese('Xin chào, học sinh!')).toBe('Xinchào, họcsinh!');
    });

    it('handles full sentences', () => {
        const out = joinVietnamese('Trăm năm trong cõi người ta');
        // trăm+năm and người+ta are known compounds; cõi is standalone
        expect(out).toBe('Trămnăm trong cõi ngườita');
    });

    it('inserts apostrophe when greedy coda would mis-parse', () => {
        // "quátrình" → greedy reads "quát" (closed -t), not "quá" → apostrophe needed
        expect(joinVietnamese('quá trình')).toBe("quá'trình");
        // "hệthống" → greedy reads "hệt" (closed -t), not "hệ" → apostrophe needed
        expect(joinVietnamese('hệ thống')).toBe("hệ'thống");
    });

    it('does not insert apostrophe when greedy coda is correct', () => {
        // "chínhxác" → greedy reads "chính" (closed -nh), correct → no apostrophe
        expect(joinVietnamese('chính xác')).toBe('chínhxác');
    });
});
