import React, { useState, useEffect, useRef } from 'react';
import { SearchResult, searchInMushaf, highlightText } from '@/lib/searchService';
import surahNames from '@/data/surahNames';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigateToPage: (pageNo: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
    onNavigateToPage
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [displayedResults, setDisplayedResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);

    // البحث
    const handleSearch = async () => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        setIsSearching(true);
        setResults([]);
        setDisplayedResults([]);

        try {
            const searchResults = await searchInMushaf(trimmedQuery);
            setResults(searchResults);
            setDisplayedResults(searchResults.slice(0, 20)); // أول 20 نتيجة
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Lazy Loading عند التمرير
    const handleScroll = () => {
        if (!resultsRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = resultsRef.current;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

        if (isNearBottom && displayedResults.length < results.length) {
            loadMore();
        }
    };

    const loadMore = () => {
        const currentLength = displayedResults.length;
        const moreResults = results.slice(currentLength, currentLength + 20);
        setDisplayedResults([...displayedResults, ...moreResults]);
    };

    // إعادة تعيين عند الإغلاق
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
            setDisplayedResults([]);
        }
    }, [isOpen]);

    // منع scroll للخلفية عند فتح Modal
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="search-modal" onClick={onClose}>
            <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="search-header">
                    <h2>البحث في المصحف</h2>
                    <button onClick={onClose} className="search-close-btn" aria-label="إغلاق">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Search Input */}
                <div className="search-input-container">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="ابحث عن آية أو كلمة..."
                        className="search-input"
                        autoFocus
                    />
                    <button onClick={handleSearch} className="search-btn" disabled={isSearching}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>
                </div>

                {/* Results */}
                {(isSearching || results.length > 0 || (query && results.length === 0)) && (
                    <div
                        className="search-results"
                        ref={resultsRef}
                        onScroll={handleScroll}
                    >
                        {isSearching && (
                            <div className="search-loading">
                                <div className="search-spinner"></div>
                                <p>جاري البحث في المصحف...</p>
                            </div>
                        )}

                        {!isSearching && results.length === 0 && query && (
                            <div className="search-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                                <p>لم يتم العثور على نتائج</p>
                            </div>
                        )}

                        {!isSearching && displayedResults.length > 0 && (
                            <>
                                <div className="search-results-count">
                                    {results.length} نتيجة
                                </div>

                                {displayedResults.map((result, index) => (
                                    <div
                                        key={`${result.surahNo}-${result.ayahNo}-${index}`}
                                        className="search-result-item"
                                        onClick={() => {
                                            onNavigateToPage(result.pageNo);
                                            onClose();
                                        }}
                                    >
                                        <div className="result-meta">
                                            <span className="surah-name">{surahNames[result.surahNo]}</span>
                                            <span className="ayah-num">آية {result.ayahNo}</span>
                                        </div>
                                        <div
                                            className="result-text font-quran"
                                            dangerouslySetInnerHTML={{
                                                __html: highlightText(result.text, query)
                                            }}
                                        />
                                    </div>
                                ))}

                                {displayedResults.length < results.length && (
                                    <div className="search-load-more">
                                        <p>عرض {displayedResults.length} من {results.length}</p>
                                        <small>قم بالتمرير لأسفل لعرض المزيد</small>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
