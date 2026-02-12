import React, { useEffect, useState, useRef } from 'react';
import { fetchByPage } from '@/lib/mushafService';
import { PageContainer } from '@/components/ui/PageContainer';
import surahNames from '@/data/surahNames';
import { SurahHeader } from '@/components/mushaf/SurahHeader';
import { Basmala } from '@/components/mushaf/Basmala';
import { SearchModal } from '@/components/mushaf/SearchModal';

type Ayah = {
  surahNo: number;
  ayahNo: number;
  text: string;
};

// معلومات السور (الصفحة التي تبدأ فيها كل سورة)
const surahStartPages: { [key: number]: number } = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187,
  10: 208, 11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282,
  18: 293, 19: 305, 20: 312, 21: 322, 22: 332, 23: 342, 24: 350, 25: 359,
  26: 367, 27: 377, 28: 385, 29: 396, 30: 404, 31: 411, 32: 415, 33: 418,
  34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467, 41: 477,
  42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515,
  50: 518, 51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537,
  58: 542, 59: 545, 60: 549, 61: 551, 62: 553, 63: 554, 64: 556, 65: 558,
  66: 560, 67: 562, 68: 564, 69: 566, 70: 568, 71: 570, 72: 572, 73: 574,
  74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585, 81: 586,
  82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593,
  90: 594, 91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598,
  98: 598, 99: 599, 100: 599, 101: 600, 102: 600, 103: 601, 104: 601,
  105: 601, 106: 602, 107: 602, 108: 602, 109: 603, 110: 603, 111: 603,
  112: 604, 113: 604, 114: 604
};

export default function Mushaf() {
  const [pageNo, setPageNo] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jumpToPage, setJumpToPage] = useState<string>('');
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [surahSearch, setSurahSearch] = useState<string>('');
  const [showSurahDropdown, setShowSurahDropdown] = useState(false);

  // FAB and Search
  const [showToolbar, setShowToolbar] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // تحميل الصفحة
  useEffect(() => {
    let mounted = true;
    const loadPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchByPage(pageNo);
        if (!mounted) return;

        const ayahsData = data.data || data || [];
        const list = ayahsData.map((a: any) => ({
          surahNo: a.surah_no || a.surahNo,
          ayahNo: a.ayah_no || a.ayahNo,
          text: a.text_uthmani || a.text_plain || a.text
        }));
        setAyahs(list.length ? list : null);
      } catch (err: any) {
        console.error('❌ Error loading page:', err);
        setError('فشل في تحميل الصفحة');
        setAyahs(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadPage();
    return () => { mounted = false; };
  }, [pageNo]);

  // اختصارات لوحة المفاتيح المحسّنة
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          if (e.key === 'ArrowLeft') {
            setPageNo(p => Math.max(1, p - 1));
          } else {
            setPageNo(p => Math.min(604, p + 1));
          }
          break;
        case 'Home':
          e.preventDefault();
          setPageNo(1);
          break;
        case 'End':
          e.preventDefault();
          setPageNo(604);
          break;
        case 'PageUp':
          e.preventDefault();
          setPageNo(p => Math.max(1, p - 10));
          break;
        case 'PageDown':
          e.preventDefault();
          setPageNo(p => Math.min(604, p + 10));
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // دعم السحب (Swipe) للموبايل
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50; // الحد الأدنى للمسافة للتعرف على السحب

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // سحب لليسار = الصفحة التالية
          setPageNo(p => Math.min(604, p + 1));
        } else {
          // سحب لليمين = الصفحة السابقة
          setPageNo(p => Math.max(1, p - 1));
        }
      }
    };

    card.addEventListener('touchstart', handleTouchStart);
    card.addEventListener('touchmove', handleTouchMove);
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // إغلاق قائمة السور عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.surah-selector-custom')) {
        setShowSurahDropdown(false);
      }
    };

    if (showSurahDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSurahDropdown]);

  const goToPrevPage = () => setPageNo(p => Math.max(1, p - 1));
  const goToNextPage = () => setPageNo(p => Math.min(604, p + 1));

  const handleJumpToPage = () => {
    const num = parseInt(jumpToPage);
    if (num >= 1 && num <= 604) {
      setPageNo(num);
      setJumpToPage('');
    }
  };

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surahNum = parseInt(e.target.value);
    if (surahNum && surahStartPages[surahNum]) {
      setPageNo(surahStartPages[surahNum]);
      setSelectedSurah(e.target.value);
    }
  };

  const handleRetry = () => {
    setError(null);
    setPageNo(p => p); // تحديث الصفحة لإعادة المحاولة
  };

  // تصفية السور حسب البحث
  const filteredSurahs = Object.entries(surahNames).filter(([num, name]) =>
    name.includes(surahSearch) || num.includes(surahSearch)
  );

  const handleSurahSelect = (surahNum: number) => {
    if (surahStartPages[surahNum]) {
      setPageNo(surahStartPages[surahNum]);
      setSelectedSurah(surahNum.toString());
      setShowSurahDropdown(false);
      setSurahSearch('');
    }
  };

  const progress = ((pageNo / 604) * 100).toFixed(1);

  return (
    <PageContainer>
      <div className="mushaf-premium-container">
        {/* شريط الأدوات العلوي */}
        <div className="mushaf-toolbar">
          <div className="mushaf-toolbar-section">
            <label htmlFor="surah-search" className="mushaf-toolbar-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              السورة
            </label>
            <div className="surah-selector-custom">
              <input
                id="surah-search"
                type="text"
                placeholder="ابحث عن سورة..."
                value={surahSearch}
                onChange={(e) => setSurahSearch(e.target.value)}
                onFocus={() => setShowSurahDropdown(true)}
                className="surah-search-input"
              />
              {showSurahDropdown && (
                <div className="surah-dropdown-list">
                  {filteredSurahs.length > 0 ? (
                    filteredSurahs.map(([num, name]) => (
                      <div
                        key={num}
                        onClick={() => handleSurahSelect(parseInt(num))}
                        className="surah-option"
                      >
                        {num}. {name}
                      </div>
                    ))
                  ) : (
                    <div className="surah-option-empty">لا توجد نتائج</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mushaf-toolbar-section">
            <label htmlFor="page-jump" className="mushaf-toolbar-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
              انتقال سريع
            </label>
            <div className="mushaf-jump-group">
              <input
                id="page-jump"
                type="number"
                min="1"
                max="604"
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
                placeholder="1-604"
                className="mushaf-page-input"
              />
              <button onClick={handleJumpToPage} className="mushaf-jump-button">
                اذهب
              </button>
            </div>
          </div>

          <div className="mushaf-toolbar-section mushaf-progress-section">
            <div className="mushaf-progress-info">
              <span className="mushaf-progress-text">
                صفحة {pageNo} من 604
              </span>
              <span className="mushaf-progress-percent">{progress}%</span>
            </div>
            <div className="mushaf-progress-bar-container">
              <div
                className="mushaf-progress-bar-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* العنوان */}
        <div className="mushaf-page-header">
          <h1 className="mushaf-page-title">
            {ayahs && ayahs.length > 0 && (
              <>{surahNames[ayahs[0].surahNo] || ''}</>
            )}
          </h1>
        </div>

        {/* الكارد الرئيسي */}
        <div className="mushaf-book-wrapper">
          {/* الكارد */}
          <div ref={cardRef} className="mushaf-premium-card">
            {/* رقم الصفحة في الأعلى */}
            <div className="mushaf-page-number-top">
              <div className="mushaf-page-ornament"></div>
              <span>{pageNo}</span>
              <div className="mushaf-page-ornament"></div>
            </div>

            {/* محتوى الصفحة */}
            <div className="mushaf-page-content">
              {loading && (
                <div className="mushaf-loading">
                  <div className="mushaf-spinner"></div>
                  <p>جاري التحميل...</p>
                </div>
              )}

              {error && (
                <div className="mushaf-error-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p className="mushaf-error-message">{error}</p>
                  <button onClick={handleRetry} className="mushaf-retry-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    إعادة المحاولة
                  </button>
                </div>
              )}

              {!loading && !error && ayahs && ayahs.length > 0 && (
                <div className="mushaf-ayahs-premium">
                  {ayahs.map((ayah, index) => {
                    // كشف بداية سورة جديدة
                    const isNewSurah = index === 0 || ayahs[index - 1].surahNo !== ayah.surahNo;
                    const isFirstAyahOfSurah = ayah.ayahNo === 1;
                    const isSurahAtTawbah = ayah.surahNo === 9;

                    return (
                      <React.Fragment key={`${ayah.surahNo}-${ayah.ayahNo}`}>
                        {/* عنوان السورة عند البداية */}
                        {isNewSurah && (
                          <>
                            <SurahHeader surahNo={ayah.surahNo} />
                            {/* البسملة - إلا للتوبة */}
                            {isFirstAyahOfSurah && !isSurahAtTawbah && <Basmala />}
                          </>
                        )}

                        {/* نص الآية */}
                        <span className="mushaf-ayah-text-premium font-quran">
                          {ayah.text}
                        </span>

                        {/* رقم الآية */}
                        <span className="mushaf-ayah-marker">
                          <svg className="mushaf-ayah-marker-ornament" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                            <circle cx="24" cy="24" r="18" fill="currentColor" opacity="0.05" />
                            <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                          </svg>
                          <span className="mushaf-ayah-marker-number">{ayah.ayahNo}</span>
                        </span>
                        {index < ayahs.length - 1 && ' '}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {!loading && !error && (!ayahs || ayahs.length === 0) && (
                <div className="mushaf-empty">لا توجد بيانات لهذه الصفحة</div>
              )}
            </div>

            {/* رقم الصفحة في الأسفل */}
            <div className="mushaf-page-number-bottom">
              <div className="mushaf-page-divider"></div>
              صفحة {pageNo} من 604
            </div>
          </div>
        </div>

        {/* تعليمات التنقل */}
        <div className="mushaf-navigation-hints">
          <div className="mushaf-hint">
            <kbd>←</kbd> <kbd>→</kbd>
            <span>للتنقل</span>
          </div>
          <div className="mushaf-hint">
            <kbd>Home</kbd> <kbd>End</kbd>
            <span>البداية/النهاية</span>
          </div>
          <div className="mushaf-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span>اسحب للتنقل</span>
          </div>
        </div>

        {/* أزرار التنقل الثابتة (Floating Navigation) */}
        {/* زر اليمين = السابق */}
        <button
          onClick={goToPrevPage}
          disabled={pageNo <= 1}
          className="mushaf-floating-nav mushaf-floating-prev"
          aria-label="الصفحة السابقة"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* زر اليسار = التالي */}
        <button
          onClick={goToNextPage}
          disabled={pageNo >= 604}
          className="mushaf-floating-nav mushaf-floating-next"
          aria-label="الصفحة التالية"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowToolbar(!showToolbar)}
          className="mushaf-fab"
          aria-label="الأدوات"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        {/* Expandable Toolbar */}
        {showToolbar && (
          <div className="mushaf-fab-toolbar">
            <button onClick={() => {
              setShowSearchModal(true);
              setShowToolbar(false);
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <span>بحث</span>
            </button>

            <button disabled title="قريباً">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>علامات</span>
            </button>

            <button disabled title="قريباً">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span>تفسير</span>
            </button>
          </div>
        )}

        {/* Search Modal */}
        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onNavigateToPage={(page) => setPageNo(page)}
        />
      </div>
    </PageContainer>
  );
}
