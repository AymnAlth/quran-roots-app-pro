import React from 'react';

interface AyahCardProps {
    ayahNumber: number;
    text: string;
    surahNumber: number;
    variant?: 'default' | 'highlighted';
    showDecorations?: boolean;
}

export const AyahCard: React.FC<AyahCardProps> = ({
    ayahNumber,
    text,
    surahNumber,
    variant = 'default',
    showDecorations = true,
}) => {
    console.log('AyahCard rendering:', { ayahNumber, text: text.substring(0, 20), surahNumber });

    return (
        <div className="ayah-card-wrapper">
            <div className={`ayah-card ${variant === 'highlighted' ? 'ayah-card-highlighted' : ''}`}>
                {/* Decorative top border */}
                {showDecorations && (
                    <div className="ayah-decoration-top">
                        <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                            <path
                                d="M0,4 Q25,0 50,4 T100,4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                opacity="0.3"
                            />
                        </svg>
                    </div>
                )}

                {/* Main content */}
                <div className="ayah-content">
                    {/* Ayah text */}
                    <p className="ayah-text-content font-quran">{text}</p>

                    {/* Ayah number badge */}
                    <div className="ayah-number-badge">
                        <svg className="ayah-number-ornament" viewBox="0 0 60 60">
                            {/* Outer circle */}
                            <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />

                            {/* Inner decorative pattern */}
                            <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />

                            {/* Small decorative dots */}
                            <circle cx="30" cy="6" r="1.5" fill="currentColor" opacity="0.4" />
                            <circle cx="30" cy="54" r="1.5" fill="currentColor" opacity="0.4" />
                            <circle cx="6" cy="30" r="1.5" fill="currentColor" opacity="0.4" />
                            <circle cx="54" cy="30" r="1.5" fill="currentColor" opacity="0.4" />
                        </svg>
                        <span className="ayah-number-text">{ayahNumber}</span>
                    </div>
                </div>

                {/* Decorative bottom border */}
                {showDecorations && (
                    <div className="ayah-decoration-bottom">
                        <svg width="80" height="12" viewBox="0 0 80 12" style={{ margin: '0 auto', display: 'block' }}>
                            <path
                                d="M5,6 Q20,2 40,6 T75,6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.8"
                                opacity="0.25"
                            />
                            <circle cx="40" cy="6" r="2" fill="currentColor" opacity="0.2" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AyahCard;
