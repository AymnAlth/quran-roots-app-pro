# دليل النشر على Vercel | Vercel Deployment Guide

<div align="center">

**دليل شامل لنشر تطبيق جذور القرآن على Vercel مع Turso**  
**Comprehensive Guide to Deploy Quran Roots App on Vercel with Turso**

</div>

---

## 📋 جدول المحتويات | Table of Contents

- [نظرة عامة](#نظرة-عامة--overview)
- [المتطلبات](#المتطلبات--requirements)
- [إعداد قاعدة البيانات Turso](#إعداد-قاعدة-البيانات-turso)
- [النشر على Vercel](#النشر-على-vercel)
- [إعداد متغيرات البيئة](#إعداد-متغيرات-البيئة)
- [التحقق من النشر](#التحقق-من-النشر)
- [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🌐 نظرة عامة | Overview

هذا الدليل يشرح كيفية نشر التطبيق على **Vercel** مع استخدام **Turso** كقاعدة بيانات سحابية.

This guide explains how to deploy the application on **Vercel** using **Turso** as cloud database.

### البنية المعمارية | Architecture

```
┌─────────────────┐
│  Vercel Frontend│ ← React SPA
│  (Static Files) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Vercel Functions│ ← Express API as Serverless
│   (Backend API) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Turso Database │ ← Cloud SQLite (LibSQL)
│   (LibSQL/Edge) │
└─────────────────┘
```

---

## ✅ المتطلبات | Requirements

### حسابات مطلوبة | Required Accounts

1. ✅ **Vercel Account** - [vercel.com/signup](https://vercel.com/signup)
2. ✅ **Turso Account** - [turso.tech/signup](https://turso.tech/signup)
3. ✅ **GitHub Account** - [github.com](https://github.com) (موصى به)

### أدوات محلية | Local Tools

```bash
# Vercel CLI (optional but recommended)
npm i -g vercel

# Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash
```

---

## 🗄️ إعداد قاعدة البيانات Turso

### الخطوة 1: تسجيل الدخول إلى Turso

```bash
# Login to Turso CLI
turso auth login

# This will open browser for authentication
```

### الخطوة 2: إنشاء قاعدة بيانات

```bash
# Create production database
turso db create quran-roots-production

# Optional: Create development database
turso db create quran-roots-development
```

### الخطوة 3: الحصول على بيانات الاتصال

```bash
# Get database URL
turso db show quran-roots-production --url

# Output example:
# libsql://quran-roots-production-[your-name].turso.io

# Create authentication token (never expires)
turso db tokens create quran-roots-production

# Output: eyJhbGci... (copy this token)
```

**⚠️ مهم:** احفظ هذه البيانات، ستحتاجها لاحقاً!

### الخطوة 4: استيراد البيانات

إذا كان لديك قاعدة بيانات SQLite محلية:

```bash
# Method 1: Using SQL dump
sqlite3 backend/database/quran_roots.sqlite ".dump" > data.sql
turso db shell quran-roots-production < data.sql

# Method 2: Using Turso import (if supported)
turso db import quran-roots-production backend/database/quran_roots.sqlite
```

### الخطوة 5: التحقق من البيانات

```bash
# Open database shell
turso db shell quran-roots-production

# Run test queries
> SELECT COUNT(*) FROM ayah;
> SELECT COUNT(*) FROM token;
> .tables
> .exit
```

---

## 🚀 النشر على Vercel

### الطريقة 1: النشر عبر Git (موصى به)

#### 1. رفع المشروع إلى GitHub

```bash
# Initialize git if not done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/quran-roots-app.git
git branch -M main
git push -u origin main
```

#### 2. ربط Vercel بـ GitHub

1. افتح [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository**
3. اختر مستودع GitHub الخاص بك
4. Vercel سيكتشف الإعدادات تلقائياً من `vercel.json`

#### 3. إعداد البناء

Vercel سيستخدم الإعدادات من `vercel.json` و `package.json`:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install"
}
```

### الطريقة 2: النشر عبر Vercel CLI

```bash
# Make sure you're logged in
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name? quran-roots-app
# - In which directory? ./
# - Want to override settings? No
```

---

## ⚙️ إعداد متغيرات البيئة

### في لوحة تحكم Vercel

1. افتح مشروعك في Vercel Dashboard
2. اذهب إلى **Settings** → **Environment Variables**
3. أضف المتغيرات التالية:

| الاسم | القيمة | البيئة |
|-------|--------|---------|
| `TURSO_DB_URL` | `libsql://quran-roots-production-....turso.io` | Production, Preview, Development |
| `TURSO_DB_AUTH_TOKEN` | `eyJhbGci...` (التوكن من Turso) | Production, Preview, Development |
| `NODE_ENV` | `production` | Production only |
| `VITE_VERCEL_ANALYTICS` | `true` | All (optional) |

### عبر Vercel CLI

```bash
# Add environment variables via CLI
vercel env add TURSO_DB_URL production
# Paste your database URL when prompted

vercel env add TURSO_DB_AUTH_TOKEN production
# Paste your auth token when prompted

# Pull environment variables for local development
vercel env pull .env.local
```

---

## ✔️ التحقق من النشر | Verify Deployment

### 1. افتح التطبيق

```
https://your-project-name.vercel.app
```

### 2. اختبر الصفحة الرئيسية

- ✅ يجب أن تحمل الصفحة بشكل صحيح
- ✅ صندوق البحث يجب أن يكون مرئياً
- ✅ لا توجد أخطاء في Console (F12)

### 3. اختبر البحث

```
البحث عن "رحم"
- ✅ يجب أن تظهر مقترحات تلقائية
- ✅ يجب أن تظهر نتائج البحث
- ✅ يجب أن تظهر الإحصائيات
```

### 4. اختبر المصحف

```
انتقل إلى /mushaf
- ✅ يجب أن تحمل صفحات المصحف
- ✅ البحث يعمل بشكل صحيح
- ✅ التلوين الملون للكلمات
```

### 5. افتح Vercel Functions

```
https://your-project-name.vercel.app/api/health

يجب أن ترجع:
{"status":"healthy"}
```

---

## 🔍 استكشاف الأخطاء | Troubleshooting

### المشكلة 1: خطأ في البناء (Build Error)

**الأعراض:**
```
Error: Build failed
```

**الحل:**
```bash
# Test build locally
pnpm build

# Check build logs in Vercel Dashboard
# Settings → Deployments → [Latest] → Build Logs

# Common issues:
# - Missing dependencies → Update package.json
# - TypeScript errors → Run pnpm check
# - Environment variables → Check .env setup
```

### المشكلة 2: 500 Internal Server Error

**الأعراض:**
- API يرجع 500
- Functions timeout  

**الحل:**
1. تحقق من Vercel Function Logs:
   - Dashboard → Functions → [function-name] → Logs

2. تحقق من متغيرات البيئة:
```bash
vercel env ls
```

3. تحقق من اتصال Turso:
```bash
# Test locally with production env
vercel env  pull
pnpm dev
```

### المشكلة 3: قاعدة البيانات لا تستجيب

**الأعراض:**
- Timeout errors
- "Failed to connect to database"

**الحل:**
```bash
# Verify Turso database is active
turso db list

# Check database status
turso db show quran-roots-production

# Recreate auth token if expired
turso db tokens create quran-roots-production
# Update in Vercel Environment Variables
```

### المشكلة 4: Cache Issues

**الأعراض:**
- Old code still running
- Changes not appearing

**الحل:**
```bash
# Force redeploy
vercel --force

# Or via dashboard:
# Deployments → [Latest] → ... → Redeploy
```

### المشكلة 5: Domain Issues

**الأعراض:**
- Custom domain not working
- SSL errors

**الحل:**
1. تحقق من DNS Settings
2. Vercel Dashboard → Settings → Domains
3. انتظر انتشار DNS (قد يستغرق 24-48 ساعة)

---

## 🔒 اعتبارات الأمان | Security Considerations

### 1. حماية المتغيرات الحساسة

- ✅ **لا تضع** التوكنات في الكود أبداً
- ✅ استخدم Vercel Environment Variables فقط
- ✅ لا ترفع `.env` إلى Git

### 2. CORS Configuration

المشروع مُعد بالفعل لـ Vercel، لكن تأكد من:

```typescript
// server/index.ts
app.use(cors({
origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app']
    : '*'
}));
```

### 3. Rate Limiting (موصى به للإنتاج)

أضف rate limiting للـ API:

```bash
pnpm add express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 المراقبة | Monitoring

### Vercel Analytics

```typescript
// Already enabled in App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Function Logs

```bash
# View real-time logs
vercel logs --follow

# View logs for specific deployment
vercel logs [deployment-url]
```

---

## 🚀 التحديثات المستقبلية | Future Updates

### النشر Automatic

يتم نشر تلقائي عند كل push إلى `main` branch:

```bash
git add .
git commit -m "Update feature"
git push origin main

# Vercel will auto-deploy ✅
```

### Preview Deployments

كل pull request يحصل على preview URL:

```bash
git checkout -b feature/new-feature
git push origin feature/new-feature

# Create PR on GitHub
# Vercel creates preview: https://quran-roots-app-git-feature-....vercel.app
```

---

## 📞 الدعم | Support

إذا واجهت مشاكل:

1. راجع [Vercel Documentation](https://vercel.com/docs)
2. راجع [Turso Documentation](https://docs.turso.tech)
3. تحقق من Function Logs
4. تواصل مع المطور:

📱 **+967774998429**  
✉️ **aymnaldhahby8@gmail.com**

---

<div align="center">

**تم التطوير بواسطة | Developed by**  
**أيمن أحمد الذاهبي | Ayman Ahmed Al-Dhahabi**

**🚀 نشر ناجح! Happy Deploying!**

</div>
