import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, BookOpen } from 'lucide-react';

// --- Utility: Strong Normalization (توحيد النص للمقارنة الدقيقة) ---
// التحديث: إضافة "ٱ" (همزة الوصل) لقائمة التوحيد لضمان تلوين لفظ الجلالة
const normalizeForMatch = (text: string) => {
    if (!text) return "";
    return text
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // إزالة التشكيل والتطويل
        .replace(/[أإآٱ]/g, "ا") // توحيد جميع أشكال الألف (بما فيها همزة الوصل الموجودة في "ٱللَّهِ")
        .replace(/[^\w\s\u0600-\u06FF]/g, "") // إزالة الرموز
        .trim();
};

// --- Sub-component: HighlightableText ---
const HighlightableText: React.FC<{
    text: string;
    mainWords: string[];
    secondaryWords: string[];
    subSearch: string;
}> = ({ text, mainWords, secondaryWords, subSearch }) => {
    if (!text) return null;

    const mainSet = new Set(mainWords.map(w => normalizeForMatch(w)));
    const secondarySet = new Set(secondaryWords.map(w => normalizeForMatch(w)));
    const cleanSub = subSearch ? normalizeForMatch(subSearch) : "";

    const words = text.split(' ');

    return (
        <>
            {words.map((word, i) => {
                const normWord = normalizeForMatch(word);
                const suffix = i < words.length - 1 ? " " : "";

                // 1. الجذر الأساسي
                if (mainSet.has(normWord)) {
                    return (
                        <span key={i} className="text-secondary font-extrabold drop-shadow-sm decoration-secondary/30 underline decoration-2 underline-offset-8">
                            {word}{suffix}
                        </span>
                    );
                }

                // 2. الجذر الثانوي (تم إصلاح المشكلة هنا بفضل التوحيد الجديد)
                if (secondarySet.has(normWord)) {
                    return (
                        <span key={i} className="text-primary font-extrabold decoration-primary/30 underline decoration-dotted underline-offset-8">
                            {word}{suffix}
                        </span>
                    );
                }

                // 3. البحث النصي الحر
                if (cleanSub && cleanSub.length > 1 && normWord.includes(cleanSub)) {
                    return (
                        <span key={i} className="text-rose-600 dark:text-rose-400 font-extrabold decoration-rose-300/30 underline decoration-wavy underline-offset-4">
                            {word}{suffix}
                        </span>
                    );
                }

                return <span key={i} className="text-foreground/85">{word}{suffix}</span>;
            })}
        </>
    );
};

// --- Main Component: AyahCard ---
interface AyahCardProps {
    ayah: any;
    index?: number;
    onRootClick: (root: string) => void;
    mainRoot: string;
    subSearch: string;
}

export const AyahCard: React.FC<AyahCardProps> = ({
    ayah,
    index = 0,
    onRootClick,
    mainRoot,
    subSearch
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    // 1. كلمات الجذر الأساسي
    const mainTokens = React.useMemo(() => {
        if (!ayah.tokens) return [];
        const cleanMain = normalizeForMatch(mainRoot);

        return ayah.tokens
            .filter((t: any) => normalizeForMatch(t.root) === cleanMain)
            .map((t: any) => t.token_uthmani || t.token);
    }, [ayah.tokens, mainRoot]);

    // 2. كلمات الجذر الثانوي
    const secondaryTokens = React.useMemo(() => {
        if (!subSearch || !ayah.tokens) return [];

        const cleanSub = normalizeForMatch(subSearch);
        const cleanMain = normalizeForMatch(mainRoot);

        if (cleanSub === cleanMain) return [];

        return ayah.tokens
            .filter((t: any) => {
                const tRoot = normalizeForMatch(t.root);
                return tRoot === cleanSub;
            })
            .map((t: any) => t.token_uthmani || t.token);
    }, [ayah.tokens, subSearch, mainRoot]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`group overflow-hidden rounded-xl border transition-all duration-500 relative bg-card ${isExpanded
                    ? 'shadow-lg shadow-primary/5 border-primary/30 ring-1 ring-primary/10'
                    : 'shadow-sm hover:shadow-md border-border/60 hover:border-primary/20'
                }`}
        >
            <div className={`absolute start-0 top-0 bottom-0 w-1 transition-all duration-500 ${isExpanded ? 'bg-primary' : 'bg-primary/0 group-hover:bg-primary/30'}`} />

            {/* HEADER */}
            <div
                className="cursor-pointer p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 relative z-10 rounded-t-xl select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold transition-colors font-quran pt-1 border ${isExpanded
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-muted/50 text-muted-foreground border-border group-hover:border-primary/30'
                        }`}>
                        {index + 1}
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-xl text-foreground font-quran">{ayah.surahName}</h3>
                            <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted/50 rounded-full border border-border/50">
                                آية {ayah.ayahNo}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${ayah.text} \n[${ayah.surahName}: ${ayah.ayahNo}]`);
                        }}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors z-20 focus:outline-none"
                        title="نسخ الآية"
                    >
                        <Copy className="w-4 h-4" />
                    </button>

                    <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </div>
            </div>

            {/* TEXT AREA */}
            <div className="px-5 md:px-8 pb-5 pt-1">
                <div className="relative">
                    <div className="pl-2 pr-1 py-2 max-h-[160px] overflow-y-auto custom-scrollbar rounded-lg transition-colors hover:bg-muted/5">
                        <p className="text-right text-2xl md:text-3xl dir-rtl text-foreground font-quran leading-[2.6]" dir="rtl">
                            <HighlightableText
                                text={ayah.text}
                                mainWords={mainTokens}
                                secondaryWords={secondaryTokens}
                                subSearch={subSearch}
                            />
                        </p>
                    </div>
                </div>
            </div>

            {/* DETAILS */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-5 md:px-8 pb-6 pt-4 border-t border-border/40 bg-muted/30">

                            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground font-medium">
                                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> الجزء {ayah.juz}</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span>صفحة {ayah.page}</span>
                            </div>

                            <div className="flex flex-wrap gap-x-8 gap-y-6">
                                {/* الكلمات المطابقة */}
                                {ayah.tokens && ayah.tokens.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="text-xs font-bold text-primary/80 flex items-center gap-1.5 uppercase tracking-wider">
                                            التحليل الصرفي للجذر
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {ayah.tokens.map((token: any, idx: number) => {
                                                const cleanTokenRoot = normalizeForMatch(token.root);
                                                const cleanMain = normalizeForMatch(mainRoot);
                                                const cleanSub = normalizeForMatch(subSearch);

                                                const isMain = cleanTokenRoot === cleanMain;
                                                const isSecondary = cleanTokenRoot === cleanSub && !isMain;

                                                return (
                                                    <div key={idx} className={`flex flex-col items-center px-4 py-2 rounded-lg border relative min-w-[60px] transition-all ${isMain
                                                            ? 'bg-secondary/10 border-secondary/40 shadow-sm'
                                                            : isSecondary
                                                                ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20'
                                                                : 'bg-background border-border hover:border-primary/30'
                                                        }`}>
                                                        <span className={`text-xl font-quran mb-1 ${isMain
                                                                ? 'text-secondary font-bold'
                                                                : isSecondary
                                                                    ? 'text-primary font-bold'
                                                                    : 'text-foreground'
                                                            }`}>
                                                            {token.token_uthmani || token.token}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono bg-background/50 px-1.5 rounded">{token.root}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* جذور أخرى */}
                                {ayah.otherRoots && ayah.otherRoots.length > 0 && (
                                    <div className="space-y-3 flex-1 min-w-[200px]">
                                        <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                            جذور أخرى في الآية
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {ayah.otherRoots.filter((r: string) => normalizeForMatch(r).length >= 3).map((root: string, idx: number) => {
                                                const isSelected = normalizeForMatch(root) === normalizeForMatch(subSearch);
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRootClick(root);
                                                        }}
                                                        className={`text-sm px-3 py-1.5 rounded-md border transition-all ${isSelected
                                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20'
                                                                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary'
                                                            }`}
                                                    >
                                                        {root}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};