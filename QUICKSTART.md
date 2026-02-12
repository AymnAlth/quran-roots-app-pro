# دليل البدء السريع | Quick Start Guide

<div align="center">

**احصل على التطبيق يعمل في 5 دقائق!**  
**Get the app running in 5 minutes!**

</div>

---

## ⚡ البدء السريع | Quick Start

### الخطوة 1: التثبيت | Install

```bash
# Clone and install
git clone <repository-url>
cd quran-roots-app-pro
pnpm install
```

### الخطوة 2: إعداد البيئة | Environment Setup

```bash
# Create .env file
cp .env.example .env

# Edit .env with your Turso credentials:
# TURSO_DB_URL=libsql://your-database.turso.io
# TURSO_DB_AUTH_TOKEN=your-token
```

### الخطوة 3: التشغيل | Run

```bash
# Start development server
pnpm dev

# Open: http://localhost:5173
```

---

## 🎯 الأوامر الأساسية | Essential Commands

| الأمر | الوصف |
|-------|-------|
| `pnpm dev` | تشغيل خادم التطوير \| Start dev server |
| `pnpm build` | بناء للإنتاج \| Build for production |
| `pnpm preview` | معاينة الإنتاج \| Preview production build |
| `pnpm check` | فحص الأخطاء \| Type checking |

---

## 🧪 اختبار سريع | Quick Test

### 1. اختبار الصفحة الرئيسية

```
✓ افتح http://localhost:5173
✓ يجب أن ترى صفحة الترحيب المصحف
✓ صندوق البحث يجب أن يكون مرئياً
```

### 2. اختبار البحث

```
✓ اكتب "رحم" في صندوق البحث
✓ يجب أن ترى مقترحات تلقائية
✓ اضغط Enter لرؤية النتائج
```

### 3. اختبار المصحف

```
✓ انتقل إلى /mushaf
✓ يجب أن ترى صفحة المصحف
✓ اضغط زر البحث (FAB)
✓ ابحث عن "الل" وشاهد النتائج الملونة
```

---

##  المشاكل الشائعة | Common Issues

### ❌ البيانات لا تظهر

**السبب:** قاعدة البيانات غير متصلة

**الحل:**
```bash
# Check .env file
cat .env

# Verify Turso credentials
turso db show quran-roots-db
```

### ❌ المنفذ مستخدم

**السبب:** Port 5173 already in use

**الحل:**
```bash
# Kill process on port
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or configure different port in vite.config.ts
```

### ❌ خطأ في التثبيت

**السبب:** Dependency conflicts

**الحل:**
```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install --force
```

---

## 📚 المزيد من المعلومات | More Information

- **التثبيت التفصيلي:** اقرأ [SETUP.md](SETUP.md)
- **البنية والمعمارية:** اقرأ [ARCHITECTURE.md](ARCHITECTURE.md)
- **النشر:** اقرأ [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md)

---

## 🎓 الخطوات التالية | Next Steps

بعد التشغيل الناجح:

1. ✅ **استكشف التطبيق** - جرب جميع المميزات
2. ✅ **اقرأ  التوثيق** - افهم البنية التقنية
3. ✅ **ابدأ التطوير** - أضف مميزات جديدة
4. ✅ **انشر التطبيق** - انشر على Vercel

---

## 📞 تحتاج مساعدة؟ | Need Help?

**تواصل مع المطور:**

📱 **+967774998429**  
✉️ **aymnaldhahby8@gmail.com**

---

<div align="center">

**تم التطوير بواسطة | Developed by**  
**أيمن أحمد الذاهبي | Ayman Ahmed Al-Dhahabi**

</div>
