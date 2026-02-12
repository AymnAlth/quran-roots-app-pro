# دليل الإعداد والتثبيت | Setup & Installation Guide

## 📋 جدول المحتويات | Table of Contents

- [المتطلبات الأساسية](#المتطلبات-الأساسية--prerequisites)
- [التثبيت المحلي](#التثبيت-المحلي--local-installation)
- [إعداد قاعدة البيانات](#إعداد-قاعدة-البيانات--database-setup)
- [إعداد متغيرات البيئة](#إعداد-متغيرات-البيئة--environment-variables)
- [تشغيل التطبيق](#تشغيل-التطبيق--running-the-application)
- [استكشاف الأخطاء](#استكشاف-الأخطاء--troubleshooting)

---

## 💻 المتطلبات الأساسية | Prerequisites

### البرامج المطلوبة | Required Software

| البرنامج | الإصدار المطلوب | رابط التحميل |
|----------|-----------------|---------------|
| Node.js | >= 16.0.0 | [nodejs.org](https://nodejs.org/) |
| pnpm | >= 10.0.0 | [pnpm.io](https://pnpm.io/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### التحقق من التثبيت | Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v16.x.x or higher

# Check pnpm version
pnpm --version
# Should output: 10.x.x or higher

# Check Git version
git --version
# Should output: git version 2.x.x or higher
```

### تثبيت pnpm (إذا لم يكن مثبتاً) | Install pnpm (if not installed)

```bash
# Using npm
npm install -g pnpm

# Using Corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 📥 التثبيت المحلي | Local Installation

### الخطوة 1: استنساخ المستودع | Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd quran-roots-app-pro
```

### الخطوة 2 تثبيت الاعتماديات | Install Dependencies

```bash
# Install all dependencies using pnpm
pnpm install

# This will install dependencies for:
# - Root project
# - Frontend (client)
# - Backend (server)
```

**ملاحظة:** عملية التثبيت قد تستغرق 2-5 دقائق حسب سرعة الإنترنت.

---

## 🗄️ إعداد قاعدة البيانات | Database Setup

يستخدم هذا المشروع **LibSQL (Turso)** كقاعدة بيانات سحابية.

### الخيار 1: استخدام قاعدة بيانات Turso سحابية (موصى به)

#### 1. إنشاء حساب Turso

```bash
# Visit: https://turso.tech
# Create an account and follow the setup wizard
```

#### 2. إنشاء قاعدة بيانات جديدة

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Create new database
turso db create quran-roots-db

# Get database URL
turso db show quran-roots-db --url

# Create authentication token
turso db tokens create quran-roots-db
```

#### 3. استيراد البيانات

إذا كان لديك ملف SQLite محلي:

```bash
# Export local SQLite to SQL dump
sqlite3 your-local-database.sqlite ".dump" > dump.sql

# Import to Turso
turso db shell quran-roots-db < dump.sql
```

### الخيار 2: قاعدة بيانات محلية للتطوير

```bash
# Create backend/database directory if not exists
mkdir -p backend/database

# Place your SQLite file:
# backend/database/quran_roots.sqlite
```

**ملاحظة:** القاعدة المحلية مناسبة للتطوير فقط. للإنتاج استخدم Turso.

---

## ⚙️ إعداد متغيرات البيئة | Environment Variables

### إنشاء ملف .env

```bash
# Create .env file in root directory
touch .env
```

### محتوى ملف .env

```env
# ======================
# Database Configuration
# ======================

# Turso Database URL (Required for production)
TURSO_DB_URL=libsql://your-database.turso.io

# Turso Authentication Token (Required for production)
TURSO_DB_AUTH_TOKEN=your-auth-token-here

# ======================
# Optional Configuration
# ======================

# Enable Vercel Analytics (optional)
VITE_VERCEL_ANALYTICS=true

# API Base URL (default: /api)
# VITE_API_BASE_URL=/api

# Node Environment
NODE_ENV=development
```

### الحصول على بيانات Turso

```bash
# Get database URL
turso db show quran-roots-db --url
# Copy output to TURSO_DB_URL

# Get auth token
turso db tokens create quran-roots-db
# Copy output to TURSO_DB_AUTH_TOKEN
```

---

## 🚀 تشغيل التطبيق | Running the Application

### وضع التطوير | Development Mode

```bash
# Start development server
pnpm dev

# This will start:
# ✓ Vite dev server on http://localhost:5173
# ✓ Backend API on http://localhost:3001 (if configured)
# ✓ Hot Module Replacement (HMR) enabled
```

**الوصول للتطبيق:**
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API:** [http://localhost:3001/api](http://localhost:3001/api)

### وضع المعاينة | Preview Mode

```bash
# Build the application
pnpm build

# Preview production build
pnpm preview

# Access at: http://localhost:4173
```

### أوامر إضافية | Additional Commands

```bash
# Type checking
pnpm check

# Format code
pnpm format

# Build only client
pnpm build:client

# Build only server
pnpm build:server
```

---

## 🔧 استكشاف الأخطاء | Troubleshooting

### المشكلة 1: فشل تثبيت الاعتماديات

**الخطأ:**
```
ERR_PNPM_...
```

**الحل:**
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# If still fails, try with --force
pnpm install --force
```

### المشكلة 2: خطأ في الاتصال بقاعدة البيانات

**الخطأ:**
```
Database connection failed
```

**الحل:**
1. تحقق من صحة `TURSO_DB_URL` في ملف `.env`
2. تحقق من صلاحية `TURSO_DB_AUTH_TOKEN`
3. تأكد من أن قاعدة البيانات موجودة ونشطة:
```bash
turso db list
turso db show quran-roots-db
```

### المشكلة 3: المنفذ مستخدم بالفعل

**الخطأ:**
```
EADDRINUSE: address already in use :::5173
```

**الحل:**
```bash
# Kill process using the port (Linux/Mac)
lsof -i :5173
kill -9 <PID>

# Or on Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or change port in vite.config.ts
# server: { port: 3000 }
```

### المشكلة 4: خطأ في استيراد الخطوط

**الخطأ:**
```
Failed to load fonts
```

**الحل:**
```bash
# Run font installation script
node install_fonts.js

# Or manually install fonts
pnpm add @fontsource/amiri @fontsource/cairo
```

### المشكلة 5: البيانات لا تظهر في المصحف

**الخطأ:**
صفحة المصحف فارغة أو لا تعرض آيات

**الحل:**
1. تحقق من وجود البيانات في قاعدة البيانات:
```bash
turso db shell quran-roots-db
> SELECT COUNT(*) FROM ayah;
```

2. تحقق من استجابة API:
```bash
curl http://localhost:5173/api/mushaf/page/1
```

3. افتح Developer Console (F12) وتحقق من الأخطاء

### المشكلة 6: البحث لا يعمل

**الأعراض:**
- لا توجد نتائج عند البحث
- رسائل خطأ في Console

**الحل:**
1. تحقق من توفر Word Index:
```bash
curl http://localhost:5173/api/resources/word-index
```

2. تحقق من QuranContext في Developer Tools → React DevTools

3. تحقق من Network Tab لرؤية طلبات API

### المشكلة 7: الرسوم البيانية لا تظهر

**الحل:**
```bash
# تأكد من تثبيت recharts
pnpm add recharts

# أعد بناء التطبيق
pnpm build
```

### المشكلة 8: الوضع المظلم لا يعمل

**الحل:**
1. تحقق من ThemeProvider في App.tsx
2. امسح localStorage:
```javascript
localStorage.clear()
location.reload()
```

3. تحقق من إعدادات المتصفح (system theme)

---

## 📊 التحقق من التثبيت | Verify Installation

### اختبار 1: التطبيق يعمل

```bash
# Start dev server
pnpm dev

# Open browser to http://localhost:5173
# You should see the home page with search bar
```

### اختبار 2: API يستجيب

```bash
# Test API health
curl http://localhost:3001/health

# Expected output:
# {"status":"healthy","timestamp":"..."}
```

### اختبار 3: البحث يعمل

1. افتح التطبيق
2. اكتب "رحم" في صندوق البحث
3. يجب أن ترى مقترحات تلقائية
4. اضغط Enter وتحقق من ظهور النتائج

### اختبار 4: المصحف يعمل

1. انتقل إلى `/mushaf`
2. يجب أن ترى صفحة المصحف
3. اضغط على زر البحث (FAB)
4. ابحث عن "الله" وتحقق من النتائج

---

## 🎓 خطوات ما بعد التثبيت | Next Steps

بعد التثبيت الناجح:

1. **استكشف التطبيق** - جرب جميع الصفحات والمميزات
2. **اقرأ التوثيق** - راجع ARCHITECTURE.md لفهم البنية
3. **ابدأ التطوير** - راجع المكونات والخدمات
4. **انشر التطبيق** - اتبع DEPLOYMENT_VERCEL.md للنشر

---

## 📞 الدعم | Support

إذا واجهت مشاكل:

1. راجع قسم استكشاف الأخطاء أعلاه
2. تحقق من سجلات Terminal
3. افتح Developer Console (F12) في المتصفح
4. تواصل مع المطور:
   - 📧 Email: aymnaldhahby8@gmail.comm
   - 📱 Phone: +967774998429

---

**تم التطوير بواسطة | Developed by**  
**أيمن أحمد الذاهبي | Ayman Ahmed Al-Dhahabi**
