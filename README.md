# تطبيق جذور القرآن الكريم | Quran Roots Application

<div align="center">

### منصة شاملة لاستكشاف وتحليل جذور الكلمات في القرآن الكريم
### Comprehensive Platform for Exploring and Analyzing Quranic Word Roots

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com/)

</div>

---

## 📖 نظرة عامة | Overview

تطبيق ويب حديث ومتقدم يوفر واجهة تفاعل ية شاملة للبحث عن الجذور اللغوية في القرآن الكريم مع عرض إحصائيات متقدمة، رسوم بيانية تفاعلية، تصورات ثلاثية الأبعاد، ومصحف كامل مع وظيفة بحث متقدمة.

A modern and advanced web application providing a comprehensive interactive interface for searching linguistic roots in the Holy Quran with advanced statistics, interactive charts, 3D visualizations, and a complete Mushaf with advanced search functionality.

---

## ✨ المميزات الرئيسية | Key Features

### 🔍 البحث المتقدم | Advanced Search
- **بحث سريع عن الجذور** - Fast root search with real-time autocomplete
- **بحث ذكي بدون تشكيل** - Smart search without diacritics (tashkeel)
- **توحيد أشكال الحروف** - Automatic normalization of hamza forms
- **مقترحات تلقائية** - Intelligent autocomplete suggestions using local word index
- **تاريخ البحث** - Recent searches tracking and management

### 📊 لوحة التحكم والإحصائيات | Dashboard & Statistics
- **لوحة تحليلية شاملة** - Comprehensive analytical dashboard
  - **مركز الثقل** (Center of Gravity) - Find verses with highest root frequency
  - **الجذور الشائعة** - Most common roots visualization
  - **التوزيع الإحصائي** - Statistical distribution across Surahs, Juz, and Pages
- **رسوم بيانية تفاعلية** - Interactive charts using Recharts
  - Bar charts, pie charts, and area charts
  - Hover effects and tooltips
  - Responsive design for all screen sizes

### 🕸️ التصورات المتقدمة | Advanced Visualizations
- **شبكة الجذور التفاعلية** - Interactive root network using 3D Force Graph
  - Node clustering and grouping
  - Real-time physics simulation
  - Zoom, pan, and node interactions
- **استكشاف حسب الطول** - Root exploration by length (3-5 letters)
- **خرائط حرارية** - Heatmaps showing root co-occurrences

### 📕 المصحف الكامل | Complete Mushaf
- **عرض المصحف بالكامل** - Full Mushaf display (604 pages)
- **بحث شامل في المصحف** - Comprehensive search across all pages
  - Search by text or root
  - Dual-color highlighting (text matches vs root derivatives)
  - Lazy loading for performance
  - Direct navigation to verses
- **أدوات تفاعلية** - Interactive tools via FAB (Floating Action Button)
- **فواصل السور** - Elegant Surah separators with Basmala

### 📑 صفحات السور | Surah Profiles
- **ملفات تعريفية كاملة** - Complete Surah profiles
  - Surah statistics and metadata
  - Unique roots analysis
  - Root frequency charts
  - Verse-by-verse root display
- **وضع القراءة** - Dedicated reading mode
- **جذور مميزة** - Highlighting of unique roots per Surah

### 🎨 التصميم والواجهة | Design & Interface
- **تصميم عصري ونظيف** - Modern, clean, and professional design
- **دعم الوضع المظلم** - Full dark mode support
- **استجابة كاملة** - Fully responsive (mobile, tablet, desktop)
- **هوية بصرية إسلامية** - Islamic visual identity with premium colors
- **خطوط عربية احترافية** - Professional Arabic fonts (Amiri, Cairo لقرآن)
- **انتقالات سلسة** - Smooth animations using Framer Motion

---

## 🏗️ البنية التقنية | Technical Architecture

### Frontend Stack
```
React 19.2 + TypeScript 5.6 + Vite
├── UI Framework: shadcn/ui + Radix UI
├── Styling: Tailwind CSS 4 + CSS Modules
├── State Management: React Context API
├── Routing: Wouter (lightweight router)
├── Charts: Recharts
├── 3D Graphics: Three.js + React Three Fiber
├── Animations: Framer Motion
└── Analytics: Vercel Analytics
```

### Backend Stack
```
Express.js + TypeScript
├── Database: LibSQL (Turso) - Cloud SQLite
├── Security: Helmet + CORS
├── Logging: Morgan
├── Compression: Gzip
└── Deployment: Vercel Serverless Functions
```

### Project Structure
```
quran-roots-app-pro/
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── pages/              # Main application pages (9)
│   │   │   ├── Home.tsx        # Landing page
│   │   │   ├── Dashboard.tsx   # Analytics dashboard
│   │   │   ├── DetailView.tsx  # Root details & verses
│   │   │   ├── Mushaf.tsx      # Complete Mushaf with search
│   │   │   ├── SurahProfile.tsx # Surah analysis
│   │   │   ├── RootNetworkExplorer.tsx # 3D network viz
│   │   │   ├── RootLengthExplorer.tsx  # Roots by length
│   │   │   ├── Settings.tsx    # App settings
│   │   │   └── NotFound.tsx    # 404 page
│   │   ├── components/         # Reusable components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── mushaf/         # Mushaf-specific components
│   │   │   ├── ui/             # shadcn/ui components (57+)
│   │   │   ├── charts/         # Chart components
│   │   │   ├── errors/         # Error handling components
│   │   │   └── labs/           # Experimental features
│   │   ├── contexts/           # Global state contexts
│   │   │   ├── QuranContext.tsx    # Quran data & search
│   │   │   └── ThemeContext.tsx    # Theme management
│   │   ├── lib/                # Utility libraries
│   │   │   ├── apiClient.ts    # HTTP client
│   │   │   ├── searchService.ts # Mushaf search logic
│   │   │   ├── mushafService.ts # Mushaf data fetching
│   │   │   └── errors.ts       # Error classes
│   │   └── hooks/              # Custom React hooks
│   └── public/                 # Static assets
├── server/                     # Backend Express server
│   └── index.ts               # Server entry point
├── api/                       # Vercel Serverless API
│   └── index.ts              # API entry point
├── backend/                   # Backend source code
│   └── src/
│       ├── config/           # Database configuration
│       ├── routes/           # API route controllers
│       ├── services/         # Business logic services
│       └── data/             # Static data (Surah names, etc.)
└── vercel.json              # Vercel deployment config
```

---

## 🚀 التقنيات المستخدمة | Technologies Used

### Core Technologies
| التقنية | الإصدار | الوظيفة |
|---------|---------|---------|
| React | 19.2.1 | Frontend framework |
| TypeScript | 5.6.3 | Type safety |
| Vite | 7.1.7 | Build tool & dev server |
| Express.js | 4.21.2 | Backend API server |
| LibSQL | 0.17.0 | Cloud SQLite database (Turso) |
| Tailwind CSS | 4.1.14 | Utility-first CSS framework |

### UI & Design
| المكتبة | الغرض |
|---------|--------|
| shadcn/ui | Component library |
| Radix UI | Accessible UI primitives |
| Lucide React | Icon library (450+ icons) |
| Framer Motion | Animation library |
| Recharts | Chart library |
| Three.js | 3D graphics |

### Specialized Libraries
- **react-force-graph-2d** - Network visualization
- **react-three-fiber** - React renderer for Three.js
- **wouter** - Lightweight routing
- **zod** - Schema validation
- **axios** - HTTP client
- **sonner** -- Toast notifications

---

## 📦 التثبيت والإعداد | Installation & Setup

### المتطلبات | Prerequisites
- Node.js >= 16.0.0
- pnpm >= 10.0.0 (recommended) or npm
- Git

### التثبيت السريع | Quick Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd quran-roots-app-pro

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
# Create .env file in root directory (see .env.example)

# 4. Start development server
pnpm dev

# Frontend will run on: http://localhost:5173
# Backend API will run on: http://localhost:3001/api (if configured)
```

### متغيرات البيئة | Environment Variables

```env
# Database (Turso)
TURSO_DB_URL=libsql://your-database.turso.io
TURSO_DB_AUTH_TOKEN=your-auth-token

# Optional: Analytics
VITE_VERCEL_ANALYTICS=true
```

### البناء للإنتاج | Production Build

```bash
# Build both client and server
pnpm build

# Start production server
pnpm start
```

---

## 🎯 الاستخدام | Usage

### البحث عن جذر | Searching for a Root
1. افتح الصفحة الرئيسية | Open the home page
2. اكتب الجذر في صندوق البحث (مثلاً: "رحم") | Type the root in the search box (e.g., "رحم")
3. اختر من المقترحات أو اضغط Enter | Select from suggestions or press Enter
4. استعرض النتائج والإحصائيات | Browse results and statistics

### استكشاف المصحف | Exploring the Mushaf
1. انتقل إلى صفحة المصحف | Navigate to Mushaf page
2. استخدم زر FAB (الزر العائم) للبحث | Use FAB (floating button) for search
3. ابحث بالكلمة أو الجذر | Search by word or root
4. انقر على النتيجة للانتقال للآية | Click result to navigate to verse

### استكشاف الشبكة | Network Exploration
1. انتقل إلى Dashboard → Network | Navigate to Dashboard → Network
2. قم بالتكبير/التصغير بعجلة الماوس | Zoom with mouse wheel
3. اسحب لتحريك الشبكة | Drag to pan
4. انقر على العقدة لرؤية التفاصيل | Click node for details

---

## 📊 واجهة برمجة التطبيقات | API Endpoints

### Search Endpoints
```typescript
GET /api/search/root/:root
// Returns all verses containing a specific root
// Response: { root, ayahs[], totalOccurrences }

GET /api/search/statistics/:root
// Returns comprehensive statistics for a root
// Response: { statistics: { totalOccurrences، surahDistribution, ... } }

GET /api/search/suggest?q=<query>
// Returns autocomplete suggestions
// Response: string[] (list of roots)
```

### Mushaf Endpoints
```typescript
GET /api/mushaf/page/:pageNumber
// Returns ا single Mushaf page data
// Response: { page, ayahs[], surahInfo }
```

### Surah Endpoints
```typescript
GET /api/surahs
// Returns list of all Surahs
// Response: { number, name, arabicName }[]

GET /api/surahs/:surahNumber
// Returns detailed Surah information with roots
// Response: { surah, ayahs[], roots[], statistics }
```

### Resources
```typescript
GET /api/resources/word-index
// Returns word-to-root mapping for autocomplete
// Response: { roots: string[], words: Record<string, string> }
```

---

## 🎨 الألوان والتصميم | Colors & Design

### لوحة الألوان | Color Palette
```css
/* Primary Colors */
--primary: 12 94% 65%        /* Teal/Turquoise */
--secondary: 34 89% 76%      /* Gold/Amber */
--accent: 340 82% 52%        /* Rose/Pink */

/* Background */
--background: 0 0% 100%      /* White */
--muted: 210 40% 96%         /* Light Gray */

/* Text */
--foreground: 222 47% 11%    /* Dark Blue */
--muted-foreground: 215 16% 47% /* Gray */
```

### الخطوط | Typography
- **Quran Text**: Amiri (خط عربي تقليدي)
- **Arabic Headings**: Cairo (خط حديث)
- **Body Text**: System UI fonts

---

## 🔒 الأمان | Security

- **Helmet.js** - Secure HTTP headers
- **CORS** - Cross-Origin Resource Sharing configuration
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Parameterized queries with LibSQL
- **Environment Variables** - Sensitive data protection
- **Rate Limiting** - (Recommended for production)

---

## 🚀 النشر | Deployment

### Vercel (Recommended)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

#3. Set environment variables in Vercel Dashboard
# TURSO_DB_URL
# TURSO_DB_AUTH_TOKEN
```

### متطلبات النشر | Deployment Requirements
- Vercel account
- Turso database (or compatible LibSQL/SQLite cloud service)
- Environment variables configured

---

## 📝 الترخيص | License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🤝 المساهمة | Contributing

المساهمات مرحب بها! يرجى:
Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 التواصل | Contact

**تم التطوير بواسطة | Developed by**  
**أيمن أحمد الذاهبي | Ayman Ahmed Al-Dhahabi**

📱 الهاتف | Phone: **+967774998429**  
✉️ البريد الإلكتروني | Email: **aymnaldhahby8@gmail.com**

---

## 🙏 شكر وتقدير | Acknowledgments

- القرآن الكريم | The Holy Quran
- مجتمع المطورين المسلمين | Muslim Developers Community
- shadcn/ui | Component Library
- Vercel | Hosting Platform
- Turso | Database Platform

---

<div align="center">

**بُني بـ ❤️ لخدمة كتاب الله**  
**Built with ❤️ to Serve the Book of Allah**

</div>
