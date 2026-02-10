import React, { useMemo, useState } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useQuran } from '../contexts/QuranContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { LayoutDashboard, Search, FileText, Component, Hash, ArrowUp, ArrowDown, ListFilter, BookOpen, Layers, Clock } from 'lucide-react';
import { AyahList } from '../components/AyahList';
import { Card, CardContent } from '../components/ui/card';
import { QuranLoader } from '../components/ui/QuranLoader';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { motion } from 'framer-motion';

// Helper to remove Tashkeel
const removeTashkeel = (text: string) => {
    return text.replace(/[\u064B-\u065F\u0670]/g, '');
};

const DetailView: React.FC = () => {
    const [match, params] = useRoute('/details/:root/:type/:value');
    const { searchResults, statistics, searchByRoot, loading } = useQuran();
    const [_, setLocation] = useLocation();

    // Local State
    const [searchQuery, setSearchQuery] = useState('');
    const [displayLimit, setDisplayLimit] = useState(10);
    const [sortBy, setSortBy] = useState<'default' | 'length_asc' | 'length_desc'>('default');

    const searchParams = new URLSearchParams(window.location.search);
    const focusAyahIdProp = searchParams.get('focus');
    const focusAyahId = focusAyahIdProp ? parseInt(focusAyahIdProp) : undefined;

    const { root, type, value } = params || {};
    const decodedValue = value ? decodeURIComponent(value) : '';
    const decodedRoot = root ? decodeURIComponent(root) : '';

    React.useEffect(() => {
        if (decodedRoot) {
            if (!searchResults || searchResults.root !== decodedRoot) {
                searchByRoot(decodedRoot);
            }
        } else {
            setLocation('/');
        }
    }, [decodedRoot, searchResults, searchByRoot, setLocation]);

    const handleRootClick = (rootToNav: string) => {
        setLocation(`/details/${rootToNav}/root/search`);
    };

    // 1. Base Filtering Logic
    const { baseList, title, description, icon: HeaderIcon } = useMemo(() => {
        if (!searchResults || !params) {
            return { baseList: [], title: "", description: "", icon: FileText };
        }

        let ayahs = searchResults.ayahs || [];
        let pageTitle = "";
        let pageDesc = "";
        let PageIcon = FileText;

        switch (type) {
            case 'surah':
                ayahs = ayahs.filter(a => a.surahName === decodedValue);
                pageTitle = `سورة ${decodedValue}`;
                pageDesc = `استعراض مواضع جذر "${decodedRoot}" في هذه السورة`;
                PageIcon = BookOpen;
                break;

            case 'era':
                ayahs = ayahs.filter(a => a.type === decodedValue); // Assuming 'type' exists or handled elsewhere
                // If not filtered in backend, logic remains same
                pageTitle = `الآيات ${decodedValue === 'meccan' ? 'المكية' : 'المدنية'}`;
                pageDesc = `استعراض المواضع حسب عهد النزول`;
                PageIcon = Clock;
                break;

            case 'juz':
                const juzNum = parseInt(decodedValue.replace(/\D/g, ''));
                if (!isNaN(juzNum)) ayahs = ayahs.filter(a => a.juz === juzNum);
                pageTitle = `الجزء ${decodedValue}`;
                pageDesc = `مواضع الجذر في الجزء القرآني`;
                PageIcon = Layers;
                break;

            case 'page':
                const pageNum = parseInt(decodedValue.replace(/\D/g, ''));
                if (!isNaN(pageNum)) ayahs = ayahs.filter(a => a.page === pageNum);
                pageTitle = `الصفحة ${decodedValue}`;
                pageDesc = `مواضع الجذر في الصفحة`;
                PageIcon = FileText;
                break;

            case 'form':
                ayahs = ayahs.filter(a =>
                    a.tokens.some((t: any) => (t.token_plain_norm || t.token) === decodedValue)
                );
                pageTitle = `الصيغة: "${decodedValue}"`;
                pageDesc = `الآيات التي وردت فيها هذه الصيغة اللفظية`;
                PageIcon = Component;
                break;

            case 'compare':
                ayahs = ayahs.filter(a => a.otherRoots.includes(decodedValue));
                pageTitle = `اقتران مع "${decodedValue}"`;
                pageDesc = `الآيات التي جمعت بين "${decodedRoot}" و "${decodedValue}"`;
                PageIcon = Hash;
                break;

            default:
                pageTitle = `نتائج البحث`;
                PageIcon = Search;
                break;
        }

        return { baseList: ayahs, title: pageTitle, description: pageDesc, icon: PageIcon };
    }, [searchResults, params, type, decodedValue, decodedRoot]);

    // 2. Second Layer Filtering
    const filteredList = useMemo(() => {
        let list = baseList || [];

        if (searchQuery.trim()) {
            const normalizedQuery = removeTashkeel(searchQuery.trim());
            list = list.filter(a => {
                const normalizedText = removeTashkeel(a.text);
                return normalizedText.includes(normalizedQuery);
            });
        }

        if (sortBy === 'length_asc') {
            list = [...list].sort((a, b) => a.text.length - b.text.length);
        } else if (sortBy === 'length_desc') {
            list = [...list].sort((a, b) => b.text.length - a.text.length);
        } else {
            if (focusAyahId) {
                list = [...list].sort((a, b) => {
                    const idA = parseInt(a.id);
                    const idB = parseInt(b.id);
                    if (idA === focusAyahId) return -1;
                    if (idB === focusAyahId) return 1;
                    return idA - idB;
                });
            }
        }

        return list;
    }, [baseList, searchQuery, sortBy, focusAyahId]);

    const paginatedList = filteredList.slice(0, displayLimit);

    // 3. Scoped Statistics
    const scopedStats = useMemo(() => {
        if (!filteredList) return [];
        const uniqueSurahs = new Set(filteredList.map(a => a.surahName)).size;
        const totalAyahs = filteredList.length;
        const avgLength = totalAyahs > 0
            ? Math.round(filteredList.reduce((acc, curr) => acc + curr.text.length, 0) / totalAyahs)
            : 0;

        return [
            { label: 'عدد النتائج', value: totalAyahs, icon: Hash, style: 'text-primary bg-primary/10 border-primary/20' },
            { label: 'السور', value: uniqueSurahs, icon: Component, style: 'text-secondary bg-secondary/10 border-secondary/20' },
            { label: 'متوسط الطول', value: avgLength, icon: FileText, style: 'text-rose-600 bg-rose-500/10 border-rose-500/20' },
        ];
    }, [filteredList]);


    if (loading || (decodedRoot && (!searchResults || searchResults.root !== decodedRoot))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <QuranLoader message={`جاري استحضار تفاصيل "${decodedRoot}"...`} />
            </div>
        );
    }

    if (!searchResults || !statistics || !match || !params) return null;

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20 pb-20 font-sans">

            {/* Navigation Header */}
            <header className="sticky top-16 z-30 w-full backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
                <div className="container flex h-14 items-center">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild className="hover:text-primary transition-colors cursor-pointer">
                                    <Link href="/">الرئيسية</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="rtl:rotate-180" />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild className="hover:text-primary transition-colors cursor-pointer">
                                    <Link href="/dashboard">لوحة التحكم</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="rtl:rotate-180" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-bold text-primary flex items-center gap-1 font-quran text-lg pt-1">
                                    {title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <main className="container pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto space-y-8">

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-2xl bg-card border border-primary/10 p-8 shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full text-xs font-bold text-primary border border-primary/10">
                                <HeaderIcon className="w-3.5 h-3.5" />
                                {type === 'compare' ? 'تحليل مقارن' : 'تصفية النتائج'}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-primary font-quran">{title}</h1>
                            <p className="text-muted-foreground max-w-xl text-lg">{description}</p>
                        </div>

                        {/* Mini Stats in Hero */}
                        <div className="flex gap-3">
                            {scopedStats.map((stat, i) => (
                                <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-xl border min-w-[80px] ${stat.style}`}>
                                    <stat.icon className="w-5 h-5 mb-1 opacity-80" />
                                    <span className="font-bold text-xl font-mono">{stat.value}</span>
                                    <span className="text-[10px] opacity-70">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="sticky top-32 z-40 bg-card/80 backdrop-blur-md p-3 rounded-xl border border-primary/10 shadow-lg flex flex-col md:flex-row gap-3 justify-between items-center transition-all">
                    {/* Search Field */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث دقيق داخل النتائج..."
                            className="pe-10 bg-background border-border focus-visible:ring-primary/20 h-11"
                        />
                    </div>

                    {/* Sort Controls */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
                            <Button
                                variant={sortBy === 'default' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setSortBy('default')}
                                className="h-8 text-xs"
                            >
                                <ListFilter className="w-3.5 h-3.5 me-1" />
                                افتراضي
                            </Button>
                            <Button
                                variant={sortBy === 'length_asc' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setSortBy('length_asc')}
                                className="h-8 text-xs"
                            >
                                <ArrowDown className="w-3.5 h-3.5 me-1" />
                                الأقصر
                            </Button>
                            <Button
                                variant={sortBy === 'length_desc' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setSortBy('length_desc')}
                                className="h-8 text-xs"
                            >
                                <ArrowUp className="w-3.5 h-3.5 me-1" />
                                الأطول
                            </Button>
                        </div>

                        <div className="hidden md:flex items-center px-3 py-1.5 bg-primary/5 rounded-md border border-primary/10">
                            <span className="text-xs text-muted-foreground">النتائج:</span>
                            <span className="text-sm font-bold text-primary mx-1">{filteredList.length}</span>
                        </div>
                    </div>
                </div>

                {/* Content List */}
                <AyahList
                    ayahs={paginatedList}
                    highlightQuery={searchQuery || (type === 'form' ? decodedValue : undefined)}
                    focusAyahId={focusAyahId}
                    onRootClick={handleRootClick}
                />

                {/* Pagination */}
                {filteredList.length > displayLimit && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex justify-center pt-8"
                    >
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setDisplayLimit(prev => prev + 10)}
                            className="min-w-[200px] border-primary/20 hover:bg-primary/5 hover:text-primary gap-2"
                        >
                            <ArrowDown className="w-4 h-4" />
                            عرض المزيد من الآيات
                        </Button>
                    </motion.div>
                )}

                {/* Empty State */}
                {filteredList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">لا توجد نتائج مطابقة</h3>
                        <p className="text-muted-foreground">جرب تغيير كلمات البحث أو إزالة الفلاتر</p>
                        <Button
                            variant="link"
                            onClick={() => setSearchQuery('')}
                            className="mt-2 text-primary"
                        >
                            مسح البحث
                        </Button>
                    </div>
                )}

            </main>

            <ScrollToTop />
        </div>
    );
};

export default DetailView;