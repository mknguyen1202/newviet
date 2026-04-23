/**
 * Telex → Unicode Vietnamese converter.
 *
 * This is a "smart" incremental converter that operates on a whole string
 * (suitable for controlled inputs that re-process on every keystroke).
 *
 * Rules implemented:
 *   - Vowel modifiers within the current syllable:
 *       aa → â,  aw → ă,  ee → ê,  oo → ô,  ow → ơ,  uw → ư,  dd → đ
 *   - Tone marks attached to the *last* applicable vowel of the current
 *     syllable run:
 *       s → sắc (´),  f → huyền (`),  r → hỏi (̉),  x → ngã (~),  j → nặng (.)
 *       z → remove tone
 *   - Double-key undo: typing the trigger key again restores the literal
 *     letter (e.g. "aaa" → "aa", "oss" → "ós" + literal "s" → "óss"? No;
 *     standard Telex: "aa" → â; typing another "a" yields "âa" (literal).
 *     We follow the common convention: if the trigger key would re-trigger
 *     on the same vowel, instead emit the original key.
 *
 * Notes:
 *   - Telex tone keys only apply when followed by a non-letter or end of
 *     run; they may be applied repeatedly as you type more letters.
 *   - We apply transformations syllable-by-syllable, where a "syllable" is
 *     a maximal run of Vietnamese-letter characters (incl. the tone keys
 *     s/f/r/x/j/z and modifiers w).
 */

const TONE_TABLE: Record<string, string[]> = {
    // base: [level, sắc, huyền, hỏi, ngã, nặng]
    a: ['a', 'á', 'à', 'ả', 'ã', 'ạ'],
    ă: ['ă', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ'],
    â: ['â', 'ấ', 'ầ', 'ẩ', 'ẫ', 'ậ'],
    e: ['e', 'é', 'è', 'ẻ', 'ẽ', 'ẹ'],
    ê: ['ê', 'ế', 'ề', 'ể', 'ễ', 'ệ'],
    i: ['i', 'í', 'ì', 'ỉ', 'ĩ', 'ị'],
    o: ['o', 'ó', 'ò', 'ỏ', 'õ', 'ọ'],
    ô: ['ô', 'ố', 'ồ', 'ổ', 'ỗ', 'ộ'],
    ơ: ['ơ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ'],
    u: ['u', 'ú', 'ù', 'ủ', 'ũ', 'ụ'],
    ư: ['ư', 'ứ', 'ừ', 'ử', 'ữ', 'ự'],
    y: ['y', 'ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ'],
};

// Reverse: any toned vowel → [base, toneIndex]
const TONE_LOOKUP: Record<string, [string, number]> = {};
for (const [base, list] of Object.entries(TONE_TABLE)) {
    list.forEach((v, i) => {
        TONE_LOOKUP[v] = [base, i];
        TONE_LOOKUP[v.toUpperCase()] = [base.toUpperCase(), i];
    });
}

const TONE_KEYS: Record<string, number> = {
    s: 1, f: 2, r: 3, x: 4, j: 5, z: 0,
};

function stripTone(ch: string): { base: string; tone: number } {
    const hit = TONE_LOOKUP[ch];
    if (hit) return { base: hit[0], tone: hit[1] };
    return { base: ch, tone: 0 };
}

function applyToneToBase(base: string, tone: number): string {
    const lower = base.toLowerCase();
    const table = TONE_TABLE[lower];
    if (!table) return base;
    const toned = table[tone] ?? table[0];
    return base === lower ? toned : toned.toUpperCase();
}

function isVowelChar(ch: string): boolean {
    if (!ch) return false;
    const lower = stripTone(ch).base.toLowerCase();
    return 'aăâeêioôơuưy'.includes(lower);
}

function isLetter(ch: string): boolean {
    return /\p{L}/u.test(ch);
}

/**
 * Locate index of the "main" vowel within the syllable for tone placement.
 * Mirrors `tonePosition` in build-data.ts but operates on toned chars.
 */
function tonePosition(syl: string[]): number {
    // priority 1: ơ or ê
    for (let i = 0; i < syl.length; i++) {
        const b = stripTone(syl[i]).base.toLowerCase();
        if (b === 'ơ' || b === 'ê') return i;
    }
    // priority 2: a/ă/â/e/o/ô
    for (let i = 0; i < syl.length; i++) {
        const b = stripTone(syl[i]).base.toLowerCase();
        if ('aăâeoô'.includes(b)) return i;
    }
    // collect vowel indices
    const vIdx: number[] = [];
    for (let i = 0; i < syl.length; i++) if (isVowelChar(syl[i])) vIdx.push(i);
    if (vIdx.length === 0) return -1;
    if (vIdx.length === 1) return vIdx[0];
    const lastIsVowel = isVowelChar(syl[syl.length - 1]);
    return lastIsVowel ? vIdx[0] : vIdx[vIdx.length - 1];
}

/** Apply tone N to a syllable (array of grapheme chars). */
function applyToneToSyllable(syl: string[], tone: number): string[] {
    const idx = tonePosition(syl);
    if (idx < 0) return syl;
    const { base } = stripTone(syl[idx]);
    const next = syl.slice();
    next[idx] = applyToneToBase(base, tone);
    // If the syllable already had a tone elsewhere, clear it (Vietnamese
    // syllables only carry one tone). For simplicity we strip tones from all
    // other vowels.
    for (let i = 0; i < next.length; i++) {
        if (i === idx) continue;
        if (isVowelChar(next[i])) {
            const stripped = stripTone(next[i]);
            next[i] = stripped.base;
        }
    }
    return next;
}

/** Process a single Telex syllable run (only Vietnamese letters + tone keys). */
function processSyllable(input: string): string {
    // Use array of single chars — we only deal with BMP characters here.
    const out: string[] = [];
    let currentTone = 0;

    for (let i = 0; i < input.length; i++) {
        const ch = input[i];

        // Vowel modifiers: aa/ee/oo/ow/aw/uw and dd
        if (out.length > 0) {
            const prev = out[out.length - 1];
            const prevLower = prev.toLowerCase();
            const upper = ch === ch.toUpperCase() && ch !== ch.toLowerCase();

            // Double-key undo: trigger key followed by same → emit literal
            if (
                (ch === 'a' || ch === 'A') && prevLower === 'â'
            ) { out[out.length - 1] = upper ? 'A' : 'a'; out.push(ch); continue; }
            if (
                (ch === 'e' || ch === 'E') && prevLower === 'ê'
            ) { out[out.length - 1] = upper ? 'E' : 'e'; out.push(ch); continue; }
            if (
                (ch === 'o' || ch === 'O') && prevLower === 'ô'
            ) { out[out.length - 1] = upper ? 'O' : 'o'; out.push(ch); continue; }
            if (
                (ch === 'w' || ch === 'W') && (prevLower === 'ă' || prevLower === 'ơ' || prevLower === 'ư')
            ) { out[out.length - 1] = mapBackForW(prev); out.push(ch); continue; }
            if (
                (ch === 'd' || ch === 'D') && (prev === 'đ' || prev === 'Đ')
            ) { out[out.length - 1] = prev === 'đ' ? 'd' : 'D'; out.push(ch); continue; }

            // Modifiers
            if ((ch === 'a' || ch === 'A') && (prev === 'a' || prev === 'A')) {
                out[out.length - 1] = prev === 'A' ? 'Â' : 'â';
                continue;
            }
            if ((ch === 'e' || ch === 'E') && (prev === 'e' || prev === 'E')) {
                out[out.length - 1] = prev === 'E' ? 'Ê' : 'ê';
                continue;
            }
            if ((ch === 'o' || ch === 'O') && (prev === 'o' || prev === 'O')) {
                out[out.length - 1] = prev === 'O' ? 'Ô' : 'ô';
                continue;
            }
            if (ch === 'w' || ch === 'W') {
                if (prev === 'a' || prev === 'A') {
                    out[out.length - 1] = prev === 'A' ? 'Ă' : 'ă';
                    continue;
                }
                if (prev === 'o' || prev === 'O') {
                    out[out.length - 1] = prev === 'O' ? 'Ơ' : 'ơ';
                    continue;
                }
                if (prev === 'u' || prev === 'U') {
                    out[out.length - 1] = prev === 'U' ? 'Ư' : 'ư';
                    continue;
                }
                // Standalone "w" = "ư" when no prior vowel (uww style not handled)
            }
            if ((ch === 'd' || ch === 'D') && (prev === 'd' || prev === 'D')) {
                out[out.length - 1] = prev === 'D' ? 'Đ' : 'đ';
                continue;
            }
        }

        // Tone keys
        if (ch.toLowerCase() in TONE_KEYS) {
            // Only treat as tone key if there is a vowel in `out` AND this is the
            // last char of the run OR the next char is not a Vietnamese letter.
            const isLast = i === input.length - 1;
            const hasVowel = out.some(isVowelChar);
            if (hasVowel && isLast) {
                currentTone = TONE_KEYS[ch.toLowerCase()];
                const toned = applyToneToSyllable(out, currentTone);
                return toned.join('');
            }
        }

        out.push(ch);
    }

    return out.join('');
}

function mapBackForW(ch: string): string {
    switch (ch) {
        case 'ă': return 'a';
        case 'Ă': return 'A';
        case 'ơ': return 'o';
        case 'Ơ': return 'O';
        case 'ư': return 'u';
        case 'Ư': return 'U';
        default: return ch;
    }
}

/**
 * Convert a full Telex-typed string into Vietnamese Unicode (NFC).
 * Preserves whitespace and punctuation; processes each maximal letter run
 * as a syllable.
 */
export function telexToUnicode(text: string): string {
    let out = '';
    let buf = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (isLetter(ch)) {
            buf += ch;
        } else {
            if (buf) {
                out += processSyllable(buf);
                buf = '';
            }
            out += ch;
        }
    }
    if (buf) out += processSyllable(buf);
    return out.normalize('NFC');
}
