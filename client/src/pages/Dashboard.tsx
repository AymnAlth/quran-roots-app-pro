import React, { useMemo } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowRight, Printer, TrendingUp, BookOpen, Layers, Activity, Fingerprint, Star, Share2, Clock, MapPin, ListFilter, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';
import { RevelationTimeline, EraDistribution, NetworkGraph, WordFormsList, RelationshipMatrix } from '../components/charts/DashboardCharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { PageContainer } from '../components/ui/PageContainer';

// --- Custom Local Components (Styled with Islamic Identity) ---

const SurahHeatmap = ({ surahData, onClick }: { surahData: { [key: string]: number }, onClick?: (surah: string) => void }) => {
    const entries = Object.entries(surahData);
    const max = Math.max(...Object.values(surahData), 1);

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-1 justify-center p-6 bg-card rounded-xl border border-primary/10 shadow-sm">
                {entries.map(([name, count], i) => (
                    <motion.div
                        key={i}
                        onClick={() => onClick && onClick(name)}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.005 }}
                        className="group relative flex-col items-center justify-center cursor-pointer"
                    >
                        {/* Heatmap Cell: Teal (Primary) Theme */}
                        <div
                            className={`w-2.5 h-10 md:w-3 md:h-14 rounded-sm transition-all duration-300 hover:scale-125 hover:z-10 ${count > 0 ? 'bg-primary shadow-[0_0_8px_theme(colors.primary.DEFAULT)]' : 'bg-muted'
                                }`}
                            style={{
                                opacity: Math.max(0.15, count / max), // Minimum opacity for better visibility
                            }}
                        />

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block bg-popover text-popover-foreground text-xs px-3 py-2 rounded-md shadow-xl border border-border whitespace-nowrap z-50 pointer-events-none">
                            <div className="font-bold text-primary font-quran text-sm mb-0.5">سورة {name}</div>
                            <div className="text-muted-foreground">{count} موضع</div>
                            {/* Decorative arrow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover rotate-45 border-r border-b border-border"></div>
                        </div>
                    </motion.div>
                ))}
                {entries.length === 0 && <div className="text-muted-foreground text-sm font-quran">لا توجد بيانات كافية للرسم الحراري</div>}
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground mt-3 px-2 font-medium">
                <span>توزيع الكثافة (اللون الأغمق = تكرار أكثر)</span>
                <span>{entries.length} سورة</span>
            </div>
        </div>
    );
};

const CustomBarChart = ({ data, onClick }: { data: { label: string, value: number }[], onClick?: (label: string) => void }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="space-y-4">
            {data.map((d, i) => (
                <div key={i} className="group flex items-center gap-4 text-sm cursor-pointer hover:bg-secondary/5 p-2 rounded-lg transition-colors" onClick={() => onClick && onClick(d.label)}>
                    {/* Label with Quran Font */}
                    <div className="w-28 text-muted-foreground truncate font-quran text-base group-hover:text-primary transition-colors">{d.label}</div>

                    {/* Bar Area */}
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(d.value / max) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-l from-primary to-primary/70 rounded-full group-hover:from-secondary group-hover:to-secondary/80 transition-colors duration-500"
                        />
                    </div>

                    {/* Value Badge */}
                    <div className="w-8 text-end font-bold text-primary group-hover:text-secondary text-sm font-mono">{d.value}</div>
                </div>
            ))}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { statistics, searchResults } = useQuran();
    const [_, setLocation] = useLocation();
    const [timelineSort, setTimelineSort] = React.useState<'quran' | 'revelation'>('quran');

    React.useEffect(() => {
        if (!searchResults || !statistics) {
            setLocation('/');
        }
    }, [searchResults, statistics, setLocation]);

    // --- FIX: Early Return to prevent rendering null data ---
    if (!searchResults || !statistics) {
        return (
            <PageContainer
                isLoading={true}
                loadingMessage="جاري تحميل البيانات..."
                contain={false}
                className="p-0 pt-0 pb-0 bg-background"
            >
                <div className="min-h-screen" />
            </PageContainer>
        );
    }

    // --- Derived Data ---
    const topSurahs = useMemo(() => {
        if (!statistics) return [];
        return Object.entries(statistics.surahDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([name, count]) => ({ label: `سورة ${name}`, value: count }));
    }, [statistics]);

    // Deep Insights Calculation
    const { longestAyah, shortestAyah, centerOfGravityData } = useMemo(() => {
        if (!searchResults) return { longestAyah: null, shortestAyah: null, centerOfGravityData: { maxFrequency: 0, candidates: [] } };
        const sorted = [...searchResults.ayahs].sort((a, b) => a.text.length - b.text.length);
        let maxFreq = 0;
        searchResults.ayahs.forEach(a => {
            const count = Number(a.rootCount) || 0;
            if (count > maxFreq) maxFreq = count;
        });
        const candidates = searchResults.ayahs.filter(a => (Number(a.rootCount) || 0) === maxFreq);
        return {
            shortestAyah: sorted[0],
            longestAyah: sorted[sorted.length - 1],
            centerOfGravityData: { maxFrequency: maxFreq, candidates: candidates }
        };
    }, [searchResults]);

    const [cgIndex, setCgIndex] = React.useState(0);
    // React hook usage must be consistent, so we keep this even if we return early above
    React.useEffect(() => { setCgIndex(0); }, [searchResults?.root]);

    const currentCgAyah = centerOfGravityData.candidates[cgIndex];
    const isUniform = centerOfGravityData.maxFrequency <= 1;

    const handleNavigation = (type: string, value: string, focusAyahId?: number) => {
        if (!searchResults) return;
        const encodedType = encodeURIComponent(type);
        const encodedValue = encodeURIComponent(value);
        const encodedRoot = encodeURIComponent(searchResults.root);
        let path = `/details/${encodedRoot}/${encodedType}/${encodedValue}`;
        if (focusAyahId !== undefined) {
            path += `?focus=${focusAyahId}`;
        }
        setLocation(path);
    };

    return (
        <PageContainer
            isLoading={!searchResults || !statistics}
            loadingMessage="جاري تحليل البيانات القرآنية..."
            contain={false}
            className="p-0 pt-0 pb-0 bg-background"
        >
            {/* Header */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/40">
                <div className="container flex h-16 items-center justify-between">
                    <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={() => setLocation('/')}>
                        <ArrowRight className="w-4 h-4" />
                        <span className="font-bold">العودة للبحث</span>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => window.print()} title="طباعة" className="text-muted-foreground hover:text-primary">
                            <Printer className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container pt-8 animate-in fade-in duration-700 space-y-12 pb-20">

                {/* HERO SECTION: Islamic Cream/Gold Theme */}
                <section className="relative overflow-hidden rounded-3xl bg-card border border-primary/10 p-8 md:p-12 text-center shadow-lg shadow-primary/5">
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0f4c5c_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-30" />

                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 backdrop-blur rounded-full border border-secondary/20 text-xs font-bold text-secondary-foreground mb-6">
                            <Activity className="w-3.5 h-3.5" />
                            التحليل البياني الشامل
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold text-primary font-quran mb-4 drop-shadow-sm tracking-wide">
                            جذر <span className="text-secondary">{searchResults!.root}</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed font-light">
                            استكشاف الرحلة القرآنية عبر <span className="font-bold text-primary">{statistics!.totalOccurrences}</span> موضعاً في <span className="font-bold text-primary">{statistics!.uniqueSurahs}</span> سورة
                        </p>
                    </motion.div>
                </section>

                {/* KPI Grid: Standardized Colors */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: "إجمالي المواضع", value: statistics!.totalOccurrences, icon: Layers, style: "text-primary bg-primary/10 border-primary/20" },
                        { label: "عدد الآيات", value: statistics!.totalAyahs, icon: BookOpen, style: "text-secondary bg-secondary/10 border-secondary/20" },
                        { label: "عدد السور", value: statistics!.uniqueSurahs, icon: Fingerprint, style: "text-rose-600 bg-rose-500/10 border-rose-500/20" }, // Rose for contrast
                        { label: "المتوسط / آية", value: statistics!.averageOccurrencesPerAyah, icon: TrendingUp, style: "text-primary bg-primary/5 border-primary/10" },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative overflow-hidden bg-card border border-border/50 p-6 rounded-2xl hover:border-primary/20 transition-all duration-300 hover:shadow-md"
                        >
                            <div className={`absolute top-0 end-0 p-3 rounded-bs-2xl border-b border-l ${stat.style} transition-all`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className="mt-4">
                                <div className="text-4xl font-bold text-foreground mb-2 group-hover:scale-105 transition-transform origin-right font-mono">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground font-bold">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Center of Gravity: Golden Theme */}
                {currentCgAyah && centerOfGravityData.maxFrequency > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-br from-card via-background to-secondary/5 p-6 md:p-8 shadow-sm"
                    >
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-10">
                            <div className="flex-shrink-0 p-4 rounded-full bg-secondary/10 text-secondary shadow-inner ring-1 ring-secondary/20">
                                <Star className="w-8 h-8 md:w-10 md:h-10 fill-secondary/20" />
                            </div>

                            <div className="flex-1 text-center md:text-right space-y-4 w-full">
                                <div>
                                    <div className="text-secondary font-bold text-sm tracking-wider uppercase mb-2 flex items-center justify-center md:justify-start gap-2">
                                        مركز ثقل الجذر
                                        {centerOfGravityData.candidates.length > 1 && (
                                            <span className="text-[10px] bg-secondary/20 px-2 py-0.5 rounded-full text-secondary-foreground/80">
                                                {cgIndex + 1} من {centerOfGravityData.candidates.length}
                                            </span>
                                        )}
                                    </div>

                                    <div className="relative min-h-[120px] flex items-center justify-center md:justify-start">
                                        {/* Arrows for multiple candidates */}
                                        {centerOfGravityData.candidates.length > 1 && (
                                            <>
                                                <Button variant="ghost" size="icon" className="absolute -right-8 md:-right-12 z-20 hover:text-secondary" onClick={() => setCgIndex(prev => (prev === 0 ? centerOfGravityData.candidates.length - 1 : prev - 1))}>
                                                    <ArrowRight className="w-6 h-6 rotate-180 opacity-50 hover:opacity-100" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="absolute -left-8 md:-left-12 z-20 hover:text-secondary" onClick={() => setCgIndex(prev => (prev === centerOfGravityData.candidates.length - 1 ? 0 : prev + 1))}>
                                                    <ArrowRight className="w-6 h-6 opacity-50 hover:opacity-100" />
                                                </Button>
                                            </>
                                        )}

                                        <motion.h3
                                            key={currentCgAyah.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-xl md:text-3xl font-quran leading-loose md:leading-[2.8] text-foreground w-full px-4 md:px-0 drop-shadow-sm"
                                        >
                                            "{currentCgAyah.text}"
                                        </motion.h3>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs md:text-sm font-bold mt-4">
                                    <span className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground border border-border">
                                        سورة {currentCgAyah.surahName}
                                    </span>
                                    <span className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground border border-border">
                                        الآية {currentCgAyah.ayahNo}
                                    </span>
                                    <span className="px-3 py-1.5 rounded-md bg-secondary/10 text-secondary border border-secondary/20">
                                        {currentCgAyah.rootCount} تكرارات للجذر
                                    </span>
                                </div>
                            </div>

                            <div className="flex-shrink-0 self-center md:self-end mt-4 md:mt-0">
                                <Button
                                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-md shadow-secondary/10 gap-2"
                                    onClick={() => handleNavigation('surah', currentCgAyah.surahName, parseInt(currentCgAyah.id))}
                                >
                                    عرض السياق
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Timeline & Era */}
                {statistics!.timeline && statistics!.era && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-primary/10 bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50 mb-4">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 font-quran text-2xl text-primary">
                                        <Clock className="w-6 h-6 text-secondary" />
                                        تطور المفهوم عبر الوحي
                                    </CardTitle>
                                    <CardDescription>تتبع استخدام الجذر</CardDescription>
                                </div>
                                <Select value={timelineSort} onValueChange={(v: 'quran' | 'revelation') => setTimelineSort(v)}>
                                    <SelectTrigger className="w-[160px] h-9 text-xs bg-muted border-border">
                                        <SelectValue placeholder="ترتيب العرض" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="quran">ترتيب المصحف</SelectItem>
                                        <SelectItem value="revelation">ترتيب النزول</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardHeader>
                            <CardContent>
                                <RevelationTimeline
                                    data={[...(statistics!.timeline || [])].sort((a, b) => timelineSort === 'quran' ? (a.surahNo || 0) - (b.surahNo || 0) : a.order - b.order)}
                                    onClick={(surah) => handleNavigation('surah', surah)}
                                />
                            </CardContent>
                        </Card>

                        <Card className="border-primary/10 bg-card shadow-sm">
                            <CardHeader className="border-b border-border/50 mb-4">
                                <CardTitle className="flex items-center gap-2 font-quran text-2xl text-primary">
                                    <MapPin className="w-6 h-6 text-secondary" />
                                    المكي والمدني
                                </CardTitle>
                                <CardDescription>توزيع الاستخدام حسب العهد</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EraDistribution
                                    data={statistics!.era}
                                    onClick={(era) => handleNavigation('era', era)}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Network & Forms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* بطاقة المشتقات (بدون تغيير) */}
                    <Card className="border-primary/10 bg-card shadow-sm h-full">
                        <CardHeader className="border-b border-border/50 mb-4">
                            <CardTitle className="flex items-center gap-2 font-quran text-2xl text-primary">
                                <ListFilter className="w-6 h-6 text-secondary" />
                                المشتقات ({statistics!.forms ? statistics!.forms.length : 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statistics!.forms ? (
                                <WordFormsList forms={statistics!.forms} onClick={(form) => handleNavigation('form', form)} />
                            ) : <div className="text-muted-foreground text-sm">جاري التحميل...</div>}
                        </CardContent>
                    </Card>

                    {/* بطاقة الشبكة المفاهيمية (مع زر التوسيع الجديد) */}
                    <Card className="border-primary/10 bg-card shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 mb-4 pb-2">
                            <CardTitle className="flex items-center gap-2 font-quran text-2xl text-primary">
                                <Share2 className="w-6 h-6 text-secondary" />
                                الشبكة المفاهيمية
                            </CardTitle>
                            
                            {/* زر الانتقال للمرحلة الثالثة (المجرة) */}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setLocation('/dashboard/network')}
                                title="استعراض الشبكة الكونية (شاشة كاملة)"
                                className="text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-colors"
                            >
                                <Maximize className="w-5 h-5" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {statistics!.network ? (
                                <div className="relative group">
                                    <NetworkGraph
                                        nodes={statistics!.network.nodes}
                                        links={statistics!.network.links}
                                        onClick={(root) => { if (root !== statistics!.network.nodes[0].id) handleNavigation('compare', root); }}
                                    />
                                    {/* تلميح إضافي للمستخدم */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <span className="bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs border border-primary/20 text-primary font-bold shadow-sm">
                                            اضغط زر التوسيع ⤢ للأفضل
                                        </span>
                                    </div>
                                </div>
                            ) : <div className="text-muted-foreground text-sm">جاري التحميل...</div>}
                        </CardContent>
                    </Card>
                </div>

                {/* Matrix */}
                {statistics!.matrix && statistics!.matrix.length > 0 && (
                    <Card className="border-primary/10 bg-card shadow-sm">
                        <CardHeader className="border-b border-border/50 mb-4">
                            <CardTitle className="flex items-center gap-2 font-quran text-2xl text-primary">
                                <Share2 className="w-6 h-6 text-secondary" />
                                مصفوفة العلاقات
                            </CardTitle>
                            <CardDescription>التقاطعات المشتركة مع الجذور الأخرى</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RelationshipMatrix
                                data={statistics!.matrix}
                                onClick={(rootA, rootB) => {
                                    if (rootA === searchResults!.root) handleNavigation('compare', rootB);
                                    else if (rootB === searchResults!.root) handleNavigation('compare', rootA);
                                    else handleNavigation('compare', rootB);
                                }}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Heatmap & Bars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Card className="border-primary/10 bg-card shadow-sm h-full">
                            <CardHeader className="px-6 pt-6 pb-2">
                                <CardTitle className="flex items-center gap-2 font-quran text-2xl text-primary">
                                    <Activity className="w-6 h-6 text-secondary" />
                                    البصمة التوزيعية
                                </CardTitle>
                                <CardDescription>كثافة ذكر الجذر في السور</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SurahHeatmap surahData={statistics!.surahDistribution} onClick={(surah) => handleNavigation('surah', surah)} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-1">
                        <Card className="border-primary/10 bg-card shadow-sm h-full">
                            <CardHeader className="px-6 pt-6 pb-2">
                                <CardTitle className="font-quran text-2xl text-primary">الأكثر ذكراً</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CustomBarChart
                                    data={topSurahs}
                                    onClick={(surah) => handleNavigation('surah', surah.replace('سورة ', ''))}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Longest/Shortest Ayah */}
                {longestAyah && shortestAyah && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-card rounded-2xl p-6 border border-primary/10 shadow-sm hover:border-primary/20 transition-colors">
                            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-secondary uppercase tracking-wider">
                                <Star className="w-4 h-4" /> أطول آية ذكراً للجذر
                            </div>
                            <div className="text-foreground text-lg leading-loose font-quran dir-rtl border-r-2 border-secondary/20 pr-4">
                                "{longestAyah.text}"
                            </div>
                            <div className="mt-4 text-xs text-muted-foreground font-bold flex justify-between">
                                <span>سورة {longestAyah.surahName}</span>
                                <span>آية {longestAyah.ayahNo}</span>
                            </div>
                        </div>
                        <div className="bg-card rounded-2xl p-6 border border-primary/10 shadow-sm hover:border-primary/20 transition-colors">
                            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-primary uppercase tracking-wider">
                                <Star className="w-4 h-4" /> أقصر آية ذكراً للجذر
                            </div>
                            <div className="text-foreground text-lg leading-loose font-quran dir-rtl border-r-2 border-primary/20 pr-4">
                                "{shortestAyah.text}"
                            </div>
                            <div className="mt-4 text-xs text-muted-foreground font-bold flex justify-between">
                                <span>سورة {shortestAyah.surahName}</span>
                                <span>آية {shortestAyah.ayahNo}</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <ScrollToTop />
        </PageContainer>
    );
};

export default Dashboard;