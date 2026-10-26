# وب‌سایت برند شخصی سه‌بعدی و پلتفرم راهکارهای هوش مصنوعی — مهدی سلیمانی

[**English Documentation (README)**](./README.md)

![وضعیت CI](https://github.com/Mahdi-Soleimani/3d-personal-site/actions/workflows/ci.yml/badge.svg)
![React 19](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.186-black?style=flat&logo=threedotjs)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.168-ff4154?style=flat)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?style=flat&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat&logo=typescript)
![مجوز](https://img.shields.io/badge/License-MIT-green?style=flat)

وب‌سایت تعاملی و مدرن برند شخصی با گرافیک سه‌بعدی پیشرفته و سینمایی، توسعه‌یافته بر پایه **React 19**، **Three.js**، **TanStack Start**، و **Tailwind CSS v4**. این پروژه شامل کوریوگرافی پیوسته دوربین سه‌بعدی با اسکرول، شیدرهای اختصاصی، تعامل با ماوس، و پنل مدیریت امن و مخفی برای درخواست‌های مشاوره است.

---

## 📸 گالری و پیش‌نمایش بصری

<div align="center">
  <img src="./assets/banner.png" alt="بنر سایت ۳بعدی" width="100%" />
</div>

<br />

| چرخش و هدایت سینمایی دوربین سه‌بعدی | معرفی پروژه‌ها و راهکارهای هوش مصنوعی |
| :---: | :---: |
| <img src="./assets/screenshots/case.png" width="100%" alt="نمای سه‌بعدی پروژه" /> | <img src="./assets/screenshots/vision.png" width="100%" alt="چشم‌انداز و پروژه‌ها" /> |

| پنل مدیریت مخفی درخواست‌های مشاوره | طراحی واکنش‌گرا و تجربه موبایل |
| :---: | :---: |
| <img src="./assets/screenshots/admin-dashboard.png" width="100%" alt="داشبورد ادمین" /> | <img src="./assets/screenshots/mobile.png" width="55%" alt="نمای موبایل" /> |

---

## ✨ قابلیت‌ها و ویژگی‌های کلیدی

### ۱. کوریوگرافی پیوسته و تعامل سه‌بعدی (Three.js & WebGL)
- **چرخش و تغییر زاویه دوربین با اسکرول (Camera Banking):** دوربین سه‌بعدی بر اساس ۱۰ بخش داستانی صفحه به نرمی تغییر موقعیت، زاویه (Pitch/Yaw) و رول می‌دهد.
- **پارالاکس حرکتی با ماوس:** واکنش شناور و دینامیک صحنه نسبت به حرکت نشانگر ماوس در دسکتاپ و ژست‌های لمسی در موبایل.
- **موج‌های رویه‌ای کف و شبکه‌های نوری:** استفاده از شیدرهای اختصاصی ورتکس برای شبیه‌سازی امواج نوری در کف صحنه.
- **کارت‌های اسپات‌لایت و بوردر نوری:** طراحی مینیمال و لوکس الهام‌گرفته از مرجع‌های مدرن نظیر [motionsites.ai](https://motionsites.ai/) و [21st.dev](https://21st.dev/) با تم آبسیدین و مس (`#0c0b09` / `#e09a55`).

### ۲. پنل مدیریت مخفی و ضد ایندکس درخواست‌های مشاوره (`/admin`)
- **غیرقابل ایندکس در گوگل:** مسدودسازی کامل در `robots.txt` و درج متاتگ‌های `noindex, nofollow, noarchive` و `googlebot`.
- **ذخیره‌سازی رمز و نام کاربری با هش امن:** استفاده از الگوریتم **PBKDF2-SHA256 (۱۰۰ هزار دور چرخش)** با سالت تصادفی؛ هیچ رمز عبوری به صورت خام در دیتابیس ذخیره نمی‌شود.
- **داشبورد مدیریت وضعیت‌ها:** فیلتر، جستجوی زنده، ثبت یادداشت خصوصی برای هر جلسه، تغییر وضعیت (`جدید`، `در حال پیگیری`، `تماس‌گرفته‌شده`، `بایگانی`).
- **تغییر نام کاربری و رمز عبور از داخل پنل:** امکان به‌روزرسانی امن مشخصات ورود از داخل مدال تنظیمات داشبورد.

### ۳. معماری فول‌استک مدرن
- **دیتابیس دوگانه PostgreSQL:** اجرای خودکار پایگاه داده محلی **PGLite** (تعبیه‌شده در وب‌اسمبلی) بدون نیاز به نصب نرم‌افزار اضافی، و امکان اتصال مستقیم به **Neon Postgres** در محیط پروداکشن تنها با تنظیم `DATABASE_URL`.
- **توابع امن سرور (`createServerFn`):** جداسازی کامل کدهای دیتابیس و اعتبارسنجی توکن نشست در لایه سرور؛ مرورگر کلاینت هیچ دسترسی مستقیمی به دیتابیس ندارد.

---

## 🛠 استک فناوری (Tech Stack)

| لایه | فناوری و ابزار |
| :--- | :--- |
| **فریم‌ورک** | [TanStack Start](https://tanstack.com/start) v1.168 / [Vite](https://vitejs.dev/) v8.2 / [Nitro](https://nitro.unjs.io/) v3 |
| **رابط کاربری** | [React 19](https://react.dev/) (`react` و `react-dom` 19.2) |
| **زبان** | [TypeScript](https://www.typescriptlang.org/) 5.7 |
| **موتور گرافیکی سه‌بعدی** | [Three.js](https://threejs.org/) r186 (WebGL, کوریوگرافی اختصاصی دوربین، شیدرها) |
| **استایل‌دهی** | [Tailwind CSS v4](https://tailwindcss.com/) + کتابخانه اجزای Radix UI + آیکون‌های Lucide |
| **مدیریت وضعیت** | [Zustand](https://github.com/pmndrs/zustand) v5 |
| **پایگاه داده** | PostgreSQL ([PGLite](https://pglite.dev/) برای توسعه لوکال / [Neon](https://neon.tech/) برای استقرار ابری) |
| **امنیت** | ماژول رمزنگاری نیتیو `node:crypto` با الگوریتم PBKDF2-SHA256 و نشست‌های امن |

---

## 📂 ساختار پوشه‌بندی و معماری

```text
3d-personal-site/
├── .github/
│   ├── workflows/ci.yml           # پایپ‌لاین بررسی کیفیت CI در گیت‌هاب (Lint, Typecheck, Test, Build)
│   ├── dependabot.yml             # به‌روزرسانی خودکار پکیج‌ها
│   ├── ISSUE_TEMPLATE/            # قالب‌های استاندارد ثبت باگ و پیشنهاد قابلیت
│   └── pull_request_template.md   # چک‌لیست بازبینی PR
├── assets/
│   ├── banner.png                 # بنر اصلی معرفی مخزن
│   ├── social-preview.png         # کارت پیش‌نمایش شبکه‌های اجتماعی گیت‌هاب (1280x640)
│   └── screenshots/               # اسکرین‌شات‌های باکیفیت بخش‌های مختلف
├── migrations/
│   ├── 0001_initial.sql           # ساختار اولیه جداول
│   └── 0002_consultation_admin.sql# جدول درخواست‌های مشاوره و ادمین با گذرواژه هش‌شده
├── public/
│   └── robots.txt                 # مسدودسازی ایندکس صفحه ادمین در موتورهای جستجو
├── src/
│   ├── components/
│   │   ├── observatory.tsx        # هسته اصلی بوم Three.js و کوریوگرافی دوربین
│   │   ├── home-film.tsx          # بخش‌های داستانی، کارت‌های پروژه‌ها و افکت‌های نوری
│   │   ├── site-chrome.tsx        # نوار ناوبری، پیشرفت اسکرول و هدر
│   │   └── ui/                    # اجزای اشتراکی طراحی با Tailwind
│   ├── lib/
│   │   ├── admin-service.ts       # منطق هشینگ PBKDF2، نشست‌ها و توابع سرور ادمین
│   │   ├── contact-service.ts     # تابع سرور دریافت و ثبت فرم مشاوره
│   │   └── db.ts                  # کلاینت سرور دیتابیس (پشتیبانی PGLite و Neon)
│   ├── routes/
│   │   ├── index.tsx              # صفحه اصلی لندینگ برند و رزرو مشاوره
│   │   └── admin.tsx              # پنل مدیریت مخفی (محافظت‌شده با رمز و noindex)
│   ├── routeTree.gen.ts           # درخت مسیرهای خودکار TanStack Router
│   ├── router.tsx                 # پیکربندی روتر و صفحات خطا
│   └── styles.css                 # توکن‌های رنگی، فونت و استایل‌های اصلی
├── test/
│   └── unit/services.test.mjs     # آزمون‌های خودکار اعتبارسنجی، هشینگ و امنیت
├── .env.example                   # نمونه متغیرهای محیطی
├── package.json                   # اسکریپت‌ها و وابستگی‌های پروژه
├── tsconfig.json                  # تنظیمات کامپایلر تایپ‌اسکریپت
├── vercel.json                    # پیکربندی بیلد در ورسل
└── vite.config.ts                 # پیکربندی وایت، نیترو و تیل‌ویند
```

---

## 🚀 راهنمای راه‌اندازی سریع

### پیش‌نیازها
- **Node.js:** نسخه v20.x یا v22.x LTS
- **npm:** نسخه v10.x به بالا

### ۱. دریافت مخزن و نصب پکیج‌ها
```bash
git clone https://github.com/Mahdi-Soleimani/3d-personal-site.git
cd 3d-personal-site
npm ci
```

### ۲. پیکربندی متغیرهای محیطی (اختیاری)
```bash
cp .env.example .env
```
> **نکته:** در صورتی که `DATABASE_URL` را خالی بگذارید، برنامه به طور خودکار پایگاه داده داخلی سبک **PGLite** را فعال می‌کند و نیازی به نصب دیتابیس روی سیستم ندارید.

### ۳. اجرای سرور توسعه
```bash
npm run dev
```
آدرس [http://localhost:8080](http://localhost:8080) را در مرورگر باز کنید.

---

## 🧪 آزمون‌ها و بررسی کیفیت کد

تمام مراحل تست و کنترل کیفیت در محیط لوکال قابل اجرا هستند:

```bash
# بررسی تطابق نوع داده‌ها (TypeScript)
npm run typecheck

# بازبینی استانداردها و فرمت کد (ESLint)
npm run lint

# اجرای تست‌های خودکار واحد و اعتبارسنجی
npm run test

# تست بیلد نهایی پروداکشن
npm run build
```

---

## 🌐 راهنمای استقرار رایگان (دیپلوی روی Vercel)

این پروژه با پریست سرورلس نیترو برای ورسل تنظیم شده است (`nitro({ preset: 'vercel' })` در `vite.config.ts` و `vercel.json`).

### مراحل استقرار رایگان در Vercel:
1. مخزن را به گیت‌هاب ارسال کنید:
   ```bash
   git push -u origin main
   ```
2. وارد پنل [Vercel](https://vercel.com/) شده و گزینه **Add New Project** را بزنید.
3. مخزن `3d-personal-site` را انتخاب کنید.
4. بخش **Framework Preset** را روی *Other* (یا Vite) بگذارید.
5. در بخش **Environment Variables**:
   - *(اختیاری)* متغیر `DATABASE_URL` را با آدرس یک پایگاه داده PostgreSQL ابری رایگان (مانند [Neon.tech](https://neon.tech)) پر کنید.
6. دکمه **Deploy** را بزنید. وب‌سایت در کمتر از ۲ دقیقه به صورت جهانی مستقر خواهد شد.

---

## 🔒 امنیت و حریم خصوصی

- **عدم ذخیره رمز ساده:** تمامی کلمات عبور با الگوریتم PBKDF2-SHA256 و ۱۰۰ هزار دور چرخش همراه با نمک تصادفی نگهداری می‌شوند.
- **حفاظت کامل در برابر موتورهای جستجو:** آدرس `/admin` با لایه‌های چندگانه (`robots.txt` و متاتگ‌های پیشرفته) از ایندکس گوگل مخفی شده است.
- **امنیت سمت سرور:** دسترسی به دیتابیس در فایل [src/lib/db.ts](file:///Users/mahdi/Documents/3D%20Personal%20Brand/src/lib/db.ts) دارای گارد انحصاری سرور (`Server-Only`) است و هیچ کدی به سمت کلاینت نشت نمی‌کند.

جهت گزارش مسائل امنیتی به سند [سیاست امنیت (SECURITY.md)](./SECURITY.md) مراجعه نمایید.

---

## 📄 مجوز انتشار

این پروژه تحت مجوز [MIT License](./LICENSE) منتشر شده است.

طراحی و پیاده‌سازی با افتخار توسط **مهدی سلیمانی**.
