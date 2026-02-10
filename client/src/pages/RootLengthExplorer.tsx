import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../lib/apiClient';
import { useRoute, useLocation } from 'wouter';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, ArrowRight, Search, Database, Component, Sparkles, Scale, Info } from 'lucide-react';
import { useQuran } from '../contexts/QuranContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { QuranLoader } from '../components/ui/QuranLoader';
import { NetworkError as NetworkErrorPage } from '@/components/errors/NetworkError';
import { ServerError as ServerErrorPage } from '@/components/errors/ServerError';
import { ErrorLayout } from '@/components/errors/ErrorLayout';
import { AppError } from '../lib/errors';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

interface RootItem {
    root: string;
    count: number;
}

interface LengthStats {
    roots: RootItem[];
    summary: {
        total_occurrences: number;
        total_roots: number;
    }
}

const BATCH_SIZE = 48;

const RootLengthExplorer: React.FC = () => {
    const [match, params] = useRoute('/morphology/:length');
    const [_, setLocation] = useLocation();

    const [data, setData] = useState<LengthStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AppError | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

    const { scrollY } = useScroll();
    // Parallax effect for header
    const headerY = useTransform(scrollY, [0, 300], [0, 100]);
    const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    const length = params?.length ? parseInt(params.length) : 0;

    useEffect(() => {
        if (!length) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await apiClient.get<{ success: boolean; data: LengthStats }>(`statistics/roots-by-length/${length}`);
                if (result.success) setData(result.data);
                else throw new AppError('Unknown error');
            } catch (err) {
                if (err instanceof AppError) setError(err);
                else setError(new AppError('Failed to load roots data'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [length]);

    const handleRootClick = (root: string) => {
        setLocation(`/details/${encodeURIComponent(root)}/root/search`);
    };

    const filteredRoots = useMemo(() => {
        if (!data) return [];
        if (!searchQuery) return data.roots;
        return data.roots.filter(r => r.root.includes(searchQuery));
    }, [data, searchQuery]);

    const visibleRoots = useMemo(() => {
        return filteredRoots.slice(0, visibleCount);
    }, [filteredRoots, visibleCount]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && visibleCount < filteredRoots.length) {
                setVisibleCount(prev => Math.min(prev + BATCH_SIZE, filteredRoots.length));
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [visibleCount, filteredRoots.length]);

    useEffect(() => {
        setVisibleCount(BATCH_SIZE);
    }, [searchQuery, length]);

    const getLengthName = (len: number) => {
        if (len === 3) return "الثلاثية";
        if (len === 4) return "الرباعية";
        if (len === 5) return "الخماسية";
        if (len === 6) return "السداسية";
        return `${len} أحرف`;
    };

    const getLengthDescription = (len: number) => {
        if (len === 3) return "تشكل الجذور الثلاثية الغالبية العظمى من ألفاظ القرآن، وهي الأساس المتين للغة العربية.";
        if (len === 4) return "الجذور الرباعية أقل شيوعاً، وغالباً ما تدل على معاني دقيقة أو مبالغة أو تعريب.";
        if (len >= 5) return "الجذور الخماسية والسداسية نادرة جداً، وعادة ما تكون أسماء أعجمية أو مركبة.";
        return "";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <QuranLoader message="جاري استحضار المعجم..." />
            </div>
        );
    }

    if (error) {
        if (error.name === 'NetworkError') return <NetworkErrorPage onRetry={() => window.location.reload()} />;
        if (error.name === 'ServerError') return <ServerErrorPage error={error} onRetry={() => window.location.reload()} />;
        return <ErrorLayout title="خطأ" description={error.message} icon={<AlertCircle className="w-10 h-10 text-destructive" />} action="retry" onRetry={() => window.location.reload()} />;
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 pb-20 font-sans overflow-x-hidden">

            {/* Header Background */}
            <div className="fixed top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-primary/10 via-background to-background -z-10 pointer-events-none" />

            {/* Animated Grid Background */}
            <div className="fixed inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10"></div>

            {/* Navigation & Hero */}
            <div className="container relative z-10 pt-8 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-12"
                >
                    <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="group gap-2 hover:bg-primary/10">
                        <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">عودة للوحة التحكم</span>
                    </Button>
                </motion.div>

                <motion.div style={{ y: headerY, opacity: headerOpacity }} className="flex flex-col items-center text-center mb-16 space-y-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-4 bg-primary/10 rounded-full mb-2 ring-1 ring-primary/20">
                        <Scale className="w-10 h-10 text-primary" />
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-bold font-quran text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60 drop-shadow-sm">
                        الجذور {getLengthName(length)}
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-amiri leading-relaxed">
                        {getLengthDescription(length)}
                    </p>

                    {/* Stats Badges */}
                    <div className="flex gap-4 mt-4">
                        <div className="px-4 py-2 bg-card border border-border rounded-full flex items-center gap-2 shadow-sm">
                            <Component className="w-4 h-4 text-secondary" />
                            <span className="font-bold">{data.summary.total_roots.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">جذر فريد</span>
                        </div>
                        <div className="px-4 py-2 bg-card border border-border rounded-full flex items-center gap-2 shadow-sm">
                            <Database className="w-4 h-4 text-primary" />
                            <span className="font-bold">{data.summary.total_occurrences.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">موضع في القرآن</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="container min-h-[500px] relative z-20 -mt-8">

                {/* Search Bar - Sticky & Glassy */}
                <div className="sticky top-6 z-40 mb-10 max-w-2xl mx-auto">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl flex items-center p-2 transition-all group-focus-within:border-primary/50 group-focus-within:ring-4 ring-primary/5">
                            <Search className="w-6 h-6 text-muted-foreground mx-3" />
                            <Input
                                placeholder={`ابحث في الجذور ${getLengthName(length)}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-none bg-transparent text-xl font-quran h-12 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                            />
                            {filteredRoots.length > 0 && (
                                <Badge variant="secondary" className="mx-2 bg-primary/10 text-primary hover:bg-primary/20">
                                    {filteredRoots.length}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Roots Grid */}
                {visibleRoots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-20">
                        {visibleRoots.map((item, index) => (
                            <motion.div
                                key={item.root}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "50px" }}
                                transition={{ duration: 0.4, delay: index % 10 * 0.05 }}
                                onClick={() => handleRootClick(item.root)}
                                className="group cursor-pointer perspective-1000"
                            >
                                <div className="relative h-32 bg-card border border-border rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.1)] group-hover:-translate-y-1 overflow-hidden">

                                    {/* Background decorative letter */}
                                    <span className="absolute -bottom-4 -right-4 text-8xl font-quran text-primary/5 group-hover:text-primary/10 transition-colors select-none pointer-events-none">
                                        {item.root[0]}
                                    </span>

                                    {/* Main Root Text */}
                                    <h3 className="text-3xl font-bold font-quran text-foreground group-hover:text-primary transition-colors z-10">
                                        {item.root}
                                    </h3>

                                    {/* Count Badge */}
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-0.5 rounded-full border border-transparent group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-all z-10">
                                        <Layers className="w-3 h-3" />
                                        <span>{item.count}</span>
                                    </div>

                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                        <div className="p-6 bg-muted/50 rounded-full">
                            <Search className="w-12 h-12 opacity-50" />
                        </div>
                        <p className="text-xl font-amiri">لم يتم العثور على جذور تطابق بحثك</p>
                        <Button variant="link" onClick={() => setSearchQuery('')} className="text-primary">مسح البحث</Button>
                    </motion.div>
                )}

                {/* Loading Spinner */}
                {visibleCount < filteredRoots.length && (
                    <div className="py-8 flex justify-center">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            <ScrollToTop />
        </div>
    );
};

import { AlertCircle } from 'lucide-react';
export default RootLengthExplorer;