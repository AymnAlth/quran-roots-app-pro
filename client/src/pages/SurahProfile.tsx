import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { useLocation, useRoute, Link } from 'wouter';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { BookOpen, Sparkles, Anchor, Eye, Search, LayoutDashboard, AlertCircle, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuranLoader } from '@/components/ui/QuranLoader';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { NetworkError as NetworkErrorPage } from '@/components/errors/NetworkError';
import { ServerError as ServerErrorPage } from '@/components/errors/ServerError';
import { ErrorLayout } from '@/components/errors/ErrorLayout';
import { AppError } from '../lib/errors';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

interface Ayah {
    surah_no: number;
    ayah_no: number;
    text_uthmani: string;
}

interface SurahData {
    number: number;
    name: string;
    ayahs: Ayah[];
    roots: { root: string; ayah_id: string; count: number }[];
    stats: {
        topRoots: { root: string; frequency: number }[];
        uniqueRoots: string[];
    };
}

// --- Local Component: SurahAyahView ---
const SurahAyahView: React.FC<{
    ayah: Ayah;
    roots: { root: string; ayah_id: string; count: number }[];
    surahNumber: number;
    isReadingMode: boolean;
    onRootClick: (root: string) => void;
    index: number;
    isUnique: (root: string) => boolean;
}> = ({ ayah, roots, surahNumber, isReadingMode, onRootClick, index, isUnique }) => {

    const ayahRoots = roots.filter(r => r.ayah_id === `${surahNumber}:${ayah.ayah_no}`);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
        >
            <div className={`relative bg-card/40 backdrop-blur-sm border ${isReadingMode
                ? 'border-transparent p-8 md:p-12 shadow-none' // Reading Mode
                : 'border-border p-8 rounded-[2rem] hover:border-primary/30 hover:shadow-xl hover:bg-card/60' // Analysis Mode
                } transition-all duration-300 group`}
            >
                {/* Ayah Number Badge */}
                <div className="absolute top-6 start-6 opacity-30 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg border border-primary/20 text-primary text-sm font-bold font-quran bg-primary/5 shadow-sm">
                        {ayah.ayah_no}
                    </div>
                </div>

                {/* Text */}
                <p className={`text-center font-quran leading-[2.4] text-foreground ${isReadingMode ? 'text-4xl md:text-5xl leading-[2.6]' : 'text-3xl md:text-4xl'}`} dir="rtl">
                    {ayah.text_uthmani}
                </p>

                {/* Analysis Toolbar */}
                {!isReadingMode && (
                    <div className="mt-10 pt-6 border-t border-border/50">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {ayahRoots.filter(r => r.root.replace(/[\u064B-\u065F\u0670]/g, "").length >= 3).map((r, i) => {
                                const unique = isUnique(r.root);
                                return (
                                    <button
                                        key={i}
                                        onClick={() => onRootClick(r.root)}
                                        className={`
                                            px-3 py-1.5 rounded-md text-xs font-bold transition-all border
                                            ${unique
                                                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700'
                                                : 'bg-secondary/10 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                                            }
                                        `}
                                    >
                                        {r.root}
                                        {unique && <Sparkles className="inline-block w-3 h-3 mr-1 mb-0.5" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const SurahProfile: React.FC = () => {
    const [, params] = useRoute('/surah/:id');
    const [data, setData] = useState<SurahData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AppError | null>(null);
    const [, setLocation] = useLocation();

    // Interaction State
    const [isReadingMode, setIsReadingMode] = useState(false);

    // Parallax & Scroll Effects
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroY = useTransform(scrollY, [0, 300], [0, 100]);
    const contentY = useTransform(scrollY, [0, 300], [0, -50]);

    // Track scroll for sticky header
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        return scrollY.on("change", (latest) => {
            setIsScrolled(latest > 300);
        });
    }, [scrollY]);

    const surahId = params?.id;

    useEffect(() => {
        if (!surahId) return;

        const fetchSurah = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await apiClient.get<{ success: boolean; data: SurahData }>(`surahs/${surahId}`);
                if (result.success) {
                    setData(result.data);
                } else {
                    throw new AppError('Failed to load Surah details');
                }
            } catch (err) {
                console.error(err);
                if (err instanceof AppError) {
                    setError(err);
                } else {
                    setError(new AppError('Connection Error'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSurah();
    }, [surahId]);

    const handleRootClick = (root: string) => {
        setLocation(`/details/${root}/root/search`);
    };

    const isUnique = (root: string) => data?.stats.uniqueRoots.includes(root) || false;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background relative overflow-hidden">
                <QuranLoader message="جاري استحضار السورة..." />
            </div>
        );
    }

    if (error) {
        if (error.name === 'NetworkError') {
            return <NetworkErrorPage onRetry={() => window.location.reload()} />;
        }
        if (error.name === 'ServerError') {
            return <ServerErrorPage error={error} onRetry={() => window.location.reload()} />;
        }
        return (
            <ErrorLayout
                title="تعذر تحميل البيانات"
                description={error.message}
                icon={<AlertCircle className="w-10 h-10 text-destructive" />}
                action="retry"
                onRetry={() => window.location.reload()}
            />
        );
    }
    if (!data) return null;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden pt-16">

            {/* 0. STICKY HEADER */}
            <AnimatePresence>
                {isScrolled && (
                    <motion.header
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-16 left-0 right-0 z-30 h-14 bg-background/80 backdrop-blur-md border-b border-border shadow-sm flex items-center justify-between px-4 lg:px-8"
                    >
                        <div className="flex items-center gap-4">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                                            <Link href="/">
                                                <Search className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">الرئيسية</span>
                                            </Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="rtl:rotate-180" />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                                            <Link href="/dashboard">
                                                <LayoutDashboard className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">لوحة التحكم</span>
                                            </Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="rtl:rotate-180" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="font-bold text-primary flex items-center gap-2">
                                            <span className="font-quran text-lg pt-1">{data.name.replace('سورة ', '')}</span>
                                            <Badge variant="outline" className="text-[10px] px-1.5 h-4 hidden sm:flex border-primary/20">
                                                {data.number}
                                            </Badge>
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setIsReadingMode(!isReadingMode)}
                                size="sm"
                                variant={isReadingMode ? "default" : "outline"}
                                className={`rounded-full transition-all ${isReadingMode ? "shadow-md bg-primary text-primary-foreground" : "border-primary/20 text-primary hover:bg-primary/5"}`}
                            >
                                {isReadingMode ? <BookOpen className="w-3.5 h-3.5 ml-2" /> : <Eye className="w-3.5 h-3.5 ml-2" />}
                                {isReadingMode ? 'وضع التحليل' : 'وضع القراءة'}
                            </Button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* 1. IMMERSIVE HERO SECTION */}
            <motion.div
                style={{ opacity: heroOpacity, y: heroY }}
                className={`relative flex flex-col items-center justify-center transition-all duration-1000 -mt-16 ${isReadingMode ? 'h-[40vh]' : 'h-[75vh]'}`}
            >
                {/* Background Atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background z-0"></div>

                {/* Orbital Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <div className="w-[800px] h-[800px] border border-primary/10 rounded-full animate-[spin_60s_linear_infinite]" />
                    <div className="w-[600px] h-[600px] border border-secondary/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                </div>

                {/* Content */}
                <div className="z-10 text-center space-y-6 px-4 max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <Badge variant="outline" className="border-secondary/30 bg-secondary/5 text-secondary-foreground px-4 py-1 text-xs tracking-widest uppercase font-bold">
                            سورة رقم {data.number} • {data.number < 2 ? 'مكية' : 'مدنية'}
                        </Badge>
                    </motion.div>

                    <motion.h1
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, type: "spring" }}
                        className={`font-quran text-primary drop-shadow-sm ${isReadingMode ? 'text-6xl' : 'text-8xl md:text-9xl'} leading-tight`}
                    >
                        {data.name.replace('سورة ', '')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg md:text-2xl text-muted-foreground font-quran"
                    >
                        {data.stats.uniqueRoots.length > 0
                            ? `تتميز بـ ${data.stats.uniqueRoots.length} جذراً لغوياً فريداً`
                            : `من أمهات سور القرآن الكريم`
                        }
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center justify-center gap-4 mt-8"
                    >
                        <Button
                            onClick={() => setIsReadingMode(!isReadingMode)}
                            className={`rounded-full px-8 py-6 border transition-all duration-500 font-bold ${isReadingMode
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                                : 'bg-background text-primary border-primary hover:bg-primary/5'}`}
                        >
                            {isReadingMode ? <BookOpen className="w-5 h-5 ml-2" /> : <Eye className="w-5 h-5 ml-2" />}
                            {isReadingMode ? 'وضع التحليل' : 'وضع القراءة'}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* 2. CONTENT CONTAINER */}
            <motion.div
                style={{ y: contentY }}
                className="relative z-20 container mx-auto px-4 pb-20 -mt-20 max-w-7xl"
            >
                {/* --- ANALYTICS DASHBOARD --- */}
                <AnimatePresence>
                    {!isReadingMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-20"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Unique DNA Card */}
                                <div className="md:col-span-4 group">
                                    <div className="relative h-full bg-card/60 backdrop-blur-xl border border-amber-500/20 rounded-3xl overflow-hidden hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all p-6">
                                        <div className="absolute top-0 end-0 w-32 h-32 bg-amber-500/10 rounded-be-[100px] -z-10" />

                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-500">
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground font-quran">الدرر الفريدة</h3>
                                                <p className="text-xs text-muted-foreground">بصمة السورة الخاصة</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            {data.stats.uniqueRoots.length > 0 ? (
                                                data.stats.uniqueRoots.map((root) => (
                                                    <motion.button
                                                        key={'unique-' + root}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleRootClick(root)}
                                                        className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg font-bold text-sm hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/50"
                                                    >
                                                        {root}
                                                    </motion.button>
                                                ))
                                            ) : (
                                                <div className="w-full text-center py-8 text-muted-foreground italic font-quran text-lg">
                                                    لا توجد جذور متفردة في هذه السورة
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Root Structure Chart */}
                                <div className="md:col-span-8">
                                    <div className="h-full bg-card/60 backdrop-blur-xl border border-primary/20 rounded-3xl overflow-hidden p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                                <Anchor className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground font-quran">البنية الجذرية</h3>
                                                <p className="text-xs text-muted-foreground">الجذور الأكثر تأثيراً وتكراراً</p>
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-2 h-[200px] mt-8">
                                            {data.stats.topRoots.slice(0, 12).map((item, i) => {
                                                const height = Math.max(10, (item.frequency / data.stats.topRoots[0].frequency) * 100);
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => handleRootClick(item.root)}>
                                                        <div className="w-full relative flex flex-col justify-end overflow-hidden rounded-t-lg bg-secondary/5 group-hover:bg-secondary/10 transition-colors" style={{ height: '100%' }}>
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${height}%` }}
                                                                transition={{ duration: 1, delay: i * 0.05 }}
                                                                className="w-full bg-primary/60 border-t-4 border-primary relative group-hover:bg-primary/80 transition-colors"
                                                            >
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded shadow-sm z-10 font-mono">
                                                                    {item.frequency}
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                        <span className="text-xs md:text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors font-quran pt-1">{item.root}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- SEPARATOR --- */}
                <div className="flex items-center justify-center gap-8 py-10 opacity-60">
                    <div className="h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent flex-1" />
                    <div className="font-quran text-4xl text-primary drop-shadow-sm">﷽</div>
                    <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent flex-1" />
                </div>

                {/* --- AYAH STREAM --- */}
                <div className={`mt-8 space-y-8 mx-auto transition-all duration-700 ${isReadingMode ? 'max-w-3xl' : 'max-w-5xl'}`}>
                    {data.ayahs.map((ayah, idx) => (
                        <SurahAyahView
                            key={ayah.ayah_no}
                            ayah={ayah}
                            roots={data.roots}
                            surahNumber={data.number}
                            isReadingMode={isReadingMode}
                            onRootClick={handleRootClick}
                            index={idx}
                            isUnique={isUnique}
                        />
                    ))}
                </div>
            </motion.div>

            <ScrollToTop />
        </div>
    );
};

export default SurahProfile;