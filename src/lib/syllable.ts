/**
 * Vietnamese syllable utilities.
 *
 * Backed by the generated `src/data/syllables.json`. Provides:
 *   - isSyllable(s): whether s is a recognized lowercase syllable
 *   - splits(s): all (a,b) splits where both halves are syllables
 */
import syllableList from '../data/syllables.json';

const SYLLABLES: Set<string> = new Set(
    (syllableList as string[]).map((s) => s.normalize('NFC')),
);

export function isSyllable(s: string): boolean {
    return SYLLABLES.has(s.normalize('NFC').toLowerCase());
}

/** Returns all 2-syllable splits (a,b) of `s` where both are valid. */
export function splits(s: string): Array<[string, string]> {
    const norm = s.normalize('NFC').toLowerCase();
    const out: Array<[string, string]> = [];
    for (let i = 1; i < norm.length; i++) {
        const a = norm.slice(0, i);
        const b = norm.slice(i);
        if (SYLLABLES.has(a) && SYLLABLES.has(b)) out.push([a, b]);
    }
    return out;
}
