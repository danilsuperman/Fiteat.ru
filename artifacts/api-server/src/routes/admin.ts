import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { pool } from "@workspace/db";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "fitit-secret-key-2024";

export interface AdminJwtPayload {
  adminId: number;
  email: string;
  role: "admin" | "owner" | "seo";
  isAdmin: true;
}

function signAdminToken(payload: Omit<AdminJwtPayload, "isAdmin">): string {
  return jwt.sign({ ...payload, isAdmin: true }, JWT_SECRET, { expiresIn: "12h" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Требуется авторизация администратора" });
    return;
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as AdminJwtPayload;
    if (!payload.isAdmin) { res.status(403).json({ error: "Нет доступа" }); return; }
    (req as any).admin = payload;
    next();
  } catch {
    res.status(401).json({ error: "Токен недействителен" });
  }
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as any).admin as AdminJwtPayload;
    if (!roles.includes(admin.role)) {
      res.status(403).json({ error: "Недостаточно прав" });
      return;
    }
    next();
  };
}

// POST /admin/login
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ error: "Укажите email и пароль" }); return; }

    const result = await pool.query(
      "SELECT * FROM admin_users WHERE email = $1 LIMIT 1",
      [email]
    );
    const admin = result.rows[0];
    if (!admin) { res.status(401).json({ error: "Неверный email или пароль" }); return; }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) { res.status(401).json({ error: "Неверный email или пароль" }); return; }

    const token = signAdminToken({ adminId: admin.id, email: admin.email, role: admin.role });
    res.json({ token, role: admin.role, name: admin.name, email: admin.email });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /admin/stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [usersRes, plansRes, promoRes, articlesRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM plans"),
      pool.query("SELECT COUNT(*) FROM promo_codes WHERE is_active = true"),
      pool.query("SELECT COUNT(*) FROM articles"),
    ]);
    const [recentUsersRes, recentPlansRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'"),
      pool.query("SELECT COUNT(*) FROM plans WHERE created_at > NOW() - INTERVAL '7 days'"),
    ]);
    res.json({
      users: Number(usersRes.rows[0].count),
      plans: Number(plansRes.rows[0].count),
      activePromoCodes: Number(promoRes.rows[0].count),
      articles: Number(articlesRes.rows[0].count),
      newUsersWeek: Number(recentUsersRes.rows[0].count),
      newPlansWeek: Number(recentPlansRes.rows[0].count),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /admin/promo-codes
router.get("/admin/promo-codes", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM promo_codes ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /admin/promo-codes
router.post("/admin/promo-codes", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try {
    const { code, discountPercent, maxUses, expiresAt } = req.body;
    const admin = (req as any).admin as AdminJwtPayload;
    if (!code || !discountPercent) { res.status(400).json({ error: "Укажите код и скидку" }); return; }
    const result = await pool.query(
      "INSERT INTO promo_codes (code, discount_percent, max_uses, expires_at, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [code.toUpperCase(), Number(discountPercent), maxUses || null, expiresAt || null, admin.adminId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") { res.status(400).json({ error: "Такой промокод уже существует" }); return; }
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// DELETE /admin/promo-codes/:id
router.delete("/admin/promo-codes/:id", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try {
    await pool.query("DELETE FROM promo_codes WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// PATCH /admin/promo-codes/:id/toggle
router.patch("/admin/promo-codes/:id/toggle", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE promo_codes SET is_active = NOT is_active WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /admin/articles
router.get("/admin/articles", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM articles ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /admin/articles
router.post("/admin/articles", requireAdmin, async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, readTime, isPublished } = req.body;
    const admin = (req as any).admin as AdminJwtPayload;
    if (!title || !slug || !excerpt || !content || !category) {
      res.status(400).json({ error: "Заполните все обязательные поля" }); return;
    }
    const result = await pool.query(
      `INSERT INTO articles (title, slug, excerpt, content, category, read_time, is_published, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, slug, excerpt, content, category, readTime || "5 мин", isPublished !== false, admin.adminId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") { res.status(400).json({ error: "Статья с таким slug уже существует" }); return; }
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// PUT /admin/articles/:id
router.put("/admin/articles/:id", requireAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, category, readTime, isPublished } = req.body;
    const result = await pool.query(
      `UPDATE articles SET title=$1, excerpt=$2, content=$3, category=$4,
       read_time=$5, is_published=$6 WHERE id=$7 RETURNING *`,
      [title, excerpt, content, category, readTime || "5 мин", isPublished !== false, req.params.id]
    );
    if (!result.rows[0]) { res.status(404).json({ error: "Статья не найдена" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// DELETE /admin/articles/:id
router.delete("/admin/articles/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM articles WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
