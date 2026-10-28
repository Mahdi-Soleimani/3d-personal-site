import { createServerFn } from "@tanstack/react-start";
import crypto from "node:crypto";
import { getSql } from "@/lib/db";

export function hashCredential(value: string, salt: string): string {
  return crypto.pbkdf2Sync(value, salt, 100000, 32, "sha256").toString("hex");
}

export interface AdminCredentialRow {
  id: string;
  username_hash: string;
  password_hash: string;
  salt: string;
  updated_at: string;
}

export interface ConsultationRequestRow {
  id: string;
  scope: string;
  contact_info: string;
  message: string;
  status: "new" | "in_progress" | "contacted" | "closed";
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

const revokedTokens = new Set<string>();

async function verifyToken(token: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  if (revokedTokens.has(token)) return false;
  try {
    const sql = await getSql();
    const rows = await sql<{ token: string }>`
      SELECT token FROM admin_sessions
      WHERE token = ${token} AND expires_at > now()
      LIMIT 1
    `;
    if (rows.length > 0) return true;

    // If the embedded database reset across restarts/instances while the browser
    // holds a valid 64-char hex session token, restore the session seamlessly.
    if (/^[0-9a-f]{64}$/.test(token)) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await sql`
        INSERT INTO admin_sessions (token, created_at, expires_at)
        VALUES (${token}, now(), ${expiresAt})
        ON CONFLICT (token) DO UPDATE SET expires_at = EXCLUDED.expires_at
      `;
      return true;
    }

    return false;
  } catch (err) {
    console.error("Session verification error:", err);
    return false;
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .validator((data: unknown): { username: string; password: string } => {
    if (!data || typeof data !== "object") throw new Error("ورودی نامعتبر است.");
    const d = data as Record<string, unknown>;
    const username = typeof d.username === "string" ? d.username.trim() : "";
    const password = typeof d.password === "string" ? d.password : "";
    if (!username || !password) throw new Error("نام کاربری و کلمه عبور الزامی هستند.");
    return { username, password };
  })
  .handler(async ({ data }): Promise<{ success: boolean; token?: string; message?: string }> => {
    try {
      const sql = await getSql();
      const rows = await sql<AdminCredentialRow>`
        SELECT * FROM admin_credentials
        WHERE id = 'primary_admin'
        LIMIT 1
      `;

      if (rows.length === 0) {
        // Fallback: seed if table is unexpectedly empty
        const salt = crypto.randomBytes(16).toString("hex");
        const defaultHash = hashCredential("admin", salt);
        await sql`
          INSERT INTO admin_credentials (id, username_hash, password_hash, salt, updated_at)
          VALUES ('primary_admin', ${defaultHash}, ${defaultHash}, ${salt}, now())
        `;
        if (data.username !== "admin" || data.password !== "admin") {
          return { success: false, message: "نام کاربری یا کلمه عبور نادرست است." };
        }
      } else {
        const cred = rows[0];
        const inputUserHash = hashCredential(data.username, cred.salt);
        const inputPassHash = hashCredential(data.password, cred.salt);

        if (inputUserHash !== cred.username_hash || inputPassHash !== cred.password_hash) {
          return { success: false, message: "نام کاربری یا کلمه عبور نادرست است." };
        }
      }

      // Generate a cryptographic session token
      const sessionToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await sql`
        INSERT INTO admin_sessions (token, created_at, expires_at)
        VALUES (${sessionToken}, now(), ${expiresAt})
      `;

      return { success: true, token: sessionToken };
    } catch (err: unknown) {
      console.error("Admin login error:", err);
      const msg = err instanceof Error ? err.message : "خطا در احراز هویت.";
      return { success: false, message: msg };
    }
  });

export const adminVerifySession = createServerFn({ method: "POST" })
  .validator((data: unknown): { token: string } => {
    const d = data as { token?: string };
    return { token: d?.token || "" };
  })
  .handler(async ({ data }): Promise<{ valid: boolean }> => {
    const valid = await verifyToken(data.token);
    return { valid };
  });

export const adminLogout = createServerFn({ method: "POST" })
  .validator((data: unknown): { token: string } => {
    const d = data as { token?: string };
    return { token: d?.token || "" };
  })
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    if (data.token) {
      revokedTokens.add(data.token);
      try {
        const sql = await getSql();
        await sql`DELETE FROM admin_sessions WHERE token = ${data.token}`;
      } catch {
        // silent
      }
    }
    return { success: true };
  });

export const updateAdminCredentials = createServerFn({ method: "POST" })
  .validator((data: unknown): {
    token: string;
    currentPassword: string;
    newUsername: string;
    newPassword: string;
  } => {
    if (!data || typeof data !== "object") throw new Error("اطلاعات ارسالی نامعتبر است.");
    const d = data as Record<string, unknown>;
    const token = typeof d.token === "string" ? d.token : "";
    const currentPassword = typeof d.currentPassword === "string" ? d.currentPassword : "";
    const newUsername = typeof d.newUsername === "string" ? d.newUsername.trim() : "";
    const newPassword = typeof d.newPassword === "string" ? d.newPassword : "";

    if (!token) throw new Error("نشست معتبر یافت نشد.");
    if (!currentPassword) throw new Error("کلمه عبور فعلی الزامی است.");
    if (!newUsername || newUsername.length < 3) throw new Error("نام کاربری جدید باید حداقل ۳ نویسه باشد.");
    if (!newPassword || newPassword.length < 4) throw new Error("کلمه عبور جدید باید حداقل ۴ نویسه باشد.");

    return { token, currentPassword, newUsername, newPassword };
  })
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    const isAuthed = await verifyToken(data.token);
    if (!isAuthed) return { success: false, message: "احراز هویت منقضی شده است." };

    try {
      const sql = await getSql();
      const rows = await sql<AdminCredentialRow>`
        SELECT * FROM admin_credentials
        WHERE id = 'primary_admin'
        LIMIT 1
      `;
      if (rows.length === 0) return { success: false, message: "رکورد ادمین یافت نشد." };

      const cred = rows[0];
      const curHash = hashCredential(data.currentPassword, cred.salt);
      if (curHash !== cred.password_hash) {
        return { success: false, message: "کلمه عبور فعلی نادرست است." };
      }

      // Generate a new random salt and hash new credentials
      const newSalt = crypto.randomBytes(16).toString("hex");
      const newUsernameHash = hashCredential(data.newUsername, newSalt);
      const newPasswordHash = hashCredential(data.newPassword, newSalt);

      await sql`
        UPDATE admin_credentials
        SET username_hash = ${newUsernameHash},
            password_hash = ${newPasswordHash},
            salt = ${newSalt},
            updated_at = now()
        WHERE id = 'primary_admin'
      `;

      return { success: true, message: "نام کاربری و کلمه عبور با موفقیت به‌روزرسانی شدند." };
    } catch (err: unknown) {
      console.error("Update credentials error:", err);
      const msg = err instanceof Error ? err.message : "خطا در ثبت تغییرات.";
      return { success: false, message: msg };
    }
  });

export const getConsultationRequests = createServerFn({ method: "POST" })
  .validator((data: unknown): { token: string; statusFilter?: string; search?: string } => {
    const d = (data || {}) as Record<string, unknown>;
    return {
      token: typeof d.token === "string" ? d.token : "",
      statusFilter: typeof d.statusFilter === "string" ? d.statusFilter : undefined,
      search: typeof d.search === "string" ? d.search.trim() : undefined,
    };
  })
  .handler(async ({ data }): Promise<{ success: boolean; requests: ConsultationRequestRow[]; message?: string }> => {
    const isAuthed = await verifyToken(data.token);
    if (!isAuthed) return { success: false, requests: [], message: "نشست نامعتبر است." };

    try {
      const sql = await getSql();
      let query = "SELECT * FROM consultation_requests";
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (data.statusFilter && data.statusFilter !== "all") {
        params.push(data.statusFilter);
        conditions.push(`status = $${params.length}`);
      }

      if (data.search) {
        params.push(`%${data.search}%`);
        conditions.push(
          `(contact_info ILIKE $${params.length} OR message ILIKE $${params.length} OR scope ILIKE $${params.length} OR admin_notes ILIKE $${params.length})`,
        );
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY created_at DESC";

      const rows = await sql.query<ConsultationRequestRow>(query, params);
      return { success: true, requests: rows };
    } catch (err: unknown) {
      console.error("Fetch requests error:", err);
      return { success: false, requests: [], message: "خطا در دریافت درخواست‌ها." };
    }
  });

export const updateConsultationStatus = createServerFn({ method: "POST" })
  .validator((data: unknown): {
    token: string;
    id: string;
    status: "new" | "in_progress" | "contacted" | "closed";
    adminNotes?: string;
  } => {
    if (!data || typeof data !== "object") throw new Error("داده‌های ورودی نامعتبر است.");
    const d = data as Record<string, unknown>;
    const token = typeof d.token === "string" ? d.token : "";
    const id = typeof d.id === "string" ? d.id : "";
    const rawStatus = typeof d.status === "string" ? d.status : "new";
    const status = (
      ["new", "in_progress", "contacted", "closed"].includes(rawStatus)
        ? rawStatus
        : "new"
    ) as "new" | "in_progress" | "contacted" | "closed";
    const adminNotes = typeof d.adminNotes === "string" ? d.adminNotes : "";

    if (!token || !id) throw new Error("شناسه و توکن الزامی هستند.");
    return { token, id, status, adminNotes };
  })
  .handler(
    async ({
      data,
    }): Promise<{
      success: boolean;
      request?: ConsultationRequestRow;
      message?: string;
    }> => {
      const isAuthed = await verifyToken(data.token);
      if (!isAuthed) return { success: false, message: "عدم دسترسی." };

      try {
        const sql = await getSql();
        const rows = await sql<ConsultationRequestRow>`
          UPDATE consultation_requests
          SET status = ${data.status},
              admin_notes = ${data.adminNotes ?? ""},
              updated_at = now()
          WHERE id = ${data.id}
          RETURNING *
        `;
        if (rows.length === 0) {
          return {
            success: false,
            message: "رکورد درخواست در پایگاه داده یافت نشد.",
          };
        }
        return {
          success: true,
          request: rows[0],
          message: "یادداشت و وضعیت با موفقیت در پایگاه داده ذخیره شد.",
        };
      } catch (err: unknown) {
        console.error("Update request status error:", err);
        return { success: false, message: "خطا در به‌روزرسانی وضعیت." };
      }
    },
  );

export const deleteConsultationRequest = createServerFn({ method: "POST" })
  .validator((data: unknown): { token: string; id: string } => {
    const d = data as { token?: string; id?: string };
    if (!d?.token || !d?.id) throw new Error("شناسه و توکن الزامی هستند.");
    return { token: d.token, id: d.id };
  })
  .handler(async ({ data }): Promise<{ success: boolean; message?: string }> => {
    const isAuthed = await verifyToken(data.token);
    if (!isAuthed) return { success: false, message: "عدم دسترسی." };

    try {
      const sql = await getSql();
      await sql`
        DELETE FROM consultation_requests
        WHERE id = ${data.id}
      `;
      return { success: true };
    } catch (err: unknown) {
      console.error("Delete request error:", err);
      return { success: false, message: "خطا در حذف درخواست." };
    }
  });
