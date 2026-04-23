/**
 * Multi-syllable Vietnamese word dictionary.
 *
 * Loaded synchronously from the bundled JSON. Provides word lookup and
 * longest-match queries used by the joiner.
 */
import wordData from '../data/words.json';

interface WordFile {
    words: string[][];
}

const WORDS: string[][] = (wordData as WordFile).words.map((w) =>
    w.map((s) => s.normalize('NFC').toLowerCase()),
);

// Index: first syllable → list of full word arrays starting with it.
// Each entry is sorted by descending length so longest-match comes first.
const INDEX = new Map<string, string[][]>();
for (const w of WORDS) {
    const key = w[0];
    const list = INDEX.get(key) ?? [];
    list.push(w);
    INDEX.set(key, list);
}
for (const list of INDEX.values()) {
    list.sort((a, b) => b.length - a.length);
}

/** Whether the given sequence of lowercase syllables is a known word. */
export function isWord(parts: string[]): boolean {
    if (parts.length < 2) return false;
    const candidates = INDEX.get(parts[0].toLowerCase());
    if (!candidates) return false;
    outer: for (const w of candidates) {
        if (w.length !== parts.length) continue;
        for (let i = 0; i < w.length; i++) {
            if (w[i] !== parts[i].toLowerCase()) continue outer;
        }
        return true;
    }
    return false;
}

/**
 * Return the longest dictionary word starting at tokens[i] (exclusive end
 * index returned). If no word matches, returns null.
 */
export function longestWordAt(
    tokens: string[],
    i: number,
): { length: number } | null {
    const first = tokens[i]?.toLowerCase();
    if (!first) return null;
    const candidates = INDEX.get(first);
    if (!candidates) return null;
    outer: for (const w of candidates) {
        if (i + w.length > tokens.length) continue;
        for (let k = 0; k < w.length; k++) {
            if (w[k] !== tokens[i + k].toLowerCase()) continue outer;
        }
        return { length: w.length };
    }
    return null;
}
