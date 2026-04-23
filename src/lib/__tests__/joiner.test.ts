import { describe, it, expect } from 'vitest';
import { joinVietnamese } from '../joiner';

describe('joiner', () => {
    it('inserts apostrophe on real ambiguity', () => {
        expect(joinVietnamese('phát hành')).toBe("phát'hành");
    });

    it('joins unambiguous words solidly', () => {
        expect(joinVietnamese('học sinh')).toBe('họcsinh');
        expect(joinVietnamese('tiếng việt')).toBe('tiếngviệt');
    });

    it('preserves casing', () => {
        expect(joinVietnamese('Học Sinh')).toBe('HọcSinh');
    });

    it('preserves punctuation and unknown words', () => {
        expect(joinVietnamese('Xin chào, học sinh!')).toBe('Xin chào, họcsinh!');
    });

    it('handles full sentences', () => {
        const out = joinVietnamese('Trăm năm trong cõi người ta');
        // trăm+năm is a known compound; cõi+người is a known compound
        expect(out).toBe('trămnăm trong cõingười ta'.replace(/^t/, 'T'));
    });
});
