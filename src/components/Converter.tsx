import { useEffect, useMemo, useState } from 'react';
import { telexToUnicode } from '../lib/telex';
import { joinVietnamese } from '../lib/joiner';

export function Converter() {
    const [raw, setRaw] = useState('');
    const [telex, setTelex] = useState(true);
    const [copied, setCopied] = useState(false);

    // Initialize from ?q= URL param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) setRaw(q);
    }, []);

    const display = useMemo(() => (telex ? telexToUnicode(raw) : raw), [raw, telex]);
    const joined = useMemo(() => joinVietnamese(display), [display]);

    const copy = async () => {
        await navigator.clipboard.writeText(joined);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    const share = async () => {
        const url = new URL(window.location.href);
        url.searchParams.set('q', display);
        await navigator.clipboard.writeText(url.toString());
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    return (
        <section className="max-w-5xl mx-auto px-6 py-16">
            <h2 className="font-vi text-2xl sm:text-3xl font-semibold mb-2">
                Try it yourself
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
                Type or paste Vietnamese on the left. With Telex on, you can type{' '}
                <code className="font-mono text-sm">tieengs vieetj</code> to get{' '}
                <span className="font-vi">tiếng việt</span>.
            </p>

            <div className="flex items-center gap-4 mb-3">
                <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={telex}
                        onChange={(e) => setTelex(e.target.checked)}
                        className="rounded"
                    />
                    Telex input
                </label>
                <button
                    onClick={copy}
                    className="text-sm px-3 py-1 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                    {copied ? 'Copied!' : 'Copy output'}
                </button>
                <button
                    onClick={share}
                    className="text-sm px-3 py-1 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                    Copy share link
                </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                        Input {telex && <span className="ml-1">(Telex)</span>}
                    </div>
                    <textarea
                        value={raw}
                        onChange={(e) => setRaw(e.target.value)}
                        rows={10}
                        placeholder={
                            telex
                                ? 'tieengs vieetj, phats hanhf...'
                                : 'tiếng việt, phát hành...'
                        }
                        className="w-full p-3 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-vi text-lg leading-relaxed"
                    />
                    {telex && raw && (
                        <div className="text-sm text-stone-500 mt-1 font-vi">
                            ↪ {display}
                        </div>
                    )}
                </div>
                <div>
                    <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">
                        Solid output
                    </div>
                    <textarea
                        value={joined}
                        readOnly
                        rows={10}
                        className="w-full p-3 rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 font-vi text-lg leading-relaxed"
                    />
                </div>
            </div>
        </section>
    );
}
