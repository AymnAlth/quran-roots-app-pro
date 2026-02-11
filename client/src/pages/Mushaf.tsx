import React, { useEffect, useState, useRef } from 'react';
import { fetchSurah, fetchByPage } from '@/lib/mushafService';
import { PageContainer } from '@/components/ui/PageContainer';
import surahNames from '@/data/surahNames';

type Ayah = { surahNo: number; ayahNo: number; text: string; global_ayah?: number };

export default function Mushaf() {
  const [viewMode, setViewMode] = useState<'surah' | 'page'>('surah');
  const [surahNo, setSurahNo] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNo, setPageNo] = useState<number>(1);
  const [pageAyahs, setPageAyahs] = useState<Ayah[] | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [pageDisplayMode, setPageDisplayMode] = useState<'spread' | 'single'>('spread');
  const [showTextOverlay, setShowTextOverlay] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
        try {
          const data = await fetchSurah(surahNo);
          if (!mounted) return;
          const list = (data.ayahs || []).map((a: any) => ({ surahNo: a.surah_no, ayahNo: a.ayah_no, text: a.text_uthmani || a.text || a.text_plain }));
          setAyahs(list.length ? list : null);
      } catch (err: any) {
        setError('فشل في تحميل السورة');
        setAyahs(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [surahNo]);

  useEffect(() => {
    if (viewMode !== 'page') return;
    let mounted = true;
    const loadPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchByPage(pageNo);
        if (!mounted) return;
        const list = (rows || []).map((a: any) => ({ surahNo: a.surah_no, ayahNo: a.ayah_no, text: a.text_uthmani || a.text_plain }));
        setPageAyahs(list.length ? list : null);
      } catch (err: any) {
        setError('فشل في تحميل الصفحة');
        setPageAyahs(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadPage();
    return () => { mounted = false; };
  }, [viewMode, pageNo]);

  // keyboard navigation for pages
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (viewMode !== 'page') return;
      if (e.key === 'ArrowLeft') {
        if (pageDisplayMode === 'spread') setPageNo(p => Math.max(1, p - 2));
        else setPageNo(p => Math.max(1, p - 1));
      } else if (e.key === 'ArrowRight') {
        if (pageDisplayMode === 'spread') setPageNo(p => Math.min(604, p + 2));
        else setPageNo(p => Math.min(604, p + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewMode, pageDisplayMode]);

  return (
    <PageContainer>
      <div className="py-6">
        <div className="mb-4 flex items-center gap-3">
          <label className="font-medium">طريقة العرض</label>
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="surah">عرض سورة</option>
            <option value="page">عرض صفحة (صفحة-بصفحة)</option>
          </select>
        </div>

        {viewMode === 'surah' && (
          <div className="mb-4 flex items-center gap-3">
            <label className="font-medium">سورة رقم</label>
            <input
              type="number"
              min={1}
              max={114}
              value={surahNo}
              onChange={(e) => setSurahNo(Number(e.target.value || 1))}
              className="border rounded px-2 py-1"
              aria-label="رقم السورة"
            />
          </div>
        )}

        {viewMode === 'page' && (
          <div className="mb-4 flex items-center gap-3">
            <label className="font-medium">صفحة</label>
            <input type="number" min={1} max={604} value={pageNo} onChange={(e) => setPageNo(Number(e.target.value || 1))} className="border rounded px-2 py-1" />
            <label className="font-medium">عرض</label>
            <select value={pageDisplayMode} onChange={(e) => setPageDisplayMode(e.target.value as any)} className="border rounded px-2 py-1">
              <option value="spread">صفحتان</option>
              <option value="single">صفحة واحدة</option>
            </select>
            <label className="font-medium">صورة باسم</label>
            <input placeholder="مثال: page_001" value={imageName} onChange={(e) => setImageName(e.target.value)} className="border rounded px-2 py-1" />
            <button className="border px-3 py-1 rounded" onClick={() => {
              if (imgRef.current) imgRef.current.src = imageName ? `/pages/${imageName}.jpg` : `/pages/${pageNo}.jpg`;
            }}>تحميل صورة</button>
            <label style={{ marginLeft: 8 }}>
              <input type="checkbox" checked={showTextOverlay} onChange={(e) => setShowTextOverlay(e.target.checked)} /> عرض النص فوق الصورة
            </label>
          </div>
        )}

        <div className="mushaf-viewport">
          {viewMode === 'surah' && (
            <article className="mushaf-page" role="document" aria-label="مصحف">
              <header className="mushaf-header">
                <h1 className="quran-heading">سورة {surahNo} — {surahNames[surahNo] || ''}</h1>
              </header>

              <main className="mushaf-body font-quran" aria-live="polite">
                {loading && <div className="text-muted-foreground">تحميل...</div>}
                {error && <div className="text-destructive">{error}</div>}
                {!loading && ayahs && (
                  <div className="mushaf-lines">
                    {ayahs.map(a => (
                      <div key={`${a.surahNo}-${a.ayahNo}`} className="ayah-line">
                        <span className="ayah-text">{a.text}</span>
                        <span className="ayah-number" aria-hidden>{a.ayahNo}</span>
                      </div>
                    ))}
                  </div>
                )}
              </main>

              <footer className="mushaf-footer">
                <div className="mushaf-footer-text">سورة — عرض قراءة</div>
              </footer>
            </article>
          )}

          {viewMode === 'page' && (
            <div className="mushaf-page" role="document" aria-label={`صفحة ${pageNo}`}>
              <div className="mushaf-header" style={{ textAlign: 'center' }}>
                <div className="quran-heading">الصفحة {pageNo} {pageAyahs && pageAyahs.length > 0 ? `— تبدأ بـ ${surahNames[pageAyahs[0].surahNo] || ''}` : ''}</div>
              </div>

              {pageDisplayMode === 'single' && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                  <button aria-label="الصفحة السابقة" onClick={() => setPageNo(p => Math.max(1, p - 1))} className="mushaf-arrow left">‹</button>
                  <div style={{ width: '880px', textAlign: 'center' }}>
                    <img ref={imgRef} src={imageName ? `/pages/${imageName}.jpg` : `/pages/${pageNo}.jpg`} alt={`صفحة ${pageNo}`} className="mushaf-image" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />

                    {!loading && pageAyahs && (
                      <div style={{ marginTop: 12, textAlign: 'right' }} className="font-quran">
                        {pageAyahs.map(a => (
                          <div key={`${a.surahNo}-${a.ayahNo}`} className="ayah-line">
                            <span className="ayah-text">{a.text}</span>
                            <span className="ayah-number" aria-hidden>{a.ayahNo}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button aria-label="الصفحة التالية" onClick={() => setPageNo(p => Math.min(604, p + 1))} className="mushaf-arrow right">›</button>
                </div>
              )}

              {pageDisplayMode === 'spread' && (
                <div className="mushaf-backdrop" role="presentation">
                  <button aria-label="صفحات سابقة" onClick={() => setPageNo(p => Math.max(1, p - 2))} className="mushaf-arrow left">‹</button>
                  <div className="mushaf-spread">
                    {/* determine left/right page numbers (left should be odd when possible) */}
                    {(() => {
                      const left = pageNo % 2 === 1 ? pageNo : Math.max(1, pageNo - 1);
                      const right = Math.min(604, left + 1);
                      return (
                        <>
                          <figure className="mushaf-frame">
                            <img className={`mushaf-image ${showTextOverlay ? 'mushaf-dimmed' : ''}`} src={imageName ? `/pages/${imageName}.jpg` : `/pages/${left}.jpg`} alt={`صفحة ${left}`} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            {showTextOverlay && pageAyahs && (
                              <div className="mushaf-overlay" aria-hidden>
                                {pageAyahs.filter(pa => pa.page === left || true).slice(0,1000).map((a,i) => (
                                  <div key={`o-${left}-${i}`} className="ayah-line">{a.text} <span className="ayah-number">{a.ayahNo}</span></div>
                                ))}
                              </div>
                            )}
                            <figcaption className="mushaf-caption">{left} / 604</figcaption>
                          </figure>

                          <figure className="mushaf-frame">
                            <img className={`mushaf-image ${showTextOverlay ? 'mushaf-dimmed' : ''}`} src={`/pages/${right}.jpg`} alt={`صفحة ${right}`} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            {showTextOverlay && pageAyahs && (
                              <div className="mushaf-overlay" aria-hidden>
                                {pageAyahs.filter(pa => pa.page === right || true).slice(0,1000).map((a,i) => (
                                  <div key={`o-${right}-${i}`} className="ayah-line">{a.text} <span className="ayah-number">{a.ayahNo}</span></div>
                                ))}
                              </div>
                            )}
                            <figcaption className="mushaf-caption">{right} / 604</figcaption>
                          </figure>
                        </>
                      );
                    })()}
                  </div>
                  <button aria-label="صفحات تالية" onClick={() => setPageNo(p => Math.min(604, p + 2))} className="mushaf-arrow right">›</button>
                </div>
              )}

              <footer className="mushaf-footer">
                <div className="mushaf-footer-text">عرض صفحة — عرض هادئ ومحترم للنص</div>
              </footer>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
