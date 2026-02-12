import React from 'react';
import surahNames from '@/data/surahNames';

interface SurahHeaderProps {
    surahNo: number;
}

export const SurahHeader: React.FC<SurahHeaderProps> = ({ surahNo }) => {
    return (
        <div className="surah-separator">
            <div className="surah-ornament-line"></div>
            <div className="surah-header-content">
                <svg className="surah-ornament-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                    <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.7" />
                </svg>
                <h2 className="surah-name">سورة {surahNames[surahNo]}</h2>
                <svg className="surah-ornament-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                    <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.7" />
                </svg>
            </div>
            <div className="surah-ornament-line"></div>
        </div>
    );
};
