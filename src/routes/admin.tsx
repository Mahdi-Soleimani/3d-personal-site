import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Copy,
  Filter,
  Key,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  adminLogin,
  adminLogout,
  adminVerifySession,
  getConsultationRequests,
  updateAdminCredentials,
  updateConsultationStatus,
  deleteConsultationRequest,
  type ConsultationRequestRow,
} from "@/lib/admin-service";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow, noarchive" },
      { title: "مدیریت سیستم | پنل ادمین" },
    ],
  }),
});

function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [requests, setRequests] = useState<ConsultationRequestRow[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Notes editing state
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);

  // Settings Modal state
  const [showSettings, setShowSettings] = useState(false);
  const [curPassword, setCurPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsStatus, setSettingsStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  // On mount: check stored session
  useEffect(() => {
    const savedToken = localStorage.getItem("adm_token");
    if (!savedToken) {
      setCheckingAuth(false);
      return;
    }

    adminVerifySession({ data: { token: savedToken } })
      .then((res) => {
        if (res.valid) {
          setToken(savedToken);
        } else {
          localStorage.removeItem("adm_token");
        }
      })
      .catch(() => {
        localStorage.removeItem("adm_token");
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  // Fetch requests when authenticated or filters change
  const loadRequests = useCallback(async (activeToken: string) => {
    setIsLoadingRequests(true);
    try {
      const res = await getConsultationRequests({
        data: {
          token: activeToken,
          statusFilter: statusFilter !== "all" ? statusFilter : undefined,
          search: searchQuery.trim() || undefined,
        },
      });
      if (res.success) {
        setRequests(res.requests);
        // initialize notes
        const notesMap: Record<string, string> = {};
        res.requests.forEach((r) => {
          notesMap[r.id] = r.admin_notes || "";
        });
        setEditingNotes(notesMap);
      }
    } catch (err) {
      console.error("Load requests failed:", err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    if (token) {
      loadRequests(token);
    }
  }, [token, loadRequests]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await adminLogin({ data: { username, password } });
      if (res.success && res.token) {
        localStorage.setItem("adm_token", res.token);
        setToken(res.token);
      } else {
        setLoginError(res.message || "اطلاعات ورود نادرست است.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ارتباط با سرور.";
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await adminLogout({ data: { token } }).catch(() => {});
    }
    localStorage.removeItem("adm_token");
    setToken(null);
    setRequests([]);
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "new" | "in_progress" | "contacted" | "closed",
  ) => {
    if (!token) return;
    try {
      await updateConsultationStatus({
        data: {
          token,
          id,
          status: newStatus,
          adminNotes: editingNotes[id] ?? "",
        },
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleSaveNotes = async (id: string) => {
    if (!token) return;
    setSavingNotesId(id);
    const item = requests.find((r) => r.id === id);
    if (!item) return;

    try {
      await updateConsultationStatus({
        data: {
          token,
          id,
          status: item.status,
          adminNotes: editingNotes[id] ?? "",
        },
      });
    } catch (err) {
      console.error("Save notes error:", err);
    } finally {
      setSavingNotesId(null);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!token) return;
    if (!confirm("آیا از حذف این درخواست مشاوره مطمئن هستید؟")) return;

    try {
      const res = await deleteConsultationRequest({ data: { token, id } });
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete request error:", err);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSettingsStatus({ type: "loading" });
    try {
      const res = await updateAdminCredentials({
        data: {
          token,
          currentPassword: curPassword,
          newUsername,
          newPassword,
        },
      });

      if (res.success) {
        setSettingsStatus({
          type: "success",
          message: "نام کاربری و کلمه عبور با موفقیت به‌روزرسانی شدند.",
        });
        setCurPassword("");
        setNewUsername("");
        setNewPassword("");
        setTimeout(() => {
          setShowSettings(false);
          setSettingsStatus({ type: "idle" });
        }, 1800);
      } else {
        setSettingsStatus({
          type: "error",
          message: res.message || "خطا در ثبت تغییرات.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ارتباط با سرور.";
      setSettingsStatus({ type: "error", message: msg });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stats = {
    total: requests.length,
    new: requests.filter((r) => r.status === "new").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    contacted: requests.filter((r) => r.status === "contacted").length,
    closed: requests.filter((r) => r.status === "closed").length,
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg font-mono text-sm text-copper">
        <span className="animate-pulse">در حال بررسی احراز هویت...</span>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 text-fg" dir="rtl">
        {/* Subtle background grid */}
        <div className="stage-fallback pointer-events-none fixed inset-0 opacity-40" />

        <div className="relative z-10 w-full max-w-md">
          <div className="border-beam-card spotlight-card rounded-2xl border border-line bg-surface/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg border border-copper/40 bg-copper/10 text-copper">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">سامانه مدیریت</h1>
                  <p className="text-xs text-muted">احراز هویت دسترسی اختصاصی</p>
                </div>
              </div>
              <span className="telemetry-chip text-[10px]">NOINDEX</span>
            </div>

            {loginError && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted" htmlFor="admin-user">
                  نام کاربری
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="admin-user"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-copper"
                    placeholder="نام کاربری"
                  />
                  <User className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted" htmlFor="admin-pass">
                  کلمه عبور
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="admin-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-copper"
                    placeholder="کلمه عبور"
                  />
                  <Lock className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted" />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full min-h-11 justify-center rounded-lg bg-copper font-semibold text-bg hover:bg-copper/90"
                >
                  {isLoggingIn ? "در حال ورود..." : "ورود به سامانه"}
                </Button>
              </div>

              <p className="pt-2 text-center text-[11px] text-muted">
                اطلاعات عبور به صورت رمزنگاری‌شده در پایگاه داده اعتبارسنجی می‌شوند.
              </p>
            </form>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-copper transition">
              <ArrowRight className="size-3.5" />
              بازگشت به وب‌سایت اصلی
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-bg text-fg" dir="rtl">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-copper/40 bg-copper/10 text-copper">
              <Shield className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold">پنل مدیریت درخواست‌های مشاوره</h1>
                <span className="telemetry-chip text-[10px]">مخفی · NOINDEX</span>
              </div>
              <p className="text-xs text-muted">پیگیری و وضعیت‌دهی جلسات تخصصی</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-fg hover:border-copper hover:text-copper transition"
            >
              <Settings className="size-3.5" />
              <span>تنظیمات حساب</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-red-400 hover:border-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="size-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="spotlight-card rounded-xl border border-line p-4">
            <p className="font-mono text-xs text-muted">کل درخواست‌ها</p>
            <p className="mt-1 text-2xl font-bold font-mono text-fg">{stats.total}</p>
          </div>
          <div className="spotlight-card rounded-xl border border-line p-4">
            <p className="font-mono text-xs text-copper">در انتظار بررسی</p>
            <p className="mt-1 text-2xl font-bold font-mono text-copper">{stats.new}</p>
          </div>
          <div className="spotlight-card rounded-xl border border-line p-4">
            <p className="font-mono text-xs text-sky-400">در حال پیگیری</p>
            <p className="mt-1 text-2xl font-bold font-mono text-sky-400">{stats.in_progress}</p>
          </div>
          <div className="spotlight-card rounded-xl border border-line p-4">
            <p className="font-mono text-xs text-emerald-400">جلسه / تماس برقرار شد</p>
            <p className="mt-1 text-2xl font-bold font-mono text-emerald-400">{stats.contacted}</p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="mt-8 flex flex-col gap-3 rounded-xl border border-line bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && token) loadRequests(token);
                }}
                placeholder="جستجو در راه ارتباطی، متن پیام یا حوزه..."
                className="w-full rounded-lg border border-line bg-bg py-2 pr-9 pl-3 text-xs text-fg outline-none focus:border-copper"
              />
              <Search className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted" />
            </div>
            <button
              type="button"
              onClick={() => token && loadRequests(token)}
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted hover:border-copper hover:text-fg transition"
              title="اعمال جستجو"
            >
              <Search className="size-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <Filter className="size-3.5 text-muted" />
              <span className="text-muted">وضعیت:</span>
            </div>
            {[
              { id: "all", label: "همه" },
              { id: "new", label: "جدید" },
              { id: "in_progress", label: "پیگیری" },
              { id: "contacted", label: "تماس‌گرفته‌شده" },
              { id: "closed", label: "بایگانی" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  statusFilter === tab.id
                    ? "bg-copper text-bg font-bold"
                    : "border border-line bg-surface text-muted hover:border-copper/60 hover:text-fg"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => token && loadRequests(token)}
              disabled={isLoadingRequests}
              className="mr-1 inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-muted hover:border-copper hover:text-fg transition"
              title="به‌روزرسانی لیست"
            >
              <RefreshCw className={`size-3.5 ${isLoadingRequests ? "animate-spin text-copper" : ""}`} />
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="mt-6 space-y-4">
          {isLoadingRequests && requests.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-line bg-surface/30 font-mono text-sm text-copper">
              <span className="animate-pulse">در حال دریافت اطلاعات از پایگاه داده...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/20 p-8 text-center">
              <MessageSquare className="size-10 text-muted/50 mb-2" />
              <p className="text-sm font-semibold">هیچ درخواست مشاوره‌ای یافت نشد.</p>
              <p className="mt-1 text-xs text-muted">
                درخواست‌هایی که کاربران از فرم انتهای صفحه ثبت می‌کنند در این جدول ذخیره و نمایش داده خواهند شد.
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="spotlight-card rounded-2xl border border-line bg-surface/70 p-5 transition hover:border-copper/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/60 pb-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${
                        req.status === "new"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : req.status === "in_progress"
                            ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                            : req.status === "contacted"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-muted/15 text-muted border border-line"
                      }`}
                    >
                      {req.status === "new" && "● جدید / نیازمند اقدام"}
                      {req.status === "in_progress" && "● در حال پیگیری"}
                      {req.status === "contacted" && "✓ تماس برقرار شد"}
                      {req.status === "closed" && "بایگانی شده"}
                    </span>
                    <span className="rounded-md border border-line bg-bg px-2.5 py-1 font-mono text-xs text-copper">
                      {req.scope}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      کد: {req.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-muted">
                    <Clock className="size-3.5" />
                    <span>
                      {new Date(req.created_at).toLocaleDateString("fa-IR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Contact Info & Details */}
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                  <div>
                    <p className="text-xs font-semibold text-muted">راه ارتباطی متقاضی:</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-line/80 bg-bg px-3 py-2 font-mono text-sm text-fg">
                        {req.contact_info.includes("@") ? (
                          <Mail className="size-4 text-copper" />
                        ) : (
                          <Phone className="size-4 text-copper" />
                        )}
                        <span className="select-all">{req.contact_info}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(req.contact_info, req.id)}
                        className="rounded-lg border border-line bg-surface p-2 text-muted hover:border-copper hover:text-fg transition"
                        title="کپی راه ارتباطی"
                      >
                        {copiedId === req.id ? (
                          <Check className="size-4 text-emerald-400" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>
                    </div>

                    <p className="mt-4 text-xs font-semibold text-muted">شرح نیاز و مسئله پروژه:</p>
                    <div className="mt-1.5 rounded-lg border border-line/70 bg-bg/70 p-3.5 text-sm leading-relaxed text-fg whitespace-pre-wrap">
                      {req.message}
                    </div>
                  </div>

                  {/* Admin Followup & Actions */}
                  <div className="flex flex-col justify-between rounded-xl border border-line/70 bg-surface/40 p-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted" htmlFor={`notes-${req.id}`}>
                          یادداشت و نتیجه پیگیری:
                        </label>
                        {savingNotesId === req.id && (
                          <span className="font-mono text-[10px] text-copper animate-pulse">
                            در حال ذخیره...
                          </span>
                        )}
                      </div>
                      <textarea
                        id={`notes-${req.id}`}
                        rows={3}
                        value={editingNotes[req.id] ?? ""}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            [req.id]: e.target.value,
                          }))
                        }
                        placeholder="ثبت تاریخ جلسه، نتیجه مکالمه یا لینک پروژه..."
                        className="mt-1.5 w-full rounded-lg border border-line bg-bg p-2.5 text-xs text-fg outline-none focus:border-copper"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(req.id)}
                          className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-muted hover:border-copper hover:text-fg transition"
                        >
                          ذخیره یادداشت
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/50 pt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted">تغییر وضعیت:</span>
                        <select
                          value={req.status}
                          onChange={(e) =>
                            handleStatusChange(
                              req.id,
                              e.target.value as "new" | "in_progress" | "contacted" | "closed",
                            )
                          }
                          aria-label="تغییر وضعیت درخواست"
                          className="rounded-lg border border-line bg-bg px-2.5 py-1 text-xs text-fg outline-none focus:border-copper"
                        >
                          <option value="new">جدید (در انتظار)</option>
                          <option value="in_progress">در حال بررسی</option>
                          <option value="contacted">جلسه هماهنگ شد</option>
                          <option value="closed">بایگانی / خاتمه</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(req.id)}
                        className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition"
                        title="حذف دائمی درخواست"
                      >
                        <Trash2 className="size-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ACCOUNT SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" dir="rtl">
          <div className="border-beam-card spotlight-card w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Key className="size-5 text-copper" />
                <h3 className="font-bold text-base">تغییر نام کاربری و رمز عبور</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSettings(false);
                  setSettingsStatus({ type: "idle" });
                }}
                className="text-muted hover:text-fg text-sm"
              >
                ✕
              </button>
            </div>

            {settingsStatus.message && (
              <div
                className={`mt-4 rounded-lg p-3 text-xs flex items-center gap-2 ${
                  settingsStatus.type === "success"
                    ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border border-red-500/40 bg-red-500/10 text-red-400"
                }`}
              >
                {settingsStatus.type === "success" ? (
                  <Check className="size-4 shrink-0" />
                ) : (
                  <AlertCircle className="size-4 shrink-0" />
                )}
                <span>{settingsStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted" htmlFor="cur-pass">
                  کلمه عبور فعلی (جهت تأیید هویت)
                </label>
                <input
                  id="cur-pass"
                  type="password"
                  required
                  value={curPassword}
                  onChange={(e) => setCurPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-xs text-fg outline-none focus:border-copper"
                  placeholder="کلمه عبور فعلی"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted" htmlFor="new-user">
                  نام کاربری جدید
                </label>
                <input
                  id="new-user"
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-xs text-fg outline-none focus:border-copper"
                  placeholder="نام کاربری جدید (حداقل ۳ نویسه)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted" htmlFor="new-pass">
                  کلمه عبور جدید
                </label>
                <input
                  id="new-pass"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-xs text-fg outline-none focus:border-copper"
                  placeholder="کلمه عبور جدید (حداقل ۴ نویسه)"
                />
              </div>

              <div className="rounded-lg border border-copper/20 bg-copper/5 p-3 text-[11px] text-muted leading-relaxed">
                رمز و نام کاربری جدید شما به همراه سالت تصادفی مجزا با الگوریتم PBKDF2-SHA256 هش شده و در پایگاه داده ذخیره خواهند شد.
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowSettings(false);
                    setSettingsStatus({ type: "idle" });
                  }}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={settingsStatus.type === "loading"}
                  className="bg-copper text-bg font-semibold hover:bg-copper/90"
                >
                  {settingsStatus.type === "loading" ? "در حال ثبت..." : "ذخیره تغییرات"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
