import { describe, it, expect } from 'vitest';
import { telexToUnicode } from '../telex';

describe('telex', () => {
    it('applies vowel modifiers', () => {
        expect(telexToUnicode('aa')).toBe('â');
        expect(telexToUnicode('aw')).toBe('ă');
        expect(telexToUnicode('ee')).toBe('ê');
        expect(telexToUnicode('oo')).toBe('ô');
        expect(telexToUnicode('ow')).toBe('ơ');
        expect(telexToUnicode('uw')).toBe('ư');
        expect(telexToUnicode('dd')).toBe('đ');
    });

    it('applies tones to last vowel', () => {
        expect(telexToUnicode('as')).toBe('á');
        expect(telexToUnicode('af')).toBe('à');
        expect(telexToUnicode('ar')).toBe('ả');
        expect(telexToUnicode('ax')).toBe('ã');
        expect(telexToUnicode('aj')).toBe('ạ');
    });

    it('handles common words', () => {
        expect(telexToUnicode('tieengs')).toBe('tiếng');
        expect(telexToUnicode('vieetj')).toBe('việt');
        expect(telexToUnicode('tieengs vieetj')).toBe('tiếng việt');
        expect(telexToUnicode('chuwx')).toBe('chữ');
        expect(telexToUnicode('ddoongf')).toBe('đồng');
    });

    it('preserves punctuation and whitespace', () => {
        expect(telexToUnicode('Xin chaof, banj!')).toBe('Xin chào, bạn!');
    });
});
