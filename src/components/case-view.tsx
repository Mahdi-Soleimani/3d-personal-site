import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getProject, profile, projects, type Project } from "@/data/profile";

function Flow({ project }: { project: Project }) {
  return (
    <ol className="mt-8 grid gap-3 md:grid-cols-4">
      {project.flow.map((node, index) => (
        <li key={node.name} className="border border-line bg-surface p-4">
          <p className="font-mono text-xs text-copper">0{index + 1}</p>
          <p className="mt-3 font-extrabold">{node.name}</p>
          <p className="mt-1 text-sm text-muted">{node.detail}</p>
        </li>
      ))}
    </ol>
  );
}

function VisionBench() {
  const [angle, setAngle] = useState(35);
  const tilt = 90 - angle;
  return (
    <div className="border border-line bg-surface p-4 md:p-6">
      <div className="flex items-end justify-between gap-4">
        <p className="font-mono text-xs text-copper">زاویه دوربین</p>
        <p className="font-mono text-2xl text-fg">{angle}°</p>
      </div>
      <label className="mt-3 block text-sm text-muted" htmlFor="angle">
        از مایل تا نمای بالا
      </label>
      <input
        id="angle"
        className="mt-2 w-full accent-copper"
        type="range"
        min={35}
        max={90}
        value={angle}
        onChange={(event) => setAngle(Number(event.target.value))}
      />
      <div className="mt-6 grid h-64 place-items-center" style={{ perspective: "900px" }}>
        <div
          className="grid h-48 w-56 grid-cols-3 place-items-center gap-3 border border-line bg-bg"
          style={{ transform: `rotateX(${tilt}deg)`, transformStyle: "preserve-3d" }}
        >
          <span className="size-8 rounded-full border border-copper" />
          <span className="h-6 w-10 border border-copper" />
          <span className="size-0 border-r-[14px] border-b-[24px] border-l-[14px] border-r-transparent border-b-copper border-l-transparent" />
          <span className="h-5 w-12 rounded-[50%] border border-copper" />
          <span className="size-7 border border-fg" />
          <span className="size-6 rounded-full border border-fg" />
        </div>
      </div>
    </div>
  );
}

function SpeedBench() {
  return (
    <div className="relative h-56 overflow-hidden border border-line bg-surface">
      <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
      <div className="absolute top-1/2 left-[12%] h-8 w-14 -translate-y-1/2 border border-copper bg-bg motion-safe:animate-[slide_3.6s_linear_infinite]" />
      <div className="absolute top-1/2 left-[48%] h-8 w-16 -translate-y-1/2 border border-fg bg-bg motion-safe:animate-[slide_5s_linear_infinite]" />
      <p className="absolute right-4 bottom-4 font-mono text-xs text-muted">YOLO کادر می‌سازد · Norfair هویت را نگه می‌دارد</p>
      <style>{`@keyframes slide { from { transform: translate3d(180%, -50%, 0); } to { transform: translate3d(-220%, -50%, 0); } }`}</style>
    </div>
  );
}

function OrbitBench() {
  const models = [
    { name: "GPT-4o", role: "تحلیل و استدلال", transform: "translate3d(105px, 0px, 0)" },
    { name: "Claude 3.5", role: "کدنویسی و نگارش", transform: "translate3d(-52px, 91px, 0)" },
    { name: "Gemini 1.5", role: "چندوجهی و سریع", transform: "translate3d(-52px, -91px, 0)" },
  ];
  const [selected, setSelected] = useState(1);
  const [routedCount, setRoutedCount] = useState(70000);

  return (
    <div className="border border-line bg-surface p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="font-mono text-xs text-copper">مسیریاب زنده مدل‌ها (Multi-LLM Router)</p>
          <p className="mt-1 text-xs text-muted">هدایت خودکار بر اساس نیت کاربر بدون نیاز به منوی دستی مدل‌ها</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          <span>تراکنش‌های هدایت‌شده:</span>
          <span className="font-bold text-copper">{routedCount.toLocaleString("fa-IR")}+</span>
        </div>
      </div>

      <div className="relative my-8 flex h-64 items-center justify-center overflow-hidden">
        {/* Orbital rotating ring */}
        <div className="absolute size-52 rounded-full border border-dashed border-copper/35 motion-safe:animate-[orbit_26s_linear_infinite]" />

        {/* Central Core: Nova */}
        <div className="z-10 flex flex-col items-center justify-center rounded-full border-2 border-copper bg-bg px-5 py-4 shadow-[0_0_30px_rgba(224,154,85,0.25)]">
          <span className="text-base font-extrabold text-fg">نوا</span>
          <span className="font-mono text-[10px] text-copper">هسته تصمیم‌گیر</span>
        </div>

        {/* Orbiting Satellites */}
        <div className="absolute inset-0 flex items-center justify-center motion-safe:animate-[orbit_22s_linear_infinite]">
          {models.map((item, idx) => {
            const isActive = selected === idx;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setSelected(idx);
                  setRoutedCount((c) => c + 1);
                }}
                className={`absolute flex flex-col items-center justify-center rounded-md border px-3 py-1.5 text-xs transition-all duration-200 motion-safe:animate-[counter-orbit_22s_linear_infinite] ${
                  isActive
                    ? "border-copper bg-copper text-bg shadow-[0_0_15px_rgba(224,154,85,0.4)]"
                    : "border-line bg-bg text-fg hover:border-copper/70"
                }`}
                style={{ transform: item.transform }}
                title={`انتخاب و هدایت به ${item.name}`}
              >
                <span className="font-mono font-bold">{item.name}</span>
                <span className="text-[10px] opacity-75">{item.role}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded border border-line/60 bg-bg/60 p-3 text-center text-xs text-muted">
        نیت فعال: <strong className="text-copper">{models[selected].role}</strong> ── مسیر به‌صورت خودکار به <strong className="text-fg">{models[selected].name}</strong> متصل شد.
      </div>
    </div>
  );
}

function HitlBench() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [logs, setLogs] = useState<string[]>([
    "استخراج ۱۲ پیام از ۳ کانال مبدأ با یوزربات پایتون",
    "ارکستراسیون در n8n: تولید پیش‌نویس با مدل زبانی",
  ]);

  const handleApprove = () => {
    setStatus("approved");
    setLogs((prev) => [
      ...prev,
      "تأیید انسان ثبت شد (HITL Verified)",
      "انتشار در کانال تلگرام مقصد انجام شد ✓",
      "لاگ تراکنش و دسترسی در PostgreSQL ذخیره شد",
    ]);
  };

  const handleReset = () => {
    setStatus("pending");
    setLogs([
      "استخراج ۱۲ پیام از ۳ کانال مبدأ با یوزربات پایتون",
      "ارکستراسیون در n8n: تولید پیش‌نویس با مدل زبانی",
    ]);
  };

  return (
    <div className="border border-line bg-surface p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="font-mono text-xs text-copper">ایستگاه تأیید انسان (HITL Station Simulator)</p>
          <p className="mt-1 text-xs text-muted">پیش‌نویس خودکار تا ایستگاه تأیید انسان می‌آید و بدون تأیید هرگز منتشر نمی‌شود</p>
        </div>
        <span
          className={`font-mono text-xs px-2.5 py-1 rounded border ${
            status === "approved"
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
              : status === "rejected"
              ? "border-rose-500/50 bg-rose-500/10 text-rose-400"
              : "border-copper/50 bg-copper/10 text-copper animate-pulse"
          }`}
        >
          {status === "approved" ? "منتشر شده ✓" : status === "rejected" ? "رد شده" : "در انتظار تأیید انسان"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded border border-line bg-bg p-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-mono text-copper">پیش‌نویس کانال مالی</span>
            <span>n8n + LLM</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-fg">
            «انس جهانی طلا در محدوده ۲٬۷۴۰ دلار تثبیت شد؛ انتشار گزارش اشتغال آمریکا نوسان ۳۰ دلاری را رقم زد. مقاومت بعدی در ۲٬۷۵۵ دلار پیش‌بینی می‌شود.»
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={status === "approved"}
              onClick={handleApprove}
              className="flex-1 rounded bg-copper px-3 py-2 text-xs font-bold text-bg transition hover:bg-copper/90 disabled:opacity-40"
            >
              تأیید و انتشار در مقصد
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded border border-line px-3 py-2 text-xs text-muted hover:border-copper hover:text-fg"
            >
              بازنشانی
            </button>
          </div>
        </div>

        <div className="rounded border border-line bg-bg/50 p-4 font-mono text-xs">
          <p className="text-copper">لاگ رویدادها (PostgreSQL Audit Log):</p>
          <ul className="mt-3 space-y-1.5 text-muted">
            {logs.map((log, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-copper">›</span>
                <span className={log.includes("✓") ? "text-emerald-400" : ""}>{log}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function FoundryBench() {
  const inputs = [
    { id: "video", label: "ویدیو مصاحبه", note: "ویدیو ۱۰ دقیقه‌ای MP4 در MinIO" },
    { id: "audio", label: "صوت گفتگو", note: "فایل صوتی ۴۵ دقیقه‌ای گفتگو" },
    { id: "doc", label: "مقاله مرجع", note: "یادداشت فنی و گزارش تخصصی" },
  ];

  const formats = [
    {
      id: "article",
      title: "مقاله سایت",
      badge: "طولانی / SEO",
      desc: "متن ساختاریافته وبلاگی با مقدمه، ۳ سرفصل اصلی H2، جمع‌بندی و متاتگ‌های سئو.",
    },
    {
      id: "telegram",
      title: "پست تلگرام",
      badge: "فشرده / بولت",
      desc: "خلاصه نکات کلیدی با لحن پویا، نکات برجسته بولت‌وار و هشتگ‌های موضوعی.",
    },
    {
      id: "slides",
      title: "اسلاید اینستاگرام",
      badge: "۵ اسلاید",
      desc: "اسلاید ۱ قلاب جذاب (Hook)، اسلایدهای ۲ تا ۴ انتقال محتوا، اسلاید ۵ دعوت به اقدام.",
    },
    {
      id: "story",
      title: "سناریوی استوری",
      badge: "۳ فریم",
      desc: "سناریوی سریع با قلاب تصویری ۳ ثانیه‌ای اول، باکس سوال و نظرسنجی تعاملی.",
    },
  ];

  const [activeInput, setActiveInput] = useState(inputs[0].id);
  const [activeFormat, setActiveFormat] = useState(formats[0].id);

  const selectedFormat = formats.find((f) => f.id === activeFormat) ?? formats[0];

  return (
    <div className="border border-line bg-surface p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="font-mono text-xs text-copper">شبیه‌ساز ریخته‌گری محتوا (۱ ورودی → ۴ قالب)</p>
          <p className="mt-1 text-xs text-muted">یک منبع حقیقت در پایگاه داده؛ تولید هم‌زمان نسخه‌های اختصاصی هر کانال</p>
        </div>
        <span className="font-mono text-xs text-copper">PostgreSQL + MinIO + Workers</span>
      </div>

      <div className="mt-4">
        <p className="text-xs text-muted font-mono">انتخاب ورودی خام:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {inputs.map((inItem) => (
            <button
              key={inItem.id}
              type="button"
              onClick={() => setActiveInput(inItem.id)}
              className={`rounded border px-3 py-1.5 text-xs transition ${
                activeInput === inItem.id
                  ? "border-copper bg-copper text-bg font-bold"
                  : "border-line bg-bg text-muted hover:text-fg"
              }`}
            >
              {inItem.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {formats.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFormat(f.id)}
            className={`flex flex-col items-start rounded border p-3 text-start transition ${
              activeFormat === f.id
                ? "border-copper bg-bg shadow-[0_0_15px_rgba(224,154,85,0.15)]"
                : "border-line bg-bg/50 opacity-70 hover:opacity-100"
            }`}
          >
            <span className="font-mono text-[10px] text-copper">{f.badge}</span>
            <span className="mt-1 text-sm font-extrabold text-fg">{f.title}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded border border-line bg-bg p-4">
        <div className="flex items-center justify-between text-xs text-muted border-b border-line pb-2">
          <span className="font-semibold text-fg">خروجی فرمت شده: {selectedFormat.title}</span>
          <span className="font-mono text-copper">تولید هم‌ریشه</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-fg">{selectedFormat.desc}</p>
        <p className="mt-2 text-xs text-muted">
          منبع داده ورودی: {inputs.find((i) => i.id === activeInput)?.note}
        </p>
      </div>
    </div>
  );
}

function diagramFor(slug: string) {
  if (slug === "citycenter-vision") return <VisionBench />;
  if (slug === "vehicle-speed") return <SpeedBench />;
  if (slug === "nova") return <OrbitBench />;
  if (slug === "telegram-finance") return <HitlBench />;
  if (slug === "content-foundry") return <FoundryBench />;
  return null;
}

export function CaseView({ slug }: { slug: string }) {
  const project = getProject(slug);
  if (!project) {
    return (
      <main className="px-5 pt-32 pb-20 md:px-16">
        <h1 className="text-title">این کار پیدا نشد.</h1>
        <Button className="mt-6" asChild>
          <Link to="/" hash="work">
            بازگشت به کارها
          </Link>
        </Button>
      </main>
    );
  }

  const index = projects.findIndex((item) => item.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <main className="bg-bg px-5 pt-28 pb-20 md:px-16">
      <article className="mx-auto max-w-5xl">
        <p className="font-mono text-xs text-copper">
          <Link to="/" hash="work" className="hover:text-fg">
            کارها
          </Link>
          <span className="px-2 text-muted">/</span>
          {project.index}
        </p>
        <p className="mt-6 font-mono text-xs text-muted">{project.kicker} · {project.year}</p>
        <h1 className="mt-2 max-w-4xl text-display">{project.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{project.summary}</p>
        <dl className="mt-8 flex flex-wrap gap-8 border-y border-line py-5">
          <div>
            <dt className="text-xs text-muted">نقش</dt>
            <dd className="font-semibold">{project.role}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{project.metricLabel}</dt>
            <dd className="font-mono text-xl text-copper">{project.metric}</dd>
          </div>
        </dl>

        <div className="mt-10">{diagramFor(project.slug) ?? <Flow project={project} />}</div>
        {diagramFor(project.slug) ? <Flow project={project} /> : null}

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="text-xl font-extrabold">مسئله</h2>
            <p className="mt-3 text-muted">{project.problem}</p>
          </section>
          <section>
            <h2 className="text-xl font-extrabold">آنچه ساخته شد</h2>
            <p className="mt-3 text-muted">{project.outcome}</p>
          </section>
        </div>

        <ul className="mt-10 space-y-3">
          {project.points.map((point) => (
            <li key={point} className="border-t border-line py-4 text-sm">
              {point}
            </li>
          ))}
        </ul>

        <ul className="mt-8 flex flex-wrap gap-2">
          {project.stack.map((item) => (
            <li key={item} className="border border-line px-3 py-1 font-mono text-xs text-muted">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {project.links.length > 0 ? (
            project.links.map((item) => (
              <Button key={item.href} variant="ghost" asChild>
                <a href={item.href} target="_blank" rel="noreferrer">
                  {item.label}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            ))
          ) : (
            <span className="inline-flex min-h-11 items-center border border-line bg-surface/60 px-4 font-mono text-xs text-muted">
              پروژه سازمانی و اختصاصی (عدم انتشار سورس)
            </span>
          )}
          <Button asChild>
            <Link to="/" hash="contact">
              جلسه برای مسئله مشابه
            </Link>
          </Button>
        </div>

        <Link
          to="/work/$slug"
          params={{ slug: next.slug }}
          className="mt-16 flex items-center justify-between border-t border-line py-6"
        >
          <span>
            <span className="block text-xs text-muted">کار بعدی</span>
            <span className="text-xl font-extrabold">{next.title}</span>
          </span>
          <ArrowLeft className="size-5 text-copper" />
        </Link>

        <footer className="mt-16 border-t border-line pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>{profile.name} · {profile.city}</p>
            <p className="font-mono text-xs text-copper">معمار راهکارهای هوشمند</p>
          </div>
        </footer>
      </article>
    </main>
  );
}
