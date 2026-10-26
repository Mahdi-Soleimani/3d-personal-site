import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, Copy, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Observatory } from "@/components/observatory";
import { Button } from "@/components/ui/button";
import {
  awards,
  certificates,
  profile,
  projects,
  scopes,
  stackGroups,
} from "@/data/profile";
import { submitContactMessage } from "@/lib/contact-service";
import { film, subscribeFilm } from "@/lib/film";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: profile.name,
      alternateName: profile.latin,
      jobTitle: "AI Solutions Architect",
      email: profile.email,
      telephone: `+98${profile.phone.slice(1)}`,
      address: { "@type": "PostalAddress", addressLocality: "Najafabad", addressRegion: "Isfahan", addressCountry: "IR" },
      alumniOf: { "@type": "CollegeOrUniversity", name: "دانشگاه اصفهان" },
      knowsAbout: ["AI Agents", "n8n", "Computer Vision", "LangChain", "PostgreSQL"],
      sameAs: [profile.github, profile.linkedin, profile.studio],
    },
  ],
};

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal, .portrait-mask");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach((node) => node.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0 },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);
}

function useSpotlight() {
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const cards = document.querySelectorAll<HTMLElement>(".spotlight-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (
          e.clientX >= rect.left - 150 &&
          e.clientX <= rect.right + 150 &&
          e.clientY >= rect.top - 150 &&
          e.clientY <= rect.bottom + 150
        ) {
          card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        }
      });
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);
}

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        const start = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - start) / 1200);
          const eased = 1 - (1 - k) ** 3;
          setValue(Math.round(to * eased));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString("fa-IR")}
    </span>
  );
}

const riverSteps = [
  { name: "مبدأ", text: "یوزربات پایتون کانال‌های مالی را می‌خواند. انسان این مرحله را نمی‌بیند." },
  { name: "ارکستراسیون", text: "n8n جریان را مستند و قابل بازپخش نگه می‌دارد؛ خطا جایی برای گم شدن ندارد." },
  { name: "انسان", text: "پیش‌نویس اینجا می‌ایستد. بدون تأیید، چیزی به کانال مقصد نمی‌رسد." },
  { name: "مقصد", text: "بعد از تأیید، انتشار انجام می‌شود و کاربر، دسترسی و خطا در PostgreSQL می‌ماند." },
];

const outputs = [
  { name: "مقاله سایت", note: "نسخه بلند" },
  { name: "تلگرام", note: "نسخه کانال" },
  { name: "اسلاید", note: "اینستاگرام" },
  { name: "استوری", note: "سناریو" },
];

export function HomeFilm() {
  useReveal();
  useSpotlight();
  const cards = useRef<Array<HTMLDivElement | null>>([]);
  const spreadLabel = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState(2);
  const [scope, setScope] = useState<(typeof scopes)[number]>(scopes[0]);
  const [contactInfo, setContactInfo] = useState("");
  const [message, setMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const [confirmationId, setConfirmationId] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const drag = useRef<{ x: number; yaw: number } | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField((cur) => (cur === field ? null : cur)), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedField(field);
      setTimeout(() => setCopiedField((cur) => (cur === field ? null : cur)), 2500);
    }
  };

  const handleDirectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contactInfo.trim()) {
      setContactError("لطفاً یک راه ارتباطی (ایمیل، شماره تماس یا آیدی پیام‌رسان) وارد کنید.");
      return;
    }
    if (!message.trim()) {
      setContactError("لطفاً شرح مسئله یا گلوگاه پروژه خود را بنویسید.");
      return;
    }

    setContactStatus("submitting");
    setContactError("");

    try {
      const res = await submitContactMessage({
        data: {
          scope,
          contactInfo: contactInfo.trim(),
          message: message.trim(),
        },
      });

      if (res.success) {
        setContactStatus("success");
        setConfirmationId(res.id || "");
      } else {
        setContactStatus("error");
        setContactError(res.message || "خطا در ثبت پیام. لطفاً دوباره تلاش کنید.");
      }
    } catch (err: unknown) {
      setContactStatus("error");
      const msg = err instanceof Error ? err.message : "خطا در برقراری ارتباط با سرور.";
      setContactError(msg);
    }
  };

  useEffect(() => {
    return subscribeFilm((locals) => {
      const p = 0.35 + 0.65 * (locals.foundry ?? 0);
      if (spreadLabel.current) spreadLabel.current.textContent = `${Math.round(p * 100)}`;
      cards.current.forEach((el, index) => {
        if (!el) return;
        const offset = index - 1.5;
        el.style.transform = `translate3d(${offset * 46 * p}px, ${Math.abs(offset) * -10 * p}px, 0) rotate(${offset * 8 * p}deg)`;
      });
    });
  }, []);

  useEffect(() => {
    const rows = document.querySelectorAll<HTMLElement>(".work-row");
    const onMove = (event: PointerEvent) => {
      const row = (event.currentTarget as HTMLElement);
      const rect = row.getBoundingClientRect();
      row.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      row.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    rows.forEach((row) => row.addEventListener("pointermove", onMove));
    return () => rows.forEach((row) => row.removeEventListener("pointermove", onMove));
  }, []);

  useEffect(() => {
    const methodEl = document.getElementById("method");
    if (!methodEl) return;

    let docTop = 0;
    let height = 0;

    const measure = () => {
      const rect = methodEl.getBoundingClientRect();
      docTop = rect.top + (window.scrollY || 0);
      height = rect.height;
    };
    measure();

    const onScroll = () => {
      const scrollY = window.scrollY || 0;
      const vh = window.innerHeight;
      const start = vh * 0.6;
      const total = height * 0.7;
      const topInView = docTop - scrollY;
      const progress = total > 0 ? Math.min(1, Math.max(0, (start - topInView) / total)) : 0;
      methodEl.style.setProperty("--sp", progress.toFixed(3));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const mail = `mailto:${profile.email}?subject=${encodeURIComponent(`درخواست جلسه ۳۰ دقیقه‌ای — ${scope}`)}&body=${encodeURIComponent(`سلام مهدی،\n\nحوزه: ${scope}\n\nراه ارتباطی من: ${contactInfo || "..."}\n\n${message || "مایل به یک جلسه ۳۰ دقیقه‌ای هستم."}\n`)}`;

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="stage-fallback pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
      <Observatory />

      {/* 21st.dev Style Fixed Spatial HUD Bar */}
      <aside aria-label="3D Telemetry" className="fixed bottom-5 left-5 z-40 hidden md:flex items-center gap-3 rounded-full border border-line/80 bg-surface/85 px-4 py-2 text-xs font-mono backdrop-blur-md shadow-2xl">
        <span className="size-2 rounded-full bg-copper animate-pulse" />
        <span className="font-semibold text-fg tracking-wide" id="sector-live">01 افق</span>
        <span className="h-3 w-px bg-line" />
        <span className="text-muted text-[11px] uppercase tracking-wider">CHOREOGRAPHY ACTIVE</span>
      </aside>

      <div className="relative z-10">
        <section id="horizon" data-local className="relative z-0 min-h-[175vh]">
          <div className="sticky top-0 flex h-svh flex-col justify-end">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-bg via-bg/70 to-transparent" />
            <div className="relative px-5 pb-14 md:px-16">
              <p className="mb-4 font-mono text-xs tracking-widest text-copper">AI SOLUTIONS ARCHITECT</p>
              <h1 className="max-w-4xl text-display">
                کار را به سیستم بسپارید.
                <span className="mt-1 block text-copper">تصمیم را نگه دارید.</span>
              </h1>
              <p className="mt-5 max-w-xl text-muted">
                مهدی سلیمانی. اتوماسیون، ایجنت زبانی و بینایی ماشین را از نجف‌آباد طراحی و اجرا می‌کنم؛ یک جریان پاسخ‌گو، نه یک دسته ابزار پراکنده.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/" hash="contact">
                    رزرو جلسه ۳۰ دقیقه‌ای
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/" hash="work">
                    دیدن کارها
                  </Link>
                </Button>
              </div>
              <p className="mt-8 flex items-center gap-3 text-xs text-muted">
                <span className="scroll-cue inline-block h-10 w-px bg-copper" />
                اسکرول کنید. دوربین این صفحه واقعاً حرکت می‌کند.
              </p>
            </div>
          </div>
        </section>

        <section id="mandate" className="relative z-10 bg-gradient-to-b from-transparent via-bg/80 to-bg px-5 py-24 md:px-16 backdrop-blur-[2px]">
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-xs text-copper">02 — مسئله</p>
            <h2 className="mt-3 max-w-3xl text-title">ابزار زیاد، سیستم کم.</h2>
            <p className="mt-4 max-w-2xl text-muted">
              مدل، بات، فایل و کانال معمولاً کنار هم هستند بدون اینکه به هم جواب بدهند. کار من بستن این فاصله است: ورودی، تصمیم، تأیید انسان، خروجی، و رد خطا.
            </p>
            <ol className="mt-12 grid gap-4">
              {[
                ["01", "ورودی نامرتب", "پیام، PDF، صوت، یا فریم دوربین. همان چیزی که امروز دستی جابه‌جا می‌شود."],
                ["02", "تصمیم قابل توضیح", "مسیریاب مدل، قاعده، و جایی که انسان باید بله یا نه بگوید."],
                ["03", "خروجی در کانال خودش", "تلگرام، سایت، فروشگاه یا گزارش. هر کدام قالب خودش را می‌گیرد."],
              ].map(([n, title, body]) => (
                <li key={n} className="reveal spotlight-card rounded-xl border border-line/70 p-6 backdrop-blur-sm grid gap-3 md:grid-cols-[6rem_1fr]">
                  <span className="font-mono text-sm text-copper font-bold">{n}</span>
                  <div>
                    <h3 className="text-xl font-extrabold">{title}</h3>
                    <p className="mt-1 text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="nova" data-local className="relative z-0 min-h-[165vh]">
          <div className="sticky top-0 flex h-svh flex-col justify-end">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-bg via-bg/65 to-transparent" />
            <div className="relative grid items-end gap-8 px-5 pb-16 md:px-16 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="font-mono text-xs text-copper">03 — اکوسیستم نوا · بله</p>
                <h2 className="mt-3 max-w-xl text-title">یک دستیار. چند مدل. یک تصمیم‌گیر.</h2>
                <p className="mt-4 max-w-xl text-muted">
                  کاربر مدل انتخاب نمی‌کند. نوا نیت را می‌خواند و بین ChatGPT، Claude، Gemini و تصویرسازها مسیر را عوض می‌کند. پرداخت و کارت هدیه در مسیر عادی بدون صف انسانی تأیید می‌شود.
                </p>
                <Button variant="quiet" className="mt-5" asChild>
                  <Link to="/work/$slug" params={{ slug: "nova" }}>
                    معماری نوا
                    <ArrowLeft className="size-4" />
                  </Link>
                </Button>
              </div>
              <div className="reveal border-beam-card spotlight-card rounded-2xl border border-line/80 bg-surface/70 p-6 backdrop-blur-md">
                <p className="font-mono text-xs text-muted">کاربر فعال</p>
                <p className="text-display text-copper">
                  <CountUp to={70000} />
                  <span className="text-title">+</span>
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {["ChatGPT", "Claude", "Gemini"].map((name) => (
                    <li key={name} className="border border-line bg-bg/70 px-3 py-2 font-mono text-xs">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="vision" data-local className="relative z-0 min-h-[190vh]">
          <div className="sticky top-0 flex h-svh flex-col px-5 pt-24 pb-5 md:px-16">
            <div className="max-w-xl bg-bg/80 p-5 backdrop-blur-sm">
              <p className="font-mono text-xs text-copper">04 — سیتی‌سنتر اصفهان</p>
              <h2 className="mt-2 text-title">دوربین مایل، نقشه از بالا.</h2>
              <p className="mt-3 text-sm text-muted">
                همان کاری که برای دوربین‌های مجتمع انجام شد: زاویه حدود ۳۵ درجه باید به نمای قائم برسد تا کالا قابل اندازه‌گیری شود. اینجا اسکرول، دوربین را می‌خواباند. کشیدن، میدان را می‌چرخاند.
              </p>
            </div>
            <div
              className="finder mt-4 flex min-h-48 flex-1 cursor-grab touch-none flex-col justify-between p-4 active:cursor-grabbing"
              tabIndex={0}
              role="application"
              aria-label="چرخش میدان سه‌بعدی"
              onPointerDown={(event) => {
                try {
                  event.currentTarget.setPointerCapture(event.pointerId);
                } catch {
                  /* pointer capture unsupported */
                }
                drag.current = { x: event.clientX, yaw: film.yaw };
              }}
              onPointerMove={(event) => {
                if (!drag.current) return;
                film.yaw = drag.current.yaw + (event.clientX - drag.current.x) * 0.007;
              }}
              onPointerUp={(event) => {
                try {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                } catch {
                  /* pointer capture unsupported */
                }
                drag.current = null;
              }}
              onPointerCancel={(event) => {
                try {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                } catch {
                  /* pointer capture unsupported */
                }
                drag.current = null;
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") film.yaw -= 0.12;
                if (event.key === "ArrowRight") film.yaw += 0.12;
              }}
            >
              <p className="max-w-xs text-xs text-fg">بکشید یا جهت‌نما را بزنید. دایره، مستطیل و مثلث، مقطع کالا هستند.</p>
              <dl className="flex flex-wrap gap-6 font-mono text-xs">
                <div>
                  <dt className="text-muted">افت دوربین</dt>
                  <dd id="dep-live" className="text-lg text-copper">—</dd>
                </div>
                <div>
                  <dt className="text-muted">میدان دید</dt>
                  <dd id="fov-live" className="text-lg text-fg">—</dd>
                </div>
                <div>
                  <dt className="text-muted">سمت</dt>
                  <dd id="head-live" className="text-lg text-fg">—</dd>
                </div>
                <div>
                  <dt className="text-muted">خمیدگی فضایی</dt>
                  <dd id="roll-live" className="text-lg text-copper">0°</dd>
                </div>
              </dl>
            </div>
            <Button variant="quiet" className="mt-3 self-start" asChild>
              <Link to="/work/$slug" params={{ slug: "citycenter-vision" }}>
                جزئیات پروژه بینایی
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="river" data-local className="relative z-0 min-h-[170vh]">
          <div className="sticky top-0 flex h-svh flex-col justify-end">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-bg via-bg/75 to-transparent" />
            <div className="relative mx-auto grid max-w-5xl gap-10 px-5 pb-16 md:px-16 lg:grid-cols-[0.9fr_1.1fr] w-full items-end">
              <div>
                <p className="font-mono text-xs text-copper">05 — محتوای مالی</p>
                <h2 className="mt-3 text-title">ماشین می‌نویسد. انسان منتشر می‌کند.</h2>
                <p className="mt-4 text-muted">
                  برای کانال مالی، خودکارِ کامل خطرناک است و دستیِ کامل دیر. جریان تا ایستگاه تأیید می‌رود و آنجا می‌ایستد.
                </p>
                <svg viewBox="0 0 360 70" className="mt-8 w-full text-copper" aria-hidden="true">
                  <path d="M8 36 H352" className="dash-flow" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  {[20, 130, 230, 340].map((x) => (
                    <circle key={x} cx={x} cy="36" r="5" fill="currentColor" />
                  ))}
                </svg>
              </div>
              <div className="reveal spotlight-card rounded-2xl border border-line/80 bg-surface/75 p-6 backdrop-blur-md">
                <div className="flex flex-wrap gap-2" role="tablist" aria-label="مراحل جریان">
                  {riverSteps.map((item, index) => (
                    <button
                      key={item.name}
                      type="button"
                      role="tab"
                      aria-selected={step === index}
                      className={`min-h-11 border px-4 text-sm font-semibold transition-colors ${step === index ? "border-copper bg-copper text-bg" : "border-line text-muted hover:border-copper/60 hover:text-fg"}`}
                      onClick={() => setStep(index)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
                <p className="mt-6 min-h-24 text-lg">{riverSteps[step].text}</p>
                <Button variant="quiet" asChild>
                  <Link to="/work/$slug" params={{ slug: "telegram-finance" }}>
                    دیدن کل جریان
                    <ArrowLeft className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="foundry" data-local className="relative z-0 min-h-[160vh]">
          <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden px-5 md:px-16">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-bg via-bg/60 to-transparent" />
            <div className="relative z-10">
              <p className="font-mono text-xs text-copper">
                06 — ریخته‌گری محتوا · <span ref={spreadLabel}>35</span>٪
              </p>
              <h2 className="mt-3 max-w-3xl text-title">یک منبع، چهار قالب.</h2>
              <p className="mt-3 max-w-xl text-muted">اسکرول، خروجی‌ها را از هم باز می‌کند. منبع یکی است: متن، صوت، ویدیو یا لینک.</p>
              <div className="relative mt-12 h-56">
                {outputs.map((item, index) => (
                  <div
                    key={item.name}
                    ref={(node) => {
                      cards.current[index] = node;
                    }}
                    className="absolute top-6 left-1/2 w-40 -translate-x-1/2 border border-line bg-surface/90 backdrop-blur-md p-4 shadow-none"
                  >
                    <p className="font-mono text-xs text-copper">0{index + 1}</p>
                    <p className="mt-3 font-extrabold">{item.name}</p>
                    <p className="text-sm text-muted">{item.note}</p>
                  </div>
                ))}
              </div>
              <Button variant="quiet" className="self-start" asChild>
                <Link to="/work/$slug" params={{ slug: "content-foundry" }}>
                  معماری ریخته‌گری
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="work" className="relative z-10 bg-gradient-to-b from-transparent via-bg/90 to-bg px-5 py-24 md:px-16">
          <div className="mx-auto max-w-5xl">
            <p className="font-mono text-xs text-copper">07 — کارها</p>
            <h2 className="mt-3 text-title">ساخته شده، نه پیشنهاد اسلاید.</h2>
            <div className="mt-10">
              {projects.map((project) => (
                <Link
                  key={project.slug}
                  to="/work/$slug"
                  params={{ slug: project.slug }}
                  className="work-row group relative grid gap-3 border-t border-line py-7 md:grid-cols-[5rem_1fr_auto] md:items-end"
                >
                  <span className="font-mono text-sm text-copper">{project.index}</span>
                  <span>
                    <span className="block text-xs text-muted">{project.kicker}</span>
                    <span className="mt-1 block text-2xl font-extrabold tracking-tight">{project.title}</span>
                    <span className="mt-1 block max-w-xl text-sm text-muted">{project.summary}</span>
                  </span>
                  <span className="font-mono text-sm text-fg md:text-end">
                    {project.metric}
                    <span className="mt-1 block text-xs text-muted">{project.metricLabel}</span>
                  </span>
                </Link>
              ))}
              <div className="border-t border-line" />
            </div>
          </div>
        </section>

        <section id="method" data-local className="relative z-10 bg-gradient-to-b from-bg/95 via-bg/80 to-bg px-5 py-24 md:px-16 backdrop-blur-[2px]">
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[12rem_1fr]">
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 right-3 w-px bg-line" />
              <div
                className="absolute top-0 right-3 w-px bg-copper transition-[height] duration-75 ease-out"
                style={{ height: "calc(var(--sp, 0) * 100%)" }}
              />
            </div>
            <div>
              <p className="font-mono text-xs text-copper">08 — روش</p>
              <h2 className="mt-3 text-title">چهار قدم، یک مسئول.</h2>
              <ol className="mt-8">
                {[
                  ["شنیدن گلوگاه", "قبل از ابزار، مشخص می‌کنیم کدام کار واقعاً وقت را می‌خورد و کجا خطا گران است."],
                  ["معماری جریان", "ورودی، تصمیم، ایستگاه انسان و خروجی روی کاغذ بسته می‌شود. اگر این نقشه غلط باشد، اتوماسیون فقط خطا را سریع‌تر می‌کند."],
                  ["ساخت و اتصال", "n8n، پایتون، مدل یا بینایی؛ هر کدام فقط اگر در نقشه جا داشته باشد."],
                  ["تحویل با رد خطا", "لاگ، دسترسی و مسیر برگشت. سیستم بدون ردپا، سیستم نیست."],
                ].map(([title, body], index) => (
                  <li key={title} className="border-t border-line py-6">
                    <p className="font-mono text-xs text-copper">0{index + 1}</p>
                    <h3 className="mt-2 text-xl font-extrabold">{title}</h3>
                    <p className="mt-2 max-w-2xl text-muted">{body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="about" className="relative z-10 bg-bg px-5 py-24 md:px-16">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-start">
            <figure className="overflow-hidden">
              <img
                src="/portrait.jpg"
                alt="مهدی سلیمانی"
                width={460}
                height={460}
                className="portrait-mask aspect-[4/5] w-full object-cover object-top"
              />
              <figcaption className="mt-3 flex items-center justify-between font-mono text-xs text-muted">
                <span>{profile.city}</span>
                <span>{profile.latin}</span>
              </figcaption>
            </figure>
            <div>
              <p className="font-mono text-xs text-copper">09 — درباره</p>
              <h2 className="mt-3 text-title">{profile.name}</h2>
              <p className="mt-4 text-muted">
                کارشناسی مهندسی کامپیوتر، گرایش هوش مصنوعی، دانشگاه اصفهان، از ۱۴۰۰ تا ۱۴۰۴. کارشناسی هوش مصنوعی در شرکت کلان‌داده پویان نوین (آناگاو) روی پردازش تصویر سیتی‌سنتر و تجارت الکترونیک. نقش من در سیستم همان نقش ناظر است: ماشین پیشنهاد می‌دهد، انسان جایی که لازم است تأیید می‌کند.
              </p>
              <p className="mt-4 text-muted">
                رنگ این صفحه از همین تخصص آمده. مس، فلز رسانش و ساخت است. ابسیدین، تمرکز. آبیِ درخشانِ ابزارهای گفتگو، این کار را توضیح نمی‌دهد.
              </p>
              <ul className="mt-8 space-y-2 text-sm">
                {awards.map((award) => (
                  <li key={award} className="border-t border-line py-3">{award}</li>
                ))}
              </ul>
              <ul className="mt-6 space-y-2">
                {certificates.map((item) => (
                  <li key={item.href}>
                    <a className="inline-flex min-h-11 items-center gap-2 text-sm text-copper" href={item.href} target="_blank" rel="noreferrer">
                      {item.title}
                      <span className="text-muted">· {item.by}</span>
                      <ArrowUpRight className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
            {stackGroups.map((group) => (
              <div key={group.title} className="border-t border-line pt-4">
                <h3 className="text-sm font-extrabold">{group.title}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="border border-line px-3 py-1 font-mono text-xs text-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="relative z-10 bg-bg px-5 py-24 md:px-16">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs text-copper">10 — تماس</p>
              <h2 className="mt-3 text-title">مسئله را بگویید.</h2>
              <p className="mt-4 text-muted">
                در سی دقیقه معلوم می‌شود اتوماسیون، ایجنت یا بینایی ماشین به کارتان می‌آید یا نه. خروجی جلسه: امکان، معماری پیشنهادی، و ترتیب اجرا.
              </p>
              <ul className="mt-8 space-y-2 text-sm">
                <li className="flex items-center justify-between gap-2 border-b border-line/40 pb-2">
                  <a className="inline-flex min-h-11 items-center hover:text-copper transition-colors" href={`mailto:${profile.email}`}>
                    {profile.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(profile.email, "email")}
                    className="inline-flex items-center gap-1.5 border border-line bg-surface px-2.5 py-1 text-xs text-muted hover:border-copper hover:text-fg transition-all"
                    title="کپی آدرس ایمیل"
                  >
                    {copiedField === "email" ? (
                      <>
                        <Check className="size-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-mono">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>کپی ایمیل</span>
                      </>
                    )}
                  </button>
                </li>
                <li className="flex items-center justify-between gap-2 border-b border-line/40 pb-2">
                  <a className="inline-flex min-h-11 items-center hover:text-copper transition-colors" href={`tel:+98${profile.phone.slice(1)}`}>
                    {profile.phoneDisplay}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(profile.phoneDisplay, "phone")}
                    className="inline-flex items-center gap-1.5 border border-line bg-surface px-2.5 py-1 text-xs text-muted hover:border-copper hover:text-fg transition-all"
                    title="کپی شماره تماس"
                  >
                    {copiedField === "phone" ? (
                      <>
                        <Check className="size-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-mono">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>کپی شماره</span>
                      </>
                    )}
                  </button>
                </li>
                <li><a className="inline-flex min-h-11 items-center gap-2 hover:text-copper transition-colors" href={profile.linkedin} target="_blank" rel="noreferrer">لینکدین <ArrowUpRight className="size-4" /></a></li>
                <li><a className="inline-flex min-h-11 items-center gap-2 hover:text-copper transition-colors" href={profile.github} target="_blank" rel="noreferrer">گیت‌هاب <ArrowUpRight className="size-4" /></a></li>
                <li><a className="inline-flex min-h-11 items-center gap-2 hover:text-copper transition-colors" href={profile.studio} target="_blank" rel="noreferrer">{profile.studioName} <ArrowUpRight className="size-4" /></a></li>
              </ul>
            </div>
            {contactStatus === "success" ? (
              <div className="border border-copper/50 bg-surface p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-500">
                    <Check className="size-5" />
                    <span className="font-bold text-base">پیام شما با موفقیت ثبت شد</span>
                  </div>
                  <p className="mt-3 text-sm text-fg leading-relaxed">
                    اطلاعات درخواست جلسه برای مهدی سلیمانی ارسال گردید. تا حداکثر ۲۴ ساعت آینده جهت هماهنگی ۳۰ دقیقه زمان جلسه با شما تماس گرفته خواهد شد.
                  </p>
                  <div className="mt-4 rounded border border-line/60 bg-bg p-3 font-mono text-xs text-muted">
                    <span>کد پیگیری درخواست: </span>
                    <span className="text-copper font-bold">{confirmationId}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-line flex flex-wrap items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setContactStatus("idle");
                      setMessage("");
                    }}
                  >
                    ارسال پیام دیگر
                  </Button>
                  <Button variant="ghost" asChild>
                    <a href={mail} target="_blank" rel="noreferrer">
                      همگام‌سازی با ایمیل <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <form
                className="border-beam-card spotlight-card rounded-2xl border border-line/80 bg-surface/90 p-6 md:p-8 backdrop-blur-md"
                onSubmit={handleDirectSubmit}
              >
                <p className="text-sm font-semibold">حوزه کار</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {scopes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`min-h-11 border px-3 text-sm transition-colors ${scope === item ? "border-copper bg-copper text-bg font-medium" : "border-line text-muted hover:border-copper/60 hover:text-fg"}`}
                      onClick={() => setScope(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <label className="mt-5 block text-sm font-semibold" htmlFor="contactInfo">
                  راه ارتباطی شما <span className="text-copper">*</span>
                </label>
                <input
                  id="contactInfo"
                  type="text"
                  required
                  value={contactInfo}
                  onChange={(event) => setContactInfo(event.target.value)}
                  placeholder="ایمیل، شماره تماس یا آیدی تلگرام/بله"
                  className="mt-2 w-full border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-copper"
                />

                <label className="mt-4 block text-sm font-semibold" htmlFor="lead">
                  شرح مسئله یا گلوگاه <span className="text-copper">*</span>
                </label>
                <textarea
                  id="lead"
                  rows={4}
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="مثلاً تأیید تراکنش مالی، پایپ‌لاین تولید محتوا، یا تحلیل دوربین فروشگاه."
                  className="mt-2 w-full resize-y border border-line bg-bg px-3 py-3 text-sm text-fg outline-none focus:border-copper"
                />

                {contactError ? (
                  <p className="mt-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-800/50 p-2.5 rounded">
                    {contactError}
                  </p>
                ) : null}

                <div className="mt-5 space-y-2">
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    type="submit"
                    disabled={contactStatus === "submitting"}
                  >
                    {contactStatus === "submitting" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>در حال ارسال پیام...</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        <span>ارسال مستقیم پیام به مهدی</span>
                      </>
                    )}
                  </Button>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted">
                    <span>ترجیح می‌دهید از نرم‌افزار ایمیل استفاده کنید؟</span>
                    <a
                      href={mail}
                      className="inline-flex items-center gap-1 text-copper hover:underline"
                    >
                      ارسال با کلاینت ایمیل (mailto)
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>

        <footer className="border-t border-line bg-bg px-5 py-8 md:px-16">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>{profile.name} · {profile.city}</p>
            <p className="font-mono text-xs">مس روی ابسیدین</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
