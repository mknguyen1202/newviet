import { useMemo } from 'react';
import { joinVietnamese } from '../lib/joiner';

const KIEU = `Trăm năm trong cõi người ta,
Chữ tài chữ mệnh khéo là ghét nhau.
Trải qua một cuộc bể dâu,
Những điều trông thấy mà đau đớn lòng.
Lạ gì bỉ sắc tư phong,
Trời xanh quen thói má hồng đánh ghen.`;

export function KieuExample() {
    const joined = useMemo(() => joinVietnamese(KIEU), []);
    return (
        <section className="bg-stone-100 dark:bg-stone-900/40 border-y border-stone-200 dark:border-stone-800">
            <div className="max-w-5xl mx-auto px-6 py-16">
                <h2 className="font-vi text-2xl sm:text-3xl font-semibold mb-2">
                    Tale of Kiều, opening lines
                </h2>
                <p className="text-stone-600 dark:text-stone-400 mb-8">
                    Nguyễn Du's classic, side by side. Note where apostrophes appear —
                    and where they don't.
                </p>
                <div className="grid sm:grid-cols-2 gap-6 font-vi text-lg leading-relaxed">
                    <pre className="whitespace-pre-wrap font-vi">{KIEU}</pre>
                    <pre className="whitespace-pre-wrap font-vi font-semibold">{joined}</pre>
                </div>
            </div>
        </section>
    );
}
