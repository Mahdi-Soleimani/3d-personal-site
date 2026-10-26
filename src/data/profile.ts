export const profile = {
  name: "مهدی سلیمانی",
  latin: "Mahdi Soleimani",
  role: "معمار راهکارهای هوشمند",
  city: "نجف‌آباد، اصفهان",
  email: "mahdisoleimani2003@gmail.com",
  phone: "09902311382",
  phoneDisplay: "۰۹۹۰۲۳۱۱۳۸۲",
  linkedin: "https://www.linkedin.com/in/mahdi-soleimani2003",
  github: "https://github.com/Mahdi-Soleimani",
  studio: "https://nexoraaistudio.tech",
  studioName: "نکسورا",
} as const;

export type FlowNode = { name: string; detail: string };

export type ProjectLink = { label: string; href: string };

export type Project = {
  slug: string;
  index: string;
  title: string;
  kicker: string;
  metric: string;
  metricLabel: string;
  year: string;
  role: string;
  summary: string;
  problem: string;
  outcome: string;
  points: string[];
  stack: string[];
  links: ProjectLink[];
  flow: FlowNode[];
};

export const projects: Project[] = [
  {
    slug: "nova",
    index: "01",
    title: "اکوسیستم نوا",
    kicker: "سوپراپ بله",
    metric: "۷۰٬۰۰۰+",
    metricLabel: "کاربر فعال",
    year: "۱۴۰۴",
    role: "طراحی، توسعه و مدیریت محصول",
    summary:
      "دستیار هوشمند داخل بله که بین چند مدل زبانی تصمیم می‌گیرد و پرداخت را بدون صف انسانی تأیید می‌کند.",
    problem:
      "کاربر یک سوپراپ نمی‌خواهد بداند کدام مدل برای کدام کار بهتر است. هم‌زمان، تراکنش و کارت هدیه نباید پشت تأیید دستی بماند، و مصرف مدل باید برای حساب‌های اشتراکی قابل کنترل باشد.",
    outcome:
      "نوا دسترسی مستقیم به ChatGPT، Claude، Gemini و تصویرسازها را پشت یک مسیریاب نیت قرار داد و به بیش از هفتاد هزار کاربر فعال سرویس پایدار داد.",
    points: [
      "سیستم تصمیم‌گیری برای تشخیص نیاز کاربر و انتخاب مدل زبانی یا تصویرساز، به‌جای منوی مدل‌ها.",
      "پرداخت اختصاصی و کارت هدیه با تأیید خودکار و لحظه‌ای، بدون دخالت انسان در مسیر عادی.",
      "استخراج داده از PDF، تصویر و صوت، به‌اضافه ابزارهای جانبی روی همان هسته.",
      "مدل درآمدی با حساب اشتراکی چندکاربره برای کنترل مصرف، نه فقط یک اشتراک تک‌نفره.",
    ],
    stack: ["AI Agent", "Multi-LLM Router", "Prompt Engineering", "Payments"],
    links: [],
    flow: [
      { name: "نیت کاربر", detail: "متن، فایل یا درخواست تصویر" },
      { name: "مسیریاب", detail: "انتخاب بین مدل‌های زبانی و تصویر" },
      { name: "ابزار", detail: "استخراج، پرداخت، کارت هدیه" },
      { name: "حساب", detail: "سهمیه و دسترسی چندکاربره" },
    ],
  },
  {
    slug: "telegram-finance",
    index: "02",
    title: "اتوماسیون محتوای مالی",
    kicker: "تلگرام",
    metric: "HITL",
    metricLabel: "ایستگاه تأیید انسان",
    year: "۱۴۰۴",
    role: "معماری جریان و پیاده‌سازی",
    summary:
      "استخراج، پردازش و بازنشر کانال‌های مالی؛ ماشین پیش‌نویس می‌سازد و انسان قبل از انتشار تأیید می‌کند.",
    problem:
      "کانال مالی اگر کاملاً خودکار باشد خطر خطای عمومی دارد، و اگر کاملاً دستی باشد از حجم کانال‌های مبدأ عقب می‌ماند.",
    outcome:
      "یک جریان مقیاس‌پذیر با یوزربات پایتون و n8n که پیش‌نویس را تا ایستگاه انسان می‌رساند و فقط بعد از تأیید منتشر می‌کند.",
    points: [
      "اسکریپت پایتون برای اتصال به اکانت کاربری تلگرام و استخراج خودکار از کانال‌های مبدأ.",
      "ورک‌فلوهای مستند در n8n برای مدیریت جریان داده، نه یک زنجیره شکننده و نانوشته.",
      "Human-in-the-loop: بررسی و اصلاح محتوا پیش از ارسال به کانال مقصد.",
      "پردازش متن با مدل زبانی، APIهای بیرونی، و ثبت کاربر، دسترسی و خطا در PostgreSQL.",
      "کارهای ناهمگام از مسیر Webhook و REST، با لاگ و مدیریت خطا.",
    ],
    stack: ["Python", "n8n", "PostgreSQL", "Webhook", "REST", "LLM"],
    links: [
      {
        label: "مخزن گیت‌هاب",
        href: "https://github.com/Mahdi-Soleimani/telegram-ai-content-pipeline",
      },
    ],
    flow: [
      { name: "مبدأ", detail: "یوزربات پایتون" },
      { name: "ارکستراسیون", detail: "n8n" },
      { name: "انسان", detail: "تأیید یا اصلاح" },
      { name: "مقصد", detail: "انتشار و لاگ" },
    ],
  },
  {
    slug: "content-foundry",
    index: "03",
    title: "ریخته‌گری محتوا",
    kicker: "چند خروجی از یک منبع",
    metric: "۱ → ۴",
    metricLabel: "قالب انتشار",
    year: "۱۴۰۴",
    role: "معماری پلتفرم",
    summary:
      "یک متن، صوت، ویدیو یا لینک وارد می‌شود و مقاله، پست تلگرام، اسلاید اینستاگرام و سناریوی استوری بیرون می‌آید.",
    problem:
      "همان حرف را برای چهار کانال بازنویسی کردن، کار تکراری است و نسخه‌ها از هم فاصله می‌گیرند.",
    outcome:
      "PostgreSQL منبع حقیقت است، MinIO فایل باینری را نگه می‌دارد، n8n جریان را اجرا می‌کند و تبدیل سنگین رسانه در ورکر جدا انجام می‌شود.",
    points: [
      "ورودی خام: متن، صوت، ویدیو یا لینک.",
      "خروجی هم‌ریشه: مقاله سایت، محتوای تلگرام، پست اسلایدی اینستاگرام، سناریوی استوری.",
      "جدا کردن ارکستراسیون از پردازش سنگین تا جریان اصلی معطل تبدیل رسانه نماند.",
    ],
    stack: ["n8n", "PostgreSQL", "MinIO", "Workers", "LLM"],
    links: [
      {
        label: "مخزن گیت‌هاب",
        href: "https://github.com/Mahdi-Soleimani/content-repurposing",
      },
    ],
    flow: [
      { name: "منبع", detail: "متن / صوت / ویدیو / لینک" },
      { name: "حقیقت", detail: "PostgreSQL" },
      { name: "فایل", detail: "MinIO" },
      { name: "قالب‌ها", detail: "سایت، تلگرام، اسلاید، استوری" },
    ],
  },
  {
    slug: "citycenter-vision",
    index: "04",
    title: "نمای بالا، سیتی‌سنتر",
    kicker: "بینایی ماشین صنعتی",
    metric: "۳۵° → ۹۰°",
    metricLabel: "اصلاح پرسپکتیو",
    year: "۱۴۰۴",
    role: "توسعه‌دهنده بینایی ماشین",
    summary:
      "برای شرکت کلان‌داده پویان نوین، جریان دوربین سیتی‌سنتر اصفهان به نقشه قابل اندازه‌گیری تبدیل شد.",
    problem:
      "دوربین امنیتی با زاویه حدود ۳۵ درجه، کالا را کش می‌دهد. بدون نمای قائم، ابعاد و چیدمان قابل مقایسه نیستند و انسان، دکور و کالا در یک فریم قاطی می‌شوند.",
    outcome:
      "در یک پروژه شصت‌روزه، تصویر به نمای بالای سر نگاشت شد، مقطع کالا به شکل‌های پایه درآمد و کالای قابل فروش از بقیه صحنه جدا شد.",
    points: [
      "تبدیل پرسپکتیو و هوموگرافی: تصویر مایل به Bird's-Eye View برای یکسان شدن مقیاس.",
      "مدل کردن مقطع کالا با دایره، بیضی، مستطیل و مثلث تا اشغال فضا قابل حساب شود.",
      "تفکیک کالای قابل فروش از انسان، دکور و تجهیزات.",
      "طبقه‌بندی کالاهای شناسایی‌شده، از جمله لوازم خانگی مثل ماشین لباسشویی و اسپیکر.",
    ],
    stack: ["Python", "OpenCV", "Homography", "Object Detection", "Classification"],
    links: [],
    flow: [
      { name: "دوربین", detail: "زاویه مایل" },
      { name: "هوموگرافی", detail: "نمای قائم" },
      { name: "هندسه", detail: "مقطع کالا" },
      { name: "کلاس", detail: "کالای قابل فروش" },
    ],
  },
  {
    slug: "vehicle-speed",
    index: "05",
    title: "تخمین سرعت خودرو",
    kicker: "بینایی ماشین",
    metric: "YOLOv8",
    metricLabel: "به‌همراه Norfair",
    year: "۱۴۰۳–۱۴۰۴",
    role: "پژوهش و پیاده‌سازی",
    summary:
      "شناسایی و ردیابی خودرو در ویدیو، و تخمین سرعت در همان جریان، با پایتون و PyTorch.",
    problem:
      "تشخیص تنها کافی نیست. برای سرعت، هر خودرو باید بین فریم‌ها همان خودرو بماند و جابه‌جایی‌اش به مقیاس واقعی نزدیک شود.",
    outcome:
      "پایپ‌لاین YOLOv8 برای تشخیص و Norfair برای ردیابی، روی OpenCV و PyTorch. کد روی گیت‌هاب است.",
    points: [
      "تشخیص خودرو با YOLOv8.",
      "ردیابی بین فریم‌ها با Norfair تا هویت هر وسیله حفظ شود.",
      "تخمین سرعت روی همان جریان ویدیو.",
    ],
    stack: ["Python", "PyTorch", "OpenCV", "YOLOv8", "Norfair"],
    links: [
      {
        label: "مخزن گیت‌هاب",
        href: "https://github.com/Mahdi-Soleimani/Vehicle-speed-estimation",
      },
    ],
    flow: [
      { name: "فریم", detail: "ورودی ویدیو" },
      { name: "YOLO", detail: "کادر خودرو" },
      { name: "Norfair", detail: "هویت در زمان" },
      { name: "سرعت", detail: "تخمین جابه‌جایی" },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug) ?? null;
}

export const stackGroups = [
  {
    title: "عامل و تصمیم",
    items: ["AI Agent", "LangChain", "Prompt Engineering", "مسیریاب چندمدلی", "API"],
  },
  {
    title: "ارکستراسیون",
    items: ["n8n", "Webhook", "REST", "Human-in-the-loop", "مدیریت خطا"],
  },
  {
    title: "داده",
    items: ["PostgreSQL", "MinIO"],
  },
  {
    title: "بینایی",
    items: ["Python", "OpenCV", "PyTorch", "YOLOv8", "Norfair", "Homography"],
  },
  {
    title: "وب و فروش",
    items: ["TypeScript", "وردپرس", "ووکامرس", "UI"],
  },
] as const;

export const certificates = [
  {
    title: "Python",
    by: "Kaggle",
    href: "https://www.kaggle.com/learn/certification/mahdisoleimani2003/python",
  },
  {
    title: "Supervised Learning with scikit-learn",
    by: "DataCamp",
    href: "https://www.datacamp.com/completed/statement-of-accomplishment/course/5da46b1e03dcb31fb152b85eeba7d65de19a8e32",
  },
  {
    title: "Unsupervised Learning in Python",
    by: "DataCamp",
    href: "https://www.datacamp.com/completed/statement-of-accomplishment/course/efa7f9c0616eb302d08f9a82d329f3d1274a0f3d",
  },
] as const;

export const awards = [
  "رتبه اول کشوری جشنواره فردا، نرم‌افزار موبایل، ۱۳۹۹",
  "رتبه اول استانی و شهرستانی همان رشته، برای اپ کنکور پایه دوازدهم",
  "رتبه سوم شهرستانی وب‌نوشت، در موضوع تکنولوژی",
] as const;

export const scopes = [
  "اتوماسیون فرایند",
  "ایجنت و مسیریاب مدل",
  "بینایی ماشین",
  "پلتفرم وب سه‌بعدی",
  "فروشگاه و وردپرس",
] as const;
