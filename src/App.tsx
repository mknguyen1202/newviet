import { useEffect, useState } from 'react';
import { LangContext, type Lang } from './lib/LangContext';
import { Hero } from './components/Hero';
import { KieuExample } from './components/KieuExample';
import { WikiExample } from './components/WikiExample';
import { Converter } from './components/Converter';

export function App() {
    const [dark, setDark] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
    const [lang, setLang] = useState<Lang>('en');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b border-stone-200 dark:border-stone-800">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="font-vi text-xl font-semibold">
                        {lang === 'en' ? 'Solid Vietnamese' : 'Tiếng Việt liền'}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setLang((l) => (l === 'en' ? 'vi' : 'en'))}
                            className="text-sm px-3 py-1 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                            aria-label="Toggle language"
                        >
                            {lang === 'en' ? 'Tiếng Việt' : 'English'}
                        </button>
                        <button
                            onClick={() => setDark((d) => !d)}
                            className="text-sm px-3 py-1 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                            aria-label="Toggle dark mode"
                        >
                            {dark ? '☀ Light' : '☾ Dark'}
                        </button>
                    </div>
                </div>
            </header>

            <LangContext.Provider value={lang}>
                <main className="flex-1">
                    <Hero />
                    <Converter />
                    <KieuExample />
                    <WikiExample />
                </main>

                <footer className="border-t border-stone-200 dark:border-stone-800 mt-16">
                    <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-stone-500 dark:text-stone-400">
                        {lang === 'en'
                            ? 'A small experiment in Vietnamese orthography.'
                            : 'Một thử nghiệm nhỏ về chính tả tiếng Việt.'}
                    </div>
                </footer>
            </LangContext.Provider>
        </div>
    );
}
