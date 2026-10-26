import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { profile } from "@/data/profile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const links = [
  { hash: "work", label: "کارها" },
  { hash: "vision", label: "بینایی" },
  { hash: "method", label: "روش" },
  { hash: "about", label: "درباره" },
] as const;

export const chapters = [
  { hash: "horizon", label: "میدان" },
  { hash: "mandate", label: "مسئله" },
  { hash: "nova", label: "نوا" },
  { hash: "vision", label: "بینایی" },
  { hash: "river", label: "جریان" },
  { hash: "foundry", label: "ریخته‌گری" },
  { hash: "work", label: "کارها" },
  { hash: "method", label: "روش" },
  { hash: "about", label: "درباره" },
  { hash: "contact", label: "تماس" },
] as const;

export function SiteChrome() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [activeChapter, setActiveChapter] = useState<string>("horizon");
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const hash = useRouterState({ select: (state) => state.location.hash });
  const isHome = pathname === "/";

  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar) bar.style.transform = `scaleX(${p})`;
      setSolid(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    if (hash) {
      const cleanHash = hash.replace("#", "");
      if (chapters.some((c) => c.hash === cleanHash)) {
        setActiveChapter(cleanHash);
      }
    }
  }, [hash]);

  useEffect(() => {
    if (!isHome) return;

    const sectionIds = chapters.map((c) => c.hash);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const visibleRatios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleRatios.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleRatios.delete(entry.target.id);
          }
        }

        if (visibleRatios.size > 0) {
          let bestId = "";
          let maxRatio = -1;
          for (const [id, ratio] of visibleRatios.entries()) {
            if (ratio > maxRatio) {
              maxRatio = ratio;
              bestId = id;
            }
          }
          if (bestId) {
            setActiveChapter(bestId);
          }
        }
      },
      {
        rootMargin: "-15% 0px -40% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY < 80) {
        setActiveChapter("horizon");
      } else if (scrollY + windowHeight >= docHeight - 80) {
        setActiveChapter("contact");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHome]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <div
        id="scroll-progress"
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-right bg-copper"
        style={{ transform: "scaleX(0)" }}
      />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter] duration-200",
          solid || open ? "bg-bg/85 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" hash="horizon" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-copper font-mono text-xs text-copper">
              MS
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-extrabold">{profile.name}</span>
              <span className="block text-xs text-muted">{profile.role}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="اصلی">
            {links.map((item) => {
              const isActive = isHome && activeChapter === item.hash;
              return (
                <Link
                  key={item.hash}
                  to="/"
                  hash={item.hash}
                  className={cn(
                    "relative text-sm font-medium transition-colors duration-150",
                    isActive ? "text-copper font-bold" : "text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 inset-x-0 h-0.5 rounded-full bg-copper shadow-[0_0_6px_rgba(209,107,61,0.7)]" />
                  )}
                </Link>
              );
            })}
            <Button
              asChild
              className={cn(
                isHome && activeChapter === "contact"
                  ? "ring-2 ring-copper ring-offset-2 ring-offset-bg"
                  : "",
              )}
            >
              <Link to="/" hash="contact">
                جلسه ۳۰ دقیقه‌ای
              </Link>
            </Button>
          </nav>

          <button
            type="button"
            className="grid size-11 place-items-center border border-line lg:hidden"
            aria-expanded={open}
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-30 flex flex-col justify-end bg-bg px-6 pt-24 pb-10 lg:hidden">
          <nav className="flex flex-col gap-2" aria-label="موبایل">
            {isHome ? (
              chapters.map((item) => {
                const isActive = activeChapter === item.hash;
                return (
                  <Link
                    key={item.hash}
                    to="/"
                    hash={item.hash}
                    className={cn(
                      "flex items-center justify-between border-b border-line py-3 text-2xl font-extrabold transition-colors",
                      isActive ? "text-copper" : "text-fg",
                    )}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="size-2 rounded-full bg-copper shadow-[0_0_8px_rgba(209,107,61,0.9)]" />
                    )}
                  </Link>
                );
              })
            ) : (
              <>
                <Link
                  to="/"
                  hash="horizon"
                  className="border-b border-line py-3 text-2xl font-extrabold text-fg hover:text-copper"
                >
                  صفحه اصلی
                </Link>
                <Link
                  to="/"
                  hash="work"
                  className="border-b border-line py-3 text-2xl font-extrabold text-copper"
                >
                  همه کارها و پروژه‌ها
                </Link>
                <Link
                  to="/"
                  hash="contact"
                  className="border-b border-line py-3 text-2xl font-extrabold text-fg hover:text-copper"
                >
                  تماس و همکاری
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}

      {isHome && (
        <nav
          className="fixed top-24 bottom-24 left-3 z-30 hidden flex-col justify-center gap-1.5 lg:flex"
          aria-label="فصل‌ها"
        >
          {chapters.map((item, index) => {
            const isActive = activeChapter === item.hash;
            return (
              <Link
                key={item.hash}
                to="/"
                hash={item.hash}
                aria-current={isActive ? "page" : undefined}
                data-active={isActive ? "true" : undefined}
                data-chapter={item.hash}
                className={cn(
                  "group flex min-h-8 items-center gap-2 font-mono text-xs transition-colors duration-150",
                  isActive ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                <span
                  className={cn(
                    "relative flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "text-copper font-bold scale-110"
                      : "text-copper/60 group-hover:text-copper",
                  )}
                >
                  {isActive && (
                    <span className="absolute -right-2.5 h-3.5 w-0.5 rounded-full bg-copper shadow-[0_0_8px_rgba(209,107,61,0.8)]" />
                  )}
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200",
                    isActive
                      ? "max-w-40 opacity-100 font-semibold text-fg"
                      : "max-w-0 opacity-0 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:opacity-100 text-muted",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
