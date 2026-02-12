import { fetchByPage } from './mushafService';

export interface SearchResult {
    surahNo: number;
    ayahNo: number;
    text: string;
    pageNo: number;
}

/**
 * إزالة التشكيل من النص العربي فقط (دون تغيير شكل الأحرف)
 */
function removeTashkeel(text: string): string {
    // إزالة جميع الحركات والتشكيل العربية فقط
    // \u064B-\u065F: الحركات (فتحة، ضمة، كسرة، تنوين، سكون، شدة، إلخ)
    // \u0670: الألف الخنجرية
    // \u06D6-\u06DC: علامات الوقف والتلاوة
    // \u06DF-\u06E8: علامات قرآنية إضافية
    // \u06EA-\u06ED: علامات تجويدية
    return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');
}

/**
 * تطبيع النص للبحث: إزالة التشكيل + توحيد الهمزات فقط
 */
function normalizeForSearch(text: string): string {
    return removeTashkeel(text)
        // توحيد جميع أشكال الهمزة (ٱ أ إ آ ؤ ئ ء) إلى ا
        .replace(/[ٱأإآؤئء]/g, 'ا');
}

/**
 * البحث في جميع صفحات المصحف
 * ملاحظة: هذا قد يستغرق وقتاً لأنه يبحث في 604 صفحة
 */
export async function searchInMushaf(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const normalizedQuery = normalizeForSearch(query.trim());

    if (!normalizedQuery) return results;

    console.log('🔍 بدء البحث عن:', normalizedQuery);

    // البحث في جميع الصفحات (1-604)
    for (let page = 1; page <= 604; page++) {
        try {
            const data = await fetchByPage(page);
            const ayahs = data.data || data || [];

            ayahs.forEach((ayah: any) => {
                const textUthmani = ayah.text_uthmani || ayah.text || '';

                // تطبيع النص للبحث (إزالة التشكيل + توحيد الهمزات)
                const normalizedText = normalizeForSearch(textUthmani);


                // Debug: طباعة أول آية للتحقق
                if (page === 1 && ayah.ayah_no === 1) {
                    console.log('📖 مثال:', {
                        original: textUthmani.substring(0, 30),
                        normalized: normalizedText.substring(0, 30),
                        query: normalizedQuery
                    });
                }

                // البحث في النص المطبّع
                if (normalizedText.includes(normalizedQuery)) {
                    results.push({
                        surahNo: ayah.surah_no || ayah.surahNo,
                        ayahNo: ayah.ayah_no || ayah.ayahNo,
                        text: textUthmani, // نعرض النص بالتشكيل
                        pageNo: page
                    });
                }
            });
        } catch (error) {
            console.error(`❌ خطأ في البحث بالصفحة ${page}:`, error);
        }
    }

    console.log(`✅ اكتمل البحث. النتائج: ${results.length}`);
    return results;
}

/**
 * إبراز كلمة البحث في النص
 */
export function highlightText(text: string, query: string): string {
    if (!query.trim()) return text;

    // تطبيع كلمة البحث
    const normalizedQuery = normalizeForSearch(query.trim()).toLowerCase();
    const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // البحث عن الكلمة بدون تشكيل وإبرازها مع التشكيل
    let result = text;
    const words = text.split(/\s+/);

    words.forEach(word => {
        const normalizedWord = normalizeForSearch(word).toLowerCase();
        if (normalizedWord.includes(normalizedQuery)) {
            result = result.replace(word, `<mark class="search-highlight">${word}</mark>`);
        }
    });

    return result;
}
