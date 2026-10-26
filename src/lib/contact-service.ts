import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export interface ContactPayload {
  scope: string;
  contactInfo: string;
  message: string;
}

export interface ContactResult {
  success: boolean;
  message: string;
  id?: string;
}

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator((data: unknown): ContactPayload => {
    if (!data || typeof data !== "object") {
      throw new Error("داده‌های ورودی نامعتبر است.");
    }
    const d = data as Record<string, unknown>;
    const scope = typeof d.scope === "string" && d.scope.trim() ? d.scope.trim() : "مشاوره عمومی";
    const contactInfo = typeof d.contactInfo === "string" ? d.contactInfo.trim() : "";
    const message = typeof d.message === "string" ? d.message.trim() : "";

    if (!contactInfo) {
      throw new Error("لطفاً یک راه ارتباطی (ایمیل، شماره تماس یا آیدی تلگرام/بله) وارد کنید.");
    }
    if (!message) {
      throw new Error("لطفاً شرح مسئله یا گلوگاه پروژه خود را بنویسید.");
    }

    return { scope, contactInfo, message };
  })
  .handler(async ({ data }): Promise<ContactResult> => {
    const id = `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const timestamp = new Date().toISOString();

    console.log(`[Contact Submission] ${id}`, {
      timestamp,
      scope: data.scope,
      contactInfo: data.contactInfo,
      message: data.message,
    });

    // Save persistently to database
    try {
      const sql = await getSql();
      await sql`
        INSERT INTO consultation_requests (id, scope, contact_info, message, status, admin_notes, created_at, updated_at)
        VALUES (${id}, ${data.scope}, ${data.contactInfo}, ${data.message}, 'new', '', now(), now())
      `;
    } catch (dbErr) {
      console.error("[Contact Database Error]", dbErr);
    }

    // Optional webhook forwarding (e.g. to n8n, Bale bot, Telegram bot)
    const webhookUrl = process.env.CONTACT_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            timestamp,
            scope: data.scope,
            contactInfo: data.contactInfo,
            message: data.message,
            source: "3D Personal Brand Portfolio",
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch (err) {
        console.warn(`[Contact Webhook Notice] Webhook dispatch bypassed:`, err);
      }
    }

    return {
      success: true,
      message: "پیام شما با موفقیت دریافت شد. تا حداکثر ۲۴ ساعت آینده جهت هماهنگی جلسه با شما ارتباط گرفته خواهد شد.",
      id,
    };
  });
