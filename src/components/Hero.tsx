import { joinVietnamese } from '../lib/joiner';

export function Hero() {
    return (
        <section className="max-w-5xl mx-auto px-6 py-16">
            <h1 className="font-vi text-4xl sm:text-5xl font-bold leading-tight mb-6">
                What if Vietnamese were written like English?
            </h1>
            <p className="text-lg text-stone-700 dark:text-stone-300 mb-4">
                In modern Vietnamese, every syllable of a multi-syllable word is
                separated by a space — <span className="font-vi">học sinh</span>,{' '}
                <span className="font-vi">phát hành</span>,{' '}
                <span className="font-vi">điện thoại</span>. This experiment glues
                those syllables together into solid English-style words.
            </p>
            <p className="text-lg text-stone-700 dark:text-stone-300 mb-4">
                There is a catch: Vietnamese spelling lets some pairs of syllables
                re-combine into a <em>different</em> valid pair. For example,{' '}
                <span className="font-vi">phát hành</span> ("to publish") concatenated
                becomes <span className="font-vi">pháthành</span>, which can also be
                read as <span className="font-vi">phá thành</span> ("to destroy a
                wall"). When that happens we insert a single apostrophe to mark the
                original break:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 my-8">
                <Card label="Unambiguous">
                    <Pair a="học sinh" b={joinVietnamese('học sinh')} />
                    <Pair a="tiếng việt" b={joinVietnamese('tiếng việt')} />
                    <Pair a="điện thoại" b={joinVietnamese('điện thoại')} />
                </Card>
                <Card label="Ambiguous → apostrophe">
                    <Pair a="phát hành" b={joinVietnamese('phát hành')} />
                </Card>
            </div>

            <p className="text-stone-600 dark:text-stone-400">
                The check is purely lexical: an apostrophe is inserted only when the
                alternative split also forms a real dictionary word.
            </p>
        </section>
    );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-5">
            <div className="text-xs uppercase tracking-wider text-stone-500 mb-3">
                {label}
            </div>
            <div className="space-y-2 font-vi">{children}</div>
        </div>
    );
}

function Pair({ a, b }: { a: string; b: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-stone-500">{a}</span>
            <span className="text-stone-400">→</span>
            <span className="font-semibold">{b}</span>
        </div>
    );
}
