import { joinVietnamese } from '../lib/joiner';
import { useLang } from '../lib/LangContext';

export function Hero() {
    const lang = useLang();
    return (
        <section className="max-w-5xl mx-auto px-6 py-16">
            <h1 className="font-vi text-4xl sm:text-5xl font-bold leading-tight mb-6">
                {lang === 'en'
                    ? 'What if Vietnamese were written like English?'
                    : 'Điều gì sẽ xảy ra nếu tiếng Việt được viết như tiếng Anh?'}
            </h1>
            {lang === 'en' ? (
                <p className="text-lg text-stone-700 dark:text-stone-300 mb-4">
                    In modern Vietnamese, every syllable of a multi-syllable word is
                    separated by a space — <span className="font-vi">âm thanh</span>,{' '}
                    <span className="font-vi">âm vị học</span>,{' '}
                    <span className="font-vi">ngữ âm học</span>. This experiment glues
                    those syllables together into solid English-style words.
                </p>
            ) : (
                <p className="text-lg text-stone-700 dark:text-stone-300 mb-4">
                    Trong tiếng Việt hiện đại, mỗi âm tiết của một từ đa âm tiết được
                    phân cách bằng dấu cách —{' '}
                    <span className="font-vi">âm thanh</span>,{' '}
                    <span className="font-vi">âm vị học</span>,{' '}
                    <span className="font-vi">ngữ âm học</span>. Thử nghiệm này ghép
                    các âm tiết đó lại thành các từ liền mạch theo kiểu tiếng Anh.
                </p>
            )}
            {lang === 'en' ? (
                <p className="text-lg text-stone-700 dark:text-stone-300 mb-4">
                    There is a catch: Vietnamese spelling lets some pairs of syllables
                    re-combine into a <em>different</em> valid syllable. For example,{' '}
                    <span className="font-vi">thú y</span> ("veterinary") concatenated
                    becomes <span className="font-vi">thúy</span>, which is already a
                    different Vietnamese word (meaning "jade" or a given name).
                    When that happens we insert a single apostrophe to mark the original
                    break:
                </p>
            ) : (
                <p className="text-lg text-stone-700 dark:text-stone-300 mb-4">
                    Có một điểm đáng lưu ý: chính tả tiếng Việt cho phép một số cặp
                    âm tiết kết hợp lại thành một âm tiết hợp lệ <em>khác</em>. Ví dụ,{' '}
                    <span className="font-vi">thú y</span> ("thú y khoa") khi ghép lại
                    thành <span className="font-vi">thúy</span>, vốn là một từ tiếng Việt
                    khác (có nghĩa là "ngọc bích" hoặc tên riêng). Khi điều đó xảy ra,
                    chúng tôi chèn một dấu nháy đơn để đánh dấu ranh giới gốc:
                </p>
            )}

            <div className="grid sm:grid-cols-2 gap-4 my-8">
                <Card label={lang === 'en' ? 'Unambiguous' : 'Không nhập nhằng'}>
                    <Pair a="âm vị học" b={joinVietnamese('âm vị học')} />
                    <Pair a="âm vị" b={joinVietnamese('âm vị')} />
                    <Pair a="âm thanh" b={joinVietnamese('âm thanh')} />
                </Card>
                <Card label={lang === 'en' ? 'Ambiguous → apostrophe' : 'Nhập nhằng → dấu nháy đơn'}>
                    <Pair a="thú y" b={joinVietnamese('thú y')} />
                    <Pair a="thúy" b={joinVietnamese('thúy')} />
                </Card>
            </div>

            <p className="text-stone-600 dark:text-stone-400 mb-4">
                {lang === 'en'
                    ? 'The check is purely structural: an apostrophe is inserted whenever a greedy reader would consume more than the intended first syllable.'
                    : 'Việc kiểm tra thuần túy theo cấu trúc: dấu nháy đơn được chèn khi trình đọc tham lăm sẽ tiêu thụ nhiều hơn âm tiết đầu tiên dự kiến.'}
            </p>

            {lang === 'en' ? (
                <p className="text-stone-600 dark:text-stone-400">
                    Solid writing also makes similar-looking terms visually distinct.
                    In spaced form,{' '}
                    <span className="font-vi">âm học</span>,{' '}
                    <span className="font-vi">âm vị học</span>, and{' '}
                    <span className="font-vi">ngữ âm học</span> all begin with the same
                    syllable — but as{' '}
                    <span className="font-vi font-semibold">Âmhọc</span>,{' '}
                    <span className="font-vi font-semibold">Âmvịhọc</span>, and{' '}
                    <span className="font-vi font-semibold">Ngữâmhọc</span>{' '}
                    they are immediately distinguishable at a glance.
                </p>
            ) : (
                <p className="text-stone-600 dark:text-stone-400">
                    Cách viết liền cũng giúp phân biệt trực quan các thuật ngữ trông giống
                    nhau nhưng mang nghĩa rất khác nhau. Ở dạng có dấu cách,{' '}
                    <span className="font-vi">âm học</span>,{' '}
                    <span className="font-vi">âm vị học</span> và{' '}
                    <span className="font-vi">ngữ âm học</span> đều bắt đầu bằng cùng một
                    âm tiết — nhưng khi viết liền là{' '}
                    <span className="font-vi font-semibold">Âmhọc</span>,{' '}
                    <span className="font-vi font-semibold">Âmvịhọc</span> và{' '}
                    <span className="font-vi font-semibold">Ngữâmhọc</span>,{' '}
                    chúng có thể phân biệt ngay lập tức.
                </p>
            )}
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
