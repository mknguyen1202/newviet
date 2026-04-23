import { useMemo } from 'react';
import { joinVietnamese } from '../lib/joiner';

// Opening two sentences of vi.wikipedia.org/wiki/Lỗi_phần_mềm
// Retrieved April 2026 · CC BY-SA 4.0
const SOURCE = `Lỗi phần mềm là một lỗi hay hỏng hóc trong chương trình hoặc hệ thống máy tính khiến nó tạo ra kết quả không chính xác hoặc không mong muốn hoặc hành xử theo những cách không lường trước được. Quá trình tìm và sửa lỗi được gọi là gỡ lỗi và thường sử dụng các kỹ thuật hoặc công cụ chính thức để xác định lỗi.`;

export function WikiExample() {
    const joined = useMemo(() => joinVietnamese(SOURCE), []);
    return (
        <section className="max-w-5xl mx-auto px-6 py-16">
            <div className="flex items-baseline gap-3 mb-2">
                <h2 className="font-vi text-2xl sm:text-3xl font-semibold">
                    Wikipedia in the wild
                </h2>
                <a
                    href="https://vi.wikipedia.org/wiki/L%E1%BB%97i_ph%E1%BA%A7n_m%E1%BB%81m"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stone-500 hover:underline"
                >
                    Lỗi phần mềm ↗
                </a>
            </div>
            <p className="text-stone-600 dark:text-stone-400 mb-8">
                The opening of the Vietnamese Wikipedia article on <em>software bugs</em>,
                run through the converter. Note how multi-syllable technical terms join up.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                    <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">Original</div>
                    <p className="font-vi text-lg leading-relaxed text-stone-700 dark:text-stone-300">
                        {SOURCE}
                    </p>
                </div>
                <div>
                    <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">Solid</div>
                    <p className="font-vi text-lg leading-relaxed font-semibold">
                        {joined}
                    </p>
                </div>
            </div>

            <p className="mt-6 text-xs text-stone-400 dark:text-stone-600">
                Text from{' '}
                <a
                    href="https://vi.wikipedia.org/wiki/L%E1%BB%97i_ph%E1%BA%A7n_m%E1%BB%81m"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-stone-600"
                >
                    vi.wikipedia.org
                </a>{' '}
                · CC BY-SA 4.0
            </p>
        </section>
    );
}
