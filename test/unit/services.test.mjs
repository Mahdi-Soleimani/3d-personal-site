import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function hashCredential(value, salt) {
  return crypto.pbkdf2Sync(value, salt, 100000, 32, "sha256").toString("hex");
}

test("Admin security: PBKDF2-SHA256 password hashing", async (t) => {
  await t.test("produces a 64-char hex string (32 bytes SHA-256)", () => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = hashCredential("admin", salt);
    assert.equal(typeof hash, "string");
    assert.equal(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  await t.test("is deterministic for identical password and salt", () => {
    const salt = "fixed_test_salt_1234567890abcdef";
    const hash1 = hashCredential("mySecurePassword", salt);
    const hash2 = hashCredential("mySecurePassword", salt);
    assert.equal(hash1, hash2);
  });

  await t.test("different salts produce different hashes for the same password", () => {
    const salt1 = crypto.randomBytes(16).toString("hex");
    const salt2 = crypto.randomBytes(16).toString("hex");
    const hash1 = hashCredential("admin", salt1);
    const hash2 = hashCredential("admin", salt2);
    assert.notEqual(hash1, hash2);
  });

  await t.test("different passwords produce different hashes with the same salt", () => {
    const salt = "common_salt_test_1234567890";
    const hash1 = hashCredential("admin", salt);
    const hash2 = hashCredential("admin2", salt);
    assert.notEqual(hash1, hash2);
  });
});

test("Consultation request validation logic", async (t) => {
  const validateConsultation = (data) => {
    if (!data || typeof data !== "object") return { valid: false, error: "Invalid payload" };
    const contactInfo = typeof data.contactInfo === "string" ? data.contactInfo.trim() : "";
    const message = typeof data.message === "string" ? data.message.trim() : "";
    const scope = typeof data.scope === "string" ? data.scope.trim() : "";

    if (!contactInfo || contactInfo.length < 3) {
      return { valid: false, error: "راه ارتباطی باید حداقل ۳ کاراکتر باشد." };
    }
    if (!message || message.length < 5) {
      return { valid: false, error: "شرح نیاز باید حداقل ۵ کاراکتر باشد." };
    }
    return { valid: true, sanitized: { contactInfo, message, scope: scope || "عمومی" } };
  };

  await t.test("valid payload passes successfully", () => {
    const result = validateConsultation({
      contactInfo: "09123456789",
      message: "نیاز به مشاوره هوش مصنوعی برای پروژه بانکی داریم.",
      scope: "اتوماسیون فرایند",
    });
    assert.equal(result.valid, true);
    assert.equal(result.sanitized.contactInfo, "09123456789");
    assert.equal(result.sanitized.scope, "اتوماسیون فرایند");
  });

  await t.test("rejects empty contact info", () => {
    const result = validateConsultation({
      contactInfo: "",
      message: "تست پیام",
    });
    assert.equal(result.valid, false);
    assert.match(result.error, /راه ارتباطی/);
  });

  await t.test("rejects short message", () => {
    const result = validateConsultation({
      contactInfo: "09123456789",
      message: "کم",
    });
    assert.equal(result.valid, false);
    assert.match(result.error, /شرح نیاز/);
  });
});

test("SEO & Robots stealth configuration", async (t) => {
  await t.test("public/robots.txt exists and disallows /admin", () => {
    const robotsPath = path.resolve(process.cwd(), "public/robots.txt");
    assert.ok(fs.existsSync(robotsPath), "robots.txt must exist");
    const content = fs.readFileSync(robotsPath, "utf8");
    assert.match(content, /Disallow:\s*\/admin/i);
    assert.match(content, /Disallow:\s*\/admin\//i);
  });

  await t.test("admin route contains noindex robots tags", () => {
    const adminRoutePath = path.resolve(process.cwd(), "src/routes/admin.tsx");
    assert.ok(fs.existsSync(adminRoutePath), "admin.tsx must exist");
    const content = fs.readFileSync(adminRoutePath, "utf8");
    assert.match(content, /name:\s*["']robots["'],\s*content:\s*["']noindex,\s*nofollow,\s*noarchive["']/i);
    assert.match(content, /name:\s*["']googlebot["'],\s*content:\s*["']noindex,\s*nofollow,\s*noarchive["']/i);
  });
});

test("Database migration schema integrity", async (t) => {
  await t.test("migration 0002 defines consultation_requests and admin_credentials", () => {
    const migPath = path.resolve(process.cwd(), "migrations/0002_consultation_admin.sql");
    assert.ok(fs.existsSync(migPath), "0002_consultation_admin.sql must exist");
    const sql = fs.readFileSync(migPath, "utf8");
    assert.match(sql, /CREATE TABLE IF NOT EXISTS consultation_requests/i);
    assert.match(sql, /CREATE TABLE IF NOT EXISTS admin_credentials/i);
    assert.match(sql, /CREATE TABLE IF NOT EXISTS admin_sessions/i);
    assert.match(sql, /username_hash\s+text\s+NOT\s+NULL/i);
    assert.match(sql, /password_hash\s+text\s+NOT\s+NULL/i);
    assert.match(sql, /salt\s+text\s+NOT\s+NULL/i);
  });
});
