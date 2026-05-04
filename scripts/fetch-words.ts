/**
 * Fetches multi-syllable Vietnamese words from the English Wiktionary API
 * (Category:Vietnamese_lemmas) and writes them to src/data/words.json.
 *
 * Only entries where every space-separated part is a valid syllable (per
 * syllables.json) are kept. Run with: npm run fetch:words
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '..', 'src', 'data');

// Load valid syllables so we can filter out non-Vietnamese entries.
const validSyllables = new Set<string>(
    JSON.parse(readFileSync(resolve(dataDir, 'syllables.json'), 'utf8')) as string[]
);

const API_BASE = 'https://en.wiktionary.org/w/api.php';
// Wikimedia requires a descriptive User-Agent.
const USER_AGENT = 'fetch-words/1.0 (new-vietnamese build script)';

interface ApiResponse {
    batchcomplete?: string;
    continue?: { cmcontinue: string };
    query: { categorymembers: { title: string }[] };
}

const DELAY_MS = 1000; // 1 s between requests — well within Wikimedia's limits
const MAX_RETRIES = 5;

function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(continueToken?: string): Promise<{ titles: string[]; next?: string }> {
    const params = new URLSearchParams({
        action: 'query',
        list: 'categorymembers',
        cmtitle: 'Category:Vietnamese_lemmas',
        cmlimit: '500',
        cmtype: 'page',
        format: 'json',
    });
    if (continueToken) params.set('cmcontinue', continueToken);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const res = await fetch(`${API_BASE}?${params}`, {
            headers: { 'User-Agent': USER_AGENT },
        });

        if (res.status === 429) {
            const retryAfter = Number(res.headers.get('retry-after') ?? 60);
            const wait = (retryAfter || 60) * 1000;
            process.stdout.write(`\n  Rate limited — waiting ${retryAfter}s…`);
            await sleep(wait);
            continue;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

        const data = (await res.json()) as ApiResponse;
        return {
            titles: data.query.categorymembers.map((m) => m.title),
            next: data.continue?.cmcontinue,
        };
    }
    throw new Error('Exceeded max retries');
}

function parseTitle(title: string): string[] | null {
    const normalized = title.normalize('NFC').toLowerCase().trim();
    if (!normalized.includes(' ')) return null; // single-syllable — skip
    const parts = normalized.split(/\s+/);
    if (!parts.every((p) => validSyllables.has(p))) return null; // non-Vietnamese part
    return parts;
}

async function main() {
    console.log('Fetching Vietnamese lemmas from English Wiktionary…');

    const seen = new Set<string>();
    const words: string[][] = [];
    let pageCount = 0;
    let totalFetched = 0;
    let continueToken: string | undefined;

    do {
        const { titles, next } = await fetchPage(continueToken);
        pageCount++;
        totalFetched += titles.length;

        for (const title of titles) {
            const parts = parseTitle(title);
            if (!parts) continue;
            const key = parts.join('\x00');
            if (seen.has(key)) continue;
            seen.add(key);
            words.push(parts);
        }

        continueToken = next;
        process.stdout.write(
            `\r  Page ${pageCount} — fetched ${totalFetched}, passing ${words.length}`
        );

        if (continueToken) await sleep(DELAY_MS);
    } while (continueToken);

    console.log(`\nDone. Total fetched: ${totalFetched}, passing validation: ${words.length}`);

    // Sort for stable git diffs.
    words.sort((a, b) => a.join(' ').localeCompare(b.join(' '), 'vi'));

    mkdirSync(dataDir, { recursive: true });
    const output = {
        _note: 'Multi-syllable Vietnamese words generated from English Wiktionary (Category:Vietnamese_lemmas). Run "npm run fetch:words" to refresh.',
        words,
    };
    writeFileSync(resolve(dataDir, 'words.json'), JSON.stringify(output, null, 2) + '\n', 'utf8');
    console.log(`Written ${words.length} words to src/data/words.json`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
