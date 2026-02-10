import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Settings() {
    const { theme, setTheme, presets, colorPreset, setColorPreset, applyPresetPreview, setCustomPreset, customColors } = useTheme() as any;
    type PresetType = { name: string; light: Record<string, string>; dark: Record<string, string> };
    const presetsMap = presets as Record<string, PresetType>;
    const [previewing, setPreviewing] = useState<string | null>(null);
    const [custom, setCustom] = useState<{ primary: string; secondary: string; accent: string }>(() => {
        // initialize from saved customColors or current preset
        if (customColors) {
            return {
                primary: customColors.light['--primary'] || '#0f4c5c',
                secondary: customColors.light['--secondary'] || '#fb8b24',
                accent: customColors.light['--accent'] || '#e2e8f0',
            };
        }
        const current = presetsMap[colorPreset] || Object.values(presetsMap)[0];
        return {
            primary: current.light['--primary'],
            secondary: current.light['--secondary'],
            accent: current.light['--accent'],
        } as any;
    });

    // track whether we are previewing custom (unsaved) selection
    const [isCustomPreview, setIsCustomPreview] = useState(false);

    const handlePreview = (id: string) => {
        setPreviewing(id);
        applyPresetPreview(id);
    };

    const handleRevert = () => {
        setPreviewing(null);
        // reapply saved preset
        applyPresetPreview(colorPreset);
    };

    const handleApply = (id: string) => {
        setPreviewing(null);
        setColorPreset(id);
    };

    const applyTempCustom = (values: { primary: string; secondary: string; accent: string }) => {
        const root = window.document.documentElement;
        root.style.setProperty('--primary', values.primary);
        root.style.setProperty('--secondary', values.secondary);
        root.style.setProperty('--accent', values.accent);
        root.style.setProperty('--ring', values.primary);
    };

    const handleCustomPreview = () => {
        applyTempCustom(custom);
        setIsCustomPreview(true);
        setPreviewing('custom');
    };

    const handleCustomRevert = () => {
        setIsCustomPreview(false);
        setPreviewing(null);
        // reapply saved preset
        applyPresetPreview(colorPreset);
    };

    const handleCustomSave = () => {
        setCustomPreset(custom);
        setIsCustomPreview(false);
    };

    return (
        <div className="container py-8">
            <h1 className="text-2xl font-bold mb-6">إعدادات المظهر</h1>

            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-3">الوضع (Theme)</h2>
                <div className="flex gap-3 items-center">
                    <Button variant={theme === 'light' ? 'secondary' : 'ghost'} onClick={() => setTheme('light')}>Light</Button>
                    <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} onClick={() => setTheme('dark')}>Dark</Button>
                    <Button variant={theme === 'ghost' ? 'ghost' : 'ghost'} onClick={() => setTheme('system')}>System</Button>
                </div>
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-3">مجموعة الألوان (Color Presets)</h2>
                <p className="text-sm text-muted-foreground mb-4">اختر مجموعة لمعاينتها مؤقتًا أو تطبيقها بشكل دائم.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(presetsMap).map(([id, p]) => (
                        <Card key={id} className={`p-4 flex flex-col gap-3 ${id === colorPreset ? 'ring-2 ring-offset-2 ring-primary' : ''}`}>
                            <div className="flex-1">
                                <div className="h-16 rounded-md overflow-hidden mb-2 grid grid-cols-3">
                                    <div style={{ background: p.light['--primary'] }} />
                                    <div style={{ background: p.light['--secondary'] }} />
                                    <div style={{ background: p.light['--accent'] }} />
                                </div>
                                <h3 className="font-bold">{p.name}</h3>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handlePreview(id)}>{previewing === id ? 'معاينة' : 'معاينة'}</Button>
                                    <Button variant="outline" size="sm" onClick={() => handleApply(id)}>{id === colorPreset ? 'مطبق' : 'تطبيق'}</Button>
                                </div>
                                {previewing === id && (
                                    <Button variant="ghost" size="sm" onClick={handleRevert}>تراجع</Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-lg font-semibold mb-3">ألوان مخصصة</h2>
                <p className="text-sm text-muted-foreground mb-4">اختر ثلاثة ألوان متناسقة (أساسي، ثانوي، تمييز) ثم معاينتها أو حفظها كمجموعة مخصصة.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <Card className="p-4">
                        <div className="flex flex-col gap-3">
                            <label htmlFor="custom-primary" className="text-sm font-medium">اللون الأساسي</label>
                            <input id="custom-primary" type="color" title="اللون الأساسي" aria-label="اللون الأساسي" value={custom.primary} onChange={(e) => setCustom(prev => ({ ...prev, primary: e.target.value }))} className="w-20 h-12 p-0 border rounded-md" />

                            <label htmlFor="custom-secondary" className="text-sm font-medium">اللون الثانوي</label>
                            <input id="custom-secondary" type="color" title="اللون الثانوي" aria-label="اللون الثانوي" value={custom.secondary} onChange={(e) => setCustom(prev => ({ ...prev, secondary: e.target.value }))} className="w-20 h-12 p-0 border rounded-md" />

                            <label htmlFor="custom-accent" className="text-sm font-medium">لون التمييز</label>
                            <input id="custom-accent" type="color" title="لون التمييز" aria-label="لون التمييز" value={custom.accent} onChange={(e) => setCustom(prev => ({ ...prev, accent: e.target.value }))} className="w-20 h-12 p-0 border rounded-md" />

                            <div className="flex gap-2 mt-3">
                                <Button size="sm" onClick={handleCustomPreview}>معاينة</Button>
                                <Button variant="outline" size="sm" onClick={handleCustomSave}>حفظ وتطبيق</Button>
                                {isCustomPreview && <Button variant="ghost" size="sm" onClick={handleCustomRevert}>تراجع</Button>}
                            </div>
                        </div>
                    </Card>

                    <div>
                        <div className="mb-2 text-sm font-medium">معاينة الألوان (لوحة تشبه فوتوشوب)</div>
                        <div className="w-full h-56 rounded-lg overflow-hidden border border-border relative">
                            {/* Simulated color-square: horizontal gradient then vertical black/white overlay */}
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(90deg, ${custom.primary}, ${custom.secondary})`,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }} />

                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.25) 100%)',
                                mixBlendMode: 'multiply'
                            }} />

                            <div style={{
                                position: 'absolute',
                                right: 12,
                                bottom: 12,
                                width: 96,
                                height: 96,
                                borderRadius: 8,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                background: `radial-gradient(circle at 30% 30%, ${custom.accent}, transparent 40%), linear-gradient(90deg, ${custom.primary}, ${custom.secondary})`
                            }} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
