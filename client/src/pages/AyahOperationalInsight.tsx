import React from 'react';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { PageContainer } from '@/components/ui/PageContainer';
import { fetchOperationalInsight, type OperationalInsightResponse } from '@/lib/operationalInsightService';

type InsightData = OperationalInsightResponse['data'];

interface Payload {
  surahNo: number;
  ayahNo: number;
  ayahText: string;
}

const parsePayload = (): { payload: Payload | null; fromPath: string } => {
  const query = new URLSearchParams(window.location.search);
  const key = query.get('k');
  const fromPath = query.get('from') || '/';

  let payload: Payload | null = null;

  if (key) {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Payload;
        if (
          Number.isFinite(parsed?.surahNo) &&
          Number.isFinite(parsed?.ayahNo) &&
          typeof parsed?.ayahText === 'string' &&
          parsed.ayahText.trim()
        ) {
          payload = parsed;
        }
      }
    } catch {
      payload = null;
    }
  }

  if (!payload) {
    const surahNo = Number.parseInt(query.get('s') || '', 10);
    const ayahNo = Number.parseInt(query.get('a') || '', 10);
    const ayahText = String(query.get('t') || '').trim();

    if (Number.isFinite(surahNo) && Number.isFinite(ayahNo) && ayahText) {
      payload = { surahNo, ayahNo, ayahText };
    }
  }

  return { payload, fromPath };
};

const buildCopyPayload = (insight: InsightData) => {
  const rootsBlock =
    insight.operationalRoots.length > 0
      ? insight.operationalRoots
          .map((item, i) => `${i + 1}. ${item.root}\n${item.operationalFunction}`)
          .join('\n\n')
      : 'لا توجد جذور تحمل تعريفات تشغيلية في هذه الآية.';

  const analysisText = insight.analysis?.content || insight.message || 'لا يوجد تحليل متاح.';

  return [
    'التحليل التشغيلي للآية',
    `السورة: ${insight.ayah.surahNo} | الآية: ${insight.ayah.ayahNo}`,
    '',
    'نص الآية:',
    insight.ayah.text,
    '',
    'الجذور ذات التعريفات التشغيلية:',
    rootsBlock,
    '',
    'نتيجة التحليل:',
    analysisText,
    '',
    insight.analysis ? `Provider: ${insight.analysis.provider} | Model: ${insight.analysis.model}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  }
};

const AyahOperationalInsight: React.FC = () => {
  const [, setLocation] = useLocation();
  const [{ payload, fromPath }] = React.useState(parsePayload);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<InsightData | null>(null);

  const handleBack = React.useCallback(() => {
    const target = String(fromPath || '').trim();
    if (target) {
      setLocation(target);
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    setLocation('/');
  }, [fromPath, setLocation]);

  const load = React.useCallback(async () => {
    if (!payload) {
      setError('تعذر قراءة بيانات الآية. الرجاء العودة وإعادة المحاولة.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchOperationalInsight(payload);
      setData(response.data);

      if (response.data.operationalRoots.length === 0) {
        toast('لا توجد تعريفات تشغيلية لهذه الآية', {
          description: `سورة ${payload.surahNo} • آية ${payload.ayahNo}`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'تعذر تنفيذ التحليل الآن';
      setError(message);
      toast.error('فشل في التحليل التشغيلي', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [payload]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleCopyAll = React.useCallback(async () => {
    if (!data) return;
    const copied = await copyText(buildCopyPayload(data));
    if (copied) {
      toast.success('تم نسخ جميع النتائج');
    } else {
      toast.error('تعذر نسخ النتائج');
    }
  }, [data]);

  return (
    <PageContainer contain={false} className="p-0 pt-0 pb-0 bg-background" isLoading={false}>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/85 border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5"
            onClick={handleBack}
          >
            <ArrowRight className="w-4 h-4" />
            العودة للمكان السابق
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              إعادة التحليل
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void handleCopyAll()}
              disabled={!data}
            >
              <Copy className="h-4 w-4" />
              نسخ كل النتائج
            </Button>
          </div>
        </div>
      </header>

      <main className="container pt-8 pb-20 space-y-6 animate-in fade-in duration-500">
        <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-card p-6 md:p-8">
          <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#0f4c5c_1px,transparent_1px)] [background-size:14px_14px]" />
          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground border border-secondary/20 text-xs font-bold">
              <BrainCircuit className="w-3.5 h-3.5" />
              صفحة التحليل التشغيلي
            </div>
            <h1 className="text-3xl md:text-5xl font-quran text-primary">
              تحليل الآية
            </h1>
            {payload && (
              <p className="text-sm md:text-base text-muted-foreground">
                سورة {payload.surahNo} • آية {payload.ayahNo}
              </p>
            )}
          </div>
        </section>

        {payload && (
          <Card className="border-primary/15 bg-card/70">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-primary flex items-center gap-2 text-xl font-quran">
                <BookOpen className="w-5 h-5 text-secondary" />
                نص الآية
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="font-quran text-2xl md:text-3xl leading-[2.5] text-foreground" dir="rtl">
                {payload.ayahText}
              </p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="border-border">
            <CardContent className="pt-6 space-y-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                جاري تحليل البيانات...
              </div>
              <div className="h-3 rounded bg-muted animate-pulse" />
              <div className="h-3 rounded bg-muted animate-pulse w-11/12" />
              <div className="h-3 rounded bg-muted animate-pulse w-9/12" />
            </CardContent>
          </Card>
        )}

        {!loading && error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2 text-lg">
                <CircleAlert className="h-5 w-5" />
                فشل التحليل
              </CardTitle>
              <CardDescription className="text-destructive/90">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => void load()}>
                <RefreshCw className="h-4 w-4" />
                إعادة المحاولة
              </Button>
              <Button variant="ghost" className="gap-2" onClick={handleBack}>
                <ArrowRight className="h-4 w-4" />
                العودة
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && data && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <Card className="xl:col-span-2 border-secondary/25 bg-secondary/5">
              <CardHeader className="pb-3 border-b border-secondary/20">
                <CardTitle className="text-secondary text-xl font-quran">
                  الجذور ذات التعريفات التشغيلية
                </CardTitle>
                <CardDescription>
                  {data.operationalRoots.length} جذور
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 max-h-[68vh] overflow-y-auto">
                {data.operationalRoots.length === 0 ? (
                  <p className="text-sm text-muted-foreground leading-7">
                    {data.message || 'لا توجد تعريفات تشغيلية متاحة لهذه الآية.'}
                  </p>
                ) : (
                  data.operationalRoots.map((item) => (
                    <div key={item.root} className="rounded-xl border border-border/70 bg-background/80 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-bold text-primary">{item.root}</div>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          onClick={async () => {
                            const copied = await copyText(`${item.root}\n${item.operationalFunction}`);
                            if (copied) toast.success(`تم نسخ تعريف الجذر: ${item.root}`);
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          نسخ
                        </button>
                      </div>
                      <p className="text-sm leading-7 whitespace-pre-line text-foreground/90">
                        {item.operationalFunction}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-3 border-primary/20">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-primary text-xl font-quran flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  الاستنتاج التشغيلي
                </CardTitle>
                {data.analysis && (
                  <CardDescription>
                    {data.analysis.provider} • {data.analysis.model}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {data.analysis?.content ? (
                  <div
                    dir="rtl"
                    className="ai-markdown rounded-xl border border-border/60 bg-background/70 p-4 text-sm md:text-base text-foreground"
                  >
                    <Streamdown controls={false} parseIncompleteMarkdown={false}>
                      {data.analysis.content}
                    </Streamdown>
                  </div>
                ) : (
                  <p className="text-sm md:text-base leading-8 whitespace-pre-line text-foreground">
                    {data.message || 'لا يوجد تحليل متاح.'}
                  </p>
                )}

                {data.analysis?.generatedAt && (
                  <div className="pt-2 text-[11px] text-muted-foreground">
                    تم إنشاء النتيجة في: {new Date(data.analysis.generatedAt).toLocaleString('ar-EG')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <ScrollToTop />
    </PageContainer>
  );
};

export default AyahOperationalInsight;
