
// const { createClient } = require('@libsql/client');

// /* ===========================
//    Validation
// =========================== */
// if (!process.env.TURSO_DB_URL || !process.env.TURSO_DB_AUTH_TOKEN) {
//   throw new Error(
//     '❌ Missing TURSO_DB_URL or TURSO_DB_AUTH_TOKEN in backend/.env'
//   );
// }

// /* ===========================
//    Turso Client
// =========================== */
// const client = createClient({
//   url: process.env.TURSO_DB_URL,
//   authToken: process.env.TURSO_DB_AUTH_TOKEN,
// });

// let logged = false;
// function logOnce() {
//   if (!logged) {
//     console.log('✅ Connected to Turso (remote SQLite via libSQL)');
//     logged = true;
//   }
// }

// /* ===========================
//    Query Helpers
// =========================== */
// async function executeQuery(sql, params = []) {
//   logOnce();
//   const result = await client.execute({
//     sql,
//     args: params,
//   });
//   return result.rows || [];
// }

// async function executeGet(sql, params = []) {
//   logOnce();
//   const result = await client.execute({
//     sql,
//     args: params,
//   });
//   return result.rows?.[0] ?? null;
// }

// /* ===========================
//    Surah Names (كما كان متوقعًا)
// =========================== */
// const getSurahName = (surahNo) => {
//   const surahNames = {
//     1: 'الفاتحة', 2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 5: 'المائدة',
//     6: 'الأنعام', 7: 'الأعراف', 8: 'الأنفال', 9: 'التوبة', 10: 'يونس',
//     11: 'هود', 12: 'يوسف', 13: 'الرعد', 14: 'إبراهيم', 15: 'الحجر',
//     16: 'النحل', 17: 'الإسراء', 18: 'الكهف', 19: 'مريم', 20: 'طه',
//     21: 'الأنبياء', 22: 'الحج', 23: 'المؤمنون', 24: 'النور', 25: 'الفرقان',
//     26: 'الشعراء', 27: 'النمل', 28: 'القصص', 29: 'العنكبوت', 30: 'الروم',
//     31: 'لقمان', 32: 'السجدة', 33: 'الأحزاب', 34: 'سبأ', 35: 'فاطر',
//     36: 'يس', 37: 'الصافات', 38: 'ص', 39: 'الزمر', 40: 'غافر',
//     41: 'فصلت', 42: 'الشورى', 43: 'الزخرف', 44: 'الدخان', 45: 'الجاثية',
//     46: 'الأحقاف', 47: 'محمد', 48: 'الفتح', 49: 'الحجرات', 50: 'ق',
//     51: 'الذاريات', 52: 'الطور', 53: 'النجم', 54: 'القمر', 55: 'الرحمن',
//     56: 'الواقعة', 57: 'الحديد', 58: 'المجادلة', 59: 'الحشر', 60: 'الممتحنة',
//     61: 'الصف', 62: 'الجمعة', 63: 'المنافقون', 64: 'التغابن', 65: 'الطلاق',
//     66: 'التحريم', 67: 'الملك', 68: 'القلم', 69: 'الحاقة', 70: 'المعارج',
//     71: 'نوح', 72: 'الجن', 73: 'المزمل', 74: 'المدثر', 75: 'القيامة',
//     76: 'الإنسان', 77: 'المرسلات', 78: 'النبأ', 79: 'النازعات', 80: 'عبس',
//     81: 'التكوير', 82: 'الإنفطار', 83: 'المطففين', 84: 'الانشقاق', 85: 'البروج',
//     86: 'الطارق', 87: 'الأعلى', 88: 'الغاشية', 89: 'الفجر', 90: 'البلد',
//     91: 'الشمس', 92: 'الليل', 93: 'الضحى', 94: 'الشرح', 95: 'التين',
//     96: 'العلق', 97: 'القدر', 98: 'البينة', 99: 'الزلزلة', 100: 'العاديات',
//     101: 'القارعة', 102: 'التكاثر', 103: 'العصر', 104: 'الهمزة', 105: 'الفيل',
//     106: 'قريش', 107: 'الماعون', 108: 'الكوثر', 109: 'الكافرون', 110: 'النصر',
//     111: 'المسد', 112: 'الإخلاص', 113: 'الفلق', 114: 'الناس'
//   };

//   return surahNames[surahNo] || `سورة ${surahNo}`;
// };

// /* ===========================
//    Public API (مطابقة 100%)
// =========================== */
// module.exports = {
//   executeQuery,
//   executeGet,
//   getSurahName,
// };
const { createClient } = require('@libsql/client');
const path = require('path');
const { resolveLocalDb } = require('./localDbResolver');

/* ===========================
   Database Configuration
=========================== */
// تحديد مسار قاعدة البيانات المحلية تلقائياً
// نحن في: backend/src/config
// الداتا في: backend/data/quran.db
const localDbPath = path.join(process.cwd(), 'backend', 'database', 'quran_roots_dual_v2.sqlite');
const compressedDbPath = `${localDbPath}.gz`;

let resolvedLocalDbPath = localDbPath;
let localDbSource = 'direct-sqlite';

if (!process.env.TURSO_DB_URL) {
  const resolved = resolveLocalDb({
    preferredPath: localDbPath,
    gzipPath: compressedDbPath,
  });

  resolvedLocalDbPath = resolved.path;
  localDbSource = resolved.source;
}

const config = {
  url: process.env.TURSO_DB_URL || `file:${resolvedLocalDbPath}`,
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
};

/* ===========================
   Client Initialization
=========================== */
const client = createClient(config);

let logged = false;
function logOnce() {
  if (!logged) {
    const mode = config.url.startsWith('file:')
      ? `📂 Local SQLite (${localDbSource})`
      : '☁️ Remote Turso';
    console.log(`✅ Database Connected: ${mode}`);
    console.log(`📍 Path used: ${resolvedLocalDbPath}`); // سيظهر هذا في لوج Vercel للتأكد
    console.log(`🗜️ Archive path: ${compressedDbPath}`);
    logged = true;
  }
}

/* ===========================
   Query Helpers
=========================== */
async function executeQuery(sql, params = []) {
  logOnce();
  try {
    const result = await client.execute({
      sql,
      args: params,
    });
    return result.rows || [];
  } catch (error) {
    console.error('❌ Database Query Error:', error.message);
    throw error;
  }
}

async function executeGet(sql, params = []) {
  logOnce();
  try {
    const result = await client.execute({
      sql,
      args: params,
    });
    return result.rows?.[0] ?? null;
  } catch (error) {
    console.error('❌ Database Get Error:', error.message);
    throw error;
  }
}

/* ===========================
   Surah Names
=========================== */
const getSurahName = (surahNo) => {
  const surahNames = {
    1: 'الفاتحة', 2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 5: 'المائدة',
    6: 'الأنعام', 7: 'الأعراف', 8: 'الأنفال', 9: 'التوبة', 10: 'يونس',
    11: 'هود', 12: 'يوسف', 13: 'الرعد', 14: 'إبراهيم', 15: 'الحجر',
    16: 'النحل', 17: 'الإسراء', 18: 'الكهف', 19: 'مريم', 20: 'طه',
    21: 'الأنبياء', 22: 'الحج', 23: 'المؤمنون', 24: 'النور', 25: 'الفرقان',
    26: 'الشعراء', 27: 'النمل', 28: 'القصص', 29: 'العنكبوت', 30: 'الروم',
    31: 'لقمان', 32: 'السجدة', 33: 'الأحزاب', 34: 'سبأ', 35: 'فاطر',
    36: 'يس', 37: 'الصافات', 38: 'ص', 39: 'الزمر', 40: 'غافر',
    41: 'فصلت', 42: 'الشورى', 43: 'الزخرف', 44: 'الدخان', 45: 'الجاثية',
    46: 'الأحقاف', 47: 'محمد', 48: 'الفتح', 49: 'الحجرات', 50: 'ق',
    51: 'الذاريات', 52: 'الطور', 53: 'النجم', 54: 'القمر', 55: 'الرحمن',
    56: 'الواقعة', 57: 'الحديد', 58: 'المجادلة', 59: 'الحشر', 60: 'الممتحنة',
    61: 'الصف', 62: 'الجمعة', 63: 'المنافقون', 64: 'التغابن', 65: 'الطلاق',
    66: 'التحريم', 67: 'الملك', 68: 'القلم', 69: 'الحاقة', 70: 'المعارج',
    71: 'نوح', 72: 'الجن', 73: 'المزمل', 74: 'المدثر', 75: 'القيامة',
    76: 'الإنسان', 77: 'المرسلات', 78: 'النبأ', 79: 'النازعات', 80: 'عبس',
    81: 'التكوير', 82: 'الإنفطار', 83: 'المطففين', 84: 'الانشقاق', 85: 'البروج',
    86: 'الطارق', 87: 'الأعلى', 88: 'الغاشية', 89: 'الفجر', 90: 'البلد',
    91: 'الشمس', 92: 'الليل', 93: 'الضحى', 94: 'الشرح', 95: 'التين',
    96: 'العلق', 97: 'القدر', 98: 'البينة', 99: 'الزلزلة', 100: 'العاديات',
    101: 'القارعة', 102: 'التكاثر', 103: 'العصر', 104: 'الهمزة', 105: 'الفيل',
    106: 'قريش', 107: 'الماعون', 108: 'الكوثر', 109: 'الكافرون', 110: 'النصر',
    111: 'المسد', 112: 'الإخلاص', 113: 'الفلق', 114: 'الناس'
  };

  return surahNames[surahNo] || `سورة ${surahNo}`;
};

/* ===========================
   Public API
=========================== */
module.exports = {
  executeQuery,
  executeGet,
  getSurahName,
};
