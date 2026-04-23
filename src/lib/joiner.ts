/**
 * Joiner: convert space-separated Vietnamese into solid words, inserting
 * an apostrophe (`'`) between two syllables only when concatenating them
 * would produce a string that *also* splits into a different valid word
 * pair (real ambiguity).
 *
 * Examples
 *   "phát hành"  → "phát'hành"   // because "pháthành" also = "phá" + "thành"
 *   "học sinh"   → "họcsinh"     // no alternative word split exists
 *   "Trăm năm trong cõi người ta" → "Trămnăm trong cõi'người ta" (depends
 *     on which 2-syllable groups exist in the dictionary)
 */
import { isSyllable, splits } from './syllable';
import { isWord, longestWordAt } from './dictionary';

/** Tokenize: split by Unicode whitespace + isolate punctuation runs. */
function tokenize(input: string): Array<{ kind: 'word' | 'space' | 'punct'; text: string }> {
    const tokens: Array<{ kind: 'word' | 'space' | 'punct'; text: string }> = [];
    let i = 0;
    while (i < input.length) {
        const ch = input[i];
        if (/\s/.test(ch)) {
            let j = i;
            while (j < input.length && /\s/.test(input[j])) j++;
            tokens.push({ kind: 'space', text: input.slice(i, j) });
            i = j;
        } else if (/\p{L}/u.test(ch)) {
            let j = i;
            while (j < input.length && /\p{L}/u.test(input[j])) j++;
            tokens.push({ kind: 'word', text: input.slice(i, j) });
            i = j;
        } else {
            // Punctuation / digits / symbols — keep as one run
            let j = i;
            while (
                j < input.length &&
                !/\s/.test(input[j]) &&
                !/\p{L}/u.test(input[j])
            ) j++;
            tokens.push({ kind: 'punct', text: input.slice(i, j) });
            i = j;
        }
    }
    return tokens;
}

/** Concatenate two syllables, inserting `'` iff doing so creates ambiguity. */
function joinPair(left: string, right: string): string {
    const a = left.toLowerCase();
    const b = right.toLowerCase();
    const combined = a + b;
    const alts = splits(combined);
    // Check if any alternative split (other than (a,b) itself) is a real word
    const ambiguous = alts.some(
        ([x, y]) => !(x === a && y === b) && isWord([x, y]),
    );
    return ambiguous ? `${left}'${right}` : `${left}${right}`;
}

/** Join an array of syllable tokens (a single dictionary-word group). */
function joinGroup(syllables: string[]): string {
    if (syllables.length === 0) return '';
    let acc = syllables[0];
    for (let i = 1; i < syllables.length; i++) {
        acc = joinPair(acc, syllables[i]);
    }
    return acc;
}

/**
 * Main entry point. Converts spaced Vietnamese text into solid-word form.
 */
export function joinVietnamese(input: string): string {
    const tokens = tokenize(input);

    // Build a flat list of word-tokens with metadata, separators preserved.
    // Then group consecutive word-tokens (with no intervening punctuation/
    // whitespace other than a single space) into dictionary words.
    let out = '';

    // Pre-compute word-only sequence for greedy matching, while remembering
    // original positions so we can rewrite output.
    const wordIndices: number[] = [];
    const wordNorms: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].kind === 'word') {
            wordIndices.push(i);
            wordNorms.push(tokens[i].text.normalize('NFC').toLowerCase());
        }
    }

    // Determine word-grouping over wordNorms using greedy longest match.
    // group[k] = number of word-tokens that join with wordIndices[k] (>=1).
    const groupSize: number[] = new Array(wordNorms.length).fill(1);
    {
        let k = 0;
        while (k < wordNorms.length) {
            // Only consider grouping consecutive word-tokens that are separated
            // by exactly a single whitespace token (no punctuation in between).
            let maxLen = 1;
            // Determine how many consecutive tokens are whitespace-only adjacent.
            let runEnd = k;
            while (runEnd + 1 < wordNorms.length) {
                const between = tokens.slice(
                    wordIndices[runEnd] + 1,
                    wordIndices[runEnd + 1],
                );
                if (between.length === 1 && between[0].kind === 'space') {
                    runEnd++;
                } else break;
            }
            if (runEnd > k && wordNorms[k] && isSyllable(wordNorms[k])) {
                // try longest dictionary match within [k..runEnd]
                const slice = wordNorms.slice(k, runEnd + 1);
                const m = longestWordAt(slice, 0);
                if (m && m.length > 1) maxLen = m.length;
            }
            groupSize[k] = maxLen;
            k += maxLen;
        }
    }

    // Build output by walking tokens, applying groupings.
    let wordPtr = 0; // index into wordNorms / wordIndices
    let i = 0;
    while (i < tokens.length) {
        const tok = tokens[i];
        if (tok.kind !== 'word') {
            out += tok.text;
            i++;
            continue;
        }
        // We are at wordIndices[wordPtr] === i.
        const size = groupSize[wordPtr];
        if (size === 1) {
            out += tok.text;
            wordPtr++;
            i++;
            continue;
        }
        // Collect raw syllables for the group and join them.
        const rawSyls: string[] = [];
        for (let s = 0; s < size; s++) {
            rawSyls.push(tokens[wordIndices[wordPtr + s]].text);
        }
        out += joinGroup(rawSyls);
        // Advance past the joined group, skipping the separating whitespace.
        const lastIdx = wordIndices[wordPtr + size - 1];
        wordPtr += size;
        i = lastIdx + 1;
    }

    return out;
}
