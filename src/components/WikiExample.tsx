import { useMemo, type ReactNode } from 'react';
import { joinVietnamese } from '../lib/joiner';
import { useLang } from '../lib/LangContext';

// ── Source text ──────────────────────────────────────────────────────────────

const EN_TITLE = 'Cosmic rays creating energetic neutrons and protons';

const EN_SOURCE =
    'Once the electronics industry had determined how to control package ' +
    'contaminants, it became clear that other causes were also at work. ' +
    'James F. Ziegler led a program of work at IBM which culminated in the ' +
    'publication of a number of papers (Ziegler and Lanford, 1979) ' +
    'demonstrating that cosmic rays also could cause soft errors. Indeed, ' +
    'in modern devices, cosmic rays may be the predominant cause. Although ' +
    'the primary particle of the cosmic ray does not generally reach the ' +
    'Earth\u2019s surface, it creates a shower of energetic secondary particles. ' +
    'At the Earth\u2019s surface approximately 95% of the particles capable of ' +
    'causing soft errors are energetic neutrons with the remainder composed ' +
    'of protons and pions. IBM estimated in 1996 that one error per ' +
    'month per 256\u00a0MiB of RAM was expected for a desktop computer. ' +
    'This flux of energetic neutrons is typically referred to as \u201ccosmic ' +
    'rays\u201d in the soft error literature. Neutrons are uncharged and cannot ' +
    'disturb a circuit on their own, but undergo neutron capture by the ' +
    'nucleus of an atom in a chip. This process may result in the production ' +
    'of charged secondaries, such as alpha particles and oxygen nuclei, ' +
    'which can then cause soft errors.';

const VI_TITLE = 'Tia vũ trụ tạo ra các neutron và proton có năng lượng cao';

// Vietnamese translation of the passage above
const VI_SOURCE =
    'Sau khi ngành công nghiệp điện tử đã xác định được cách kiểm soát ' +
    'các chất gây ô nhiễm trong linh kiện đóng gói, người ta nhận ra rằng ' +
    'còn có những nguyên nhân khác cũng đang có tác động. James F. Ziegler ' +
    'đã dẫn đầu một chương trình nghiên cứu tại IBM, đỉnh điểm là việc ' +
    'công bố một số bài báo (Ziegler và Lanford, 1979) chứng minh rằng ' +
    'tia vũ trụ cũng có thể gây ra lỗi mềm. Thật vậy, trong các thiết bị ' +
    'hiện đại, tia vũ trụ có thể là nguyên nhân chủ yếu. Mặc dù hạt sơ ' +
    'cấp của tia vũ trụ thường không đến được bề mặt Trái Đất, nhưng nó ' +
    'tạo ra một chùm hạt thứ cấp có năng lượng cao. Tại bề mặt Trái Đất, ' +
    'khoảng 95% các hạt có khả năng gây ra lỗi mềm là các neutron có ' +
    'năng lượng cao, phần còn lại gồm các proton và pion. IBM ước tính ' +
    'năm 1996 rằng cứ mỗi tháng sẽ xảy ra một lỗi trên mỗi 256\u00a0MiB ' +
    'RAM cho một máy tính để bàn. Luồng neutron có năng lượng cao này ' +
    'thường được gọi là \u201ctia vũ trụ\u201d trong tài liệu về lỗi mềm. ' +
    'Neutron không mang điện và không thể tự làm gián đoạn một mạch điện, ' +
    'nhưng chúng trải qua quá trình bắt giữ neutron bởi hạt nhân của một ' +
    'nguyên tử trong chip. Quá trình này có thể dẫn đến việc tạo ra các ' +
    'hạt thứ cấp mang điện, chẳng hạn như hạt alpha và hạt nhân oxy, sau ' +
    'đó có thể gây ra lỗi mềm.';

// ── Highlight infrastructure ─────────────────────────────────────────────────

type HL = { pattern: RegExp; key: string };

// Pastel colours — the same key maps to the same colour in all three blocks
const PALETTE: Record<string, string> = {
    cosmic: 'bg-sky-100 text-sky-900 dark:bg-sky-800/70 dark:text-sky-100',
    neutron: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-800/70 dark:text-emerald-100',
    proton: 'bg-violet-100 text-violet-900 dark:bg-violet-800/70 dark:text-violet-100',
    error: 'bg-rose-100 text-rose-900 dark:bg-rose-800/70 dark:text-rose-100',
    ibm: 'bg-amber-100 text-amber-900 dark:bg-amber-800/70 dark:text-amber-100',
    nucleus: 'bg-teal-100 text-teal-900 dark:bg-teal-800/70 dark:text-teal-100',
    alpha: 'bg-orange-100 text-orange-900 dark:bg-orange-800/70 dark:text-orange-100',
};

const LEGEND: { key: string; en: string; vi: string }[] = [
    { key: 'cosmic', en: 'cosmic ray', vi: 'tia vũ trụ' },
    { key: 'neutron', en: 'neutron', vi: 'neutron' },
    { key: 'proton', en: 'proton', vi: 'proton' },
    { key: 'error', en: 'soft error', vi: 'lỗi mềm' },
    { key: 'ibm', en: 'IBM', vi: 'IBM' },
    { key: 'nucleus', en: 'nucleus / nuclei', vi: 'hạt nhân' },
    { key: 'alpha', en: 'alpha particle', vi: 'hạt alpha' },
];

const EN_HL: HL[] = [
    { pattern: /cosmic rays?/gi, key: 'cosmic' },
    { pattern: /neutrons?/gi, key: 'neutron' },
    { pattern: /protons?/gi, key: 'proton' },
    { pattern: /soft errors?/gi, key: 'error' },
    { pattern: /IBM/g, key: 'ibm' },
    { pattern: /nucle(?:us|i)/gi, key: 'nucleus' },
    { pattern: /alpha particles?/gi, key: 'alpha' },
];

// Spaced Vietnamese terms matched literally (case-insensitive)
const VI_SPACED_TERMS: { term: string; key: string }[] = [
    { term: 'tia vũ trụ', key: 'cosmic' },
    { term: 'neutron', key: 'neutron' },
    { term: 'proton', key: 'proton' },
    { term: 'lỗi mềm', key: 'error' },
    { term: 'IBM', key: 'ibm' },
    { term: 'hạt nhân', key: 'nucleus' },
    { term: 'hạt alpha', key: 'alpha' },
];

function esc(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function makeRules(terms: { term: string; key: string }[]): HL[] {
    return terms.map(({ term, key }) => ({
        pattern: new RegExp(esc(term), 'gi'),
        key,
    }));
}

function applyHighlights(text: string, rules: HL[]): ReactNode {
    if (!rules.length) return text;
    const combined = new RegExp(
        rules.map((r, i) => `(?<g${i}>${r.pattern.source})`).join('|'),
        'gi',
    );
    const nodes: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = combined.exec(text)) !== null) {
        if (m.index > last) nodes.push(text.slice(last, m.index));
        const idx = rules.findIndex((_, i) => m!.groups?.[`g${i}`] !== undefined);
        const cls = `${PALETTE[rules[idx]?.key ?? ''] ?? ''} rounded px-0.5`;
        nodes.push(<span key={m.index} className={cls}>{m[0]}</span>);
        last = m.index + m[0].length;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return <>{nodes}</>;
}

// Joined (solid) forms of VI terms — computed once at module load so the
// highlight patterns exactly match what joinVietnamese produces in context.
const VI_HL = makeRules(VI_SPACED_TERMS);
const VI_JOINED_HL = makeRules(
    VI_SPACED_TERMS.map(({ term, key }) => ({ term: joinVietnamese(term), key })),
);

// ── Component ────────────────────────────────────────────────────────────────

export function WikiExample() {
    const lang = useLang();
    const viJoined = useMemo(() => joinVietnamese(VI_SOURCE), []);

    return (
        <section className="max-w-5xl mx-auto px-6 py-16">
            <div className="flex items-baseline gap-3 mb-2">
                <h2 className="font-vi text-2xl sm:text-3xl font-semibold">
                    {lang === 'en' ? 'Wikipedia in the wild' : 'Wikipedia trong thực tế'}
                </h2>
                <a
                    href="https://en.wikipedia.org/wiki/Soft_error"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stone-500 hover:underline"
                >
                    Soft error ↗
                </a>
            </div>
            <p className="text-stone-600 dark:text-stone-400 mb-8">
                {lang === 'en' ? (
                    <>
                        A paragraph from the English Wikipedia article on{' '}
                        <em>soft errors</em>, translated to Vietnamese and run through
                        the converter. Colour highlights show matching terms across all
                        three versions.
                    </>
                ) : (
                    <>
                        Một đoạn từ bài Wikipedia tiếng Anh về{' '}
                        <em>lỗi mềm</em>, được dịch sang tiếng Việt và xử lý qua
                        bộ chuyển đổi. Màu nổi bật thể hiện các thuật ngữ tương
                        ứng trong cả ba phiên bản.
                    </>
                )}
            </p>

            {/* English original */}
            <div className="mb-6 p-5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                <div className="text-xs uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                    {EN_TITLE}
                </div>
                <p className="leading-relaxed text-stone-700 dark:text-stone-300">
                    {applyHighlights(EN_SOURCE, EN_HL)}
                </p>
            </div>

            {/* Vietnamese columns */}
            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                    <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                        {lang === 'en' ? 'Vietnamese · original' : 'Tiếng Việt · nguyên bản'}
                    </div>
                    <div className="font-vi text-xs text-stone-400 dark:text-stone-500 mb-2 normal-case">
                        {VI_TITLE}
                    </div>
                    <p className="font-vi text-lg leading-relaxed text-stone-700 dark:text-stone-300">
                        {applyHighlights(VI_SOURCE, VI_HL)}
                    </p>
                </div>
                <div>
                    <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                        {lang === 'en' ? 'Vietnamese · solid' : 'Tiếng Việt · liền'}
                    </div>
                    <div className="text-xs text-stone-400 dark:text-stone-500 mb-2">&nbsp;</div>
                    <p className="font-vi text-lg leading-relaxed font-semibold">
                        {applyHighlights(viJoined, VI_JOINED_HL)}
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap gap-2 text-xs">
                {LEGEND.map(({ key, en, vi }) => (
                    <span key={key} className={`${PALETTE[key]} rounded px-2 py-0.5`}>
                        <span className="font-medium">{en}</span>
                        {' = '}
                        <span className="font-vi">{vi}</span>
                    </span>
                ))}
            </div>

            <p className="mt-6 text-xs text-stone-400 dark:text-stone-600">
                {lang === 'en' ? 'Text adapted from' : 'Văn bản chuyển thể từ'}{' '}
                <a
                    href="https://en.wikipedia.org/wiki/Soft_error"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-stone-600"
                >
                    en.wikipedia.org/wiki/Soft_error
                </a>{' '}
                · CC BY-SA 4.0
            </p>
        </section>
    );
}
