/**
 * Generates src/data/syllables.json from a phonotactic spec.
 *
 * Approach: enumerate (onset)(rhyme) base forms that obey the major
 * Vietnamese spelling rules, then apply each of 6 tones to the appropriate
 * vowel character. The resulting set is a near-complete superset of valid
 * modern Vietnamese syllables. False positives are harmless for our use:
 * the apostrophe-insertion rule additionally requires the alternative
 * 2-syllable split to be a *real* dictionary word (words.json), so a
 * permissive syllable set never triggers spurious apostrophes.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '..', 'src', 'data');
mkdirSync(outDir, { recursive: true });

// --- Onsets ---------------------------------------------------------------
// "" = no onset (vowel-initial)
const ONSETS = [
    '', 'b', 'c', 'ch', 'd', 'đ', 'g', 'gh', 'gi', 'h', 'k', 'kh',
    'l', 'm', 'n', 'ng', 'ngh', 'nh', 'p', 'ph', 'qu', 'r', 's',
    't', 'th', 'tr', 'v', 'x',
];

// --- Rhymes (nucleus + optional coda), no tones yet ----------------------
// Tone marks attach to the toned vowel of the nucleus by `applyTone`.
const RHYMES = [
    // open monophthongs
    'a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y',
    // diphthongs / triphthongs (open)
    'ai', 'ao', 'au', 'ay', 'âu', 'ây',
    'eo', 'êu',
    'ia', 'iu', 'iêu', 'yêu',
    'oa', 'oe', 'oi', 'oai', 'oay', 'oao', 'oeo',
    'ôi',
    'ơi',
    'ua', 'uê', 'ui', 'uy', 'uya', 'uây', 'uao', 'uôi', 'uơ', 'uê',
    'ưa', 'ưi', 'ưu', 'ươi', 'ươu',
    // closed rhymes - coda c
    'ac', 'ăc', 'âc', 'ec', 'oc', 'ôc', 'uc', 'ưc',
    'iêc', 'uôc', 'ươc', 'oac', 'uêc',
    // coda ch
    'ach', 'êch', 'ich', 'uêch', 'uych', 'oach',
    // coda m
    'am', 'ăm', 'âm', 'em', 'êm', 'im', 'om', 'ôm', 'ơm', 'um', 'ưm',
    'iêm', 'yêm', 'uôm', 'ươm', 'oam', 'oăm',
    // coda n
    'an', 'ăn', 'ân', 'en', 'ên', 'in', 'on', 'ôn', 'ơn', 'un', 'ưn',
    'iên', 'yên', 'uân', 'uôn', 'ươn', 'oan', 'oăn', 'oen', 'uên', 'uyên',
    // coda ng
    'ang', 'ăng', 'âng', 'eng', 'ong', 'ông', 'ung', 'ưng',
    'iêng', 'uâng', 'uông', 'ương', 'oang', 'oăng', 'uêng',
    // coda nh
    'anh', 'ênh', 'inh', 'uênh', 'uynh', 'oanh', 'uêch',
    // coda p
    'ap', 'ăp', 'âp', 'ep', 'êp', 'ip', 'op', 'ôp', 'ơp', 'up', 'ưp',
    'iêp', 'yêp', 'uôp', 'ươp', 'oap', 'oăp',
    // coda t
    'at', 'ăt', 'ât', 'et', 'êt', 'it', 'ot', 'ôt', 'ơt', 'ut', 'ưt',
    'iêt', 'yêt', 'uât', 'uôt', 'ươt', 'oat', 'oăt', 'oet', 'uêt', 'uyêt', 'uyt',
];

// --- Spelling rules: which (onset, rhyme) pairs are legal ---------------
function pairAllowed(onset: string, rhyme: string): boolean {
    const first = rhyme[0];
    const front = first === 'i' || first === 'e' || first === 'ê' || first === 'y';

    // c / k / q
    if (onset === 'c' && front && first !== 'i') return false; // c not before e/ê/y (i is borderline; allow some loanwords like... no, drop)
    if (onset === 'c' && first === 'i') return false;
    if (onset === 'k' && !front) return false;
    if (onset === 'qu') {
        // qu requires a following vowel; rhyme starts with vowel -> always ok
        // but combined "qu" + rhyme starting with "u" would be "quu" — disallow
        if (first === 'u') return false;
    }

    // g / gh
    if (onset === 'g' && front) return false;
    if (onset === 'gh' && !front) return false;

    // ng / ngh
    if (onset === 'ng' && front) return false;
    if (onset === 'ngh' && !front) return false;

    // gi + i-initial rhyme: "gi" + "i..." collapses to "gi..." — skip duplicate
    if (onset === 'gi' && first === 'i') return false;

    // p- onset rare in native Vietnamese; keep for loanwords (pin, pa, pê...)
    // (no restriction)

    return true;
}

// --- Tone application ---------------------------------------------------
// Tones: 0 = level (no mark), 1 = acute (sắc), 2 = grave (huyền),
// 3 = hook (hỏi), 4 = tilde (ngã), 5 = dot below (nặng)
const TONE_MAP: Record<string, string[]> = {
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

const VOWELS = new Set(Object.keys(TONE_MAP));
function isVowel(ch: string): boolean {
    return VOWELS.has(ch);
}

/**
 * Locate the index in `rhyme` where the tone mark should go.
 * Modern Vietnamese tone-placement rules:
 * 1. If the rhyme contains ơ or ê, mark goes there.
 * 2. Else if it contains a "main" vowel (a, ă, â, e, o, ô), mark goes on it.
 * 3. Else mark goes on the last vowel before any coda; for open rhymes
 *    with two vowels, mark goes on the first vowel (e.g. úa, ìa);
 *    for closed rhymes, mark goes on the second vowel (úi -> ủi, etc.).
 */
function tonePosition(rhyme: string): number {
    for (let i = 0; i < rhyme.length; i++) {
        if (rhyme[i] === 'ơ' || rhyme[i] === 'ê') return i;
    }
    for (let i = 0; i < rhyme.length; i++) {
        if ('aăâeoô'.includes(rhyme[i])) return i;
    }
    // collect vowel indices
    const vIdx: number[] = [];
    for (let i = 0; i < rhyme.length; i++) if (isVowel(rhyme[i])) vIdx.push(i);
    if (vIdx.length === 0) return -1;
    if (vIdx.length === 1) return vIdx[0];
    // Has coda (last char not vowel)?
    const lastIsVowel = isVowel(rhyme[rhyme.length - 1]);
    return lastIsVowel ? vIdx[0] : vIdx[vIdx.length - 1];
}

function applyTone(rhyme: string, tone: number): string | null {
    if (tone === 0) return rhyme;
    const pos = tonePosition(rhyme);
    if (pos < 0) return null;
    const base = rhyme[pos];
    const map = TONE_MAP[base];
    if (!map) return null;
    return rhyme.slice(0, pos) + map[tone] + rhyme.slice(pos + 1);
}

// Tone restrictions: closed syllables with stop coda (p, t, c, ch) take only
// sắc (1) or nặng (5).
function toneAllowed(rhyme: string, tone: number): boolean {
    const last = rhyme[rhyme.length - 1];
    const stopCoda = last === 'p' || last === 't' || last === 'c' || (rhyme.endsWith('ch'));
    if (stopCoda) return tone === 1 || tone === 5;
    return true;
}

// --- Generate -----------------------------------------------------------
const set = new Set<string>();
for (const onset of ONSETS) {
    for (const rhyme of RHYMES) {
        if (!pairAllowed(onset, rhyme)) continue;
        for (let t = 0; t < 6; t++) {
            if (!toneAllowed(rhyme, t)) continue;
            const toned = applyTone(rhyme, t);
            if (!toned) continue;
            const syl = (onset + toned).normalize('NFC');
            set.add(syl);
        }
    }
}

const sorted = [...set].sort();
writeFileSync(
    resolve(outDir, 'syllables.json'),
    JSON.stringify(sorted),
    'utf8',
);
console.log(`Wrote ${sorted.length} syllables.`);
