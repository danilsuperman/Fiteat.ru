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

/* ─── Login ─── */
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ error: "Укажите email и пароль" }); return; }
    const result = await pool.query("SELECT * FROM admin_users WHERE email = $1 LIMIT 1", [email]);
    const admin = result.rows[0];
    if (!admin) { res.status(401).json({ error: "Неверный email или пароль" }); return; }
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) { res.status(401).json({ error: "Неверный email или пароль" }); return; }
    const token = signAdminToken({ adminId: admin.id, email: admin.email, role: admin.role });
    res.json({ token, role: admin.role, name: admin.name, email: admin.email });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Stats (legacy) ─── */
router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [u, pl, pr, ar, nu, np] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM plans"),
      pool.query("SELECT COUNT(*) FROM promo_codes WHERE is_active = true"),
      pool.query("SELECT COUNT(*) FROM articles"),
      pool.query("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'"),
      pool.query("SELECT COUNT(*) FROM plans WHERE created_at > NOW() - INTERVAL '7 days'"),
    ]);
    res.json({
      users: Number(u.rows[0].count),
      plans: Number(pl.rows[0].count),
      activePromoCodes: Number(pr.rows[0].count),
      articles: Number(ar.rows[0].count),
      newUsersWeek: Number(nu.rows[0].count),
      newPlansWeek: Number(np.rows[0].count),
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Analytics ─── */
router.get("/admin/analytics", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try {
    const fromDate = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const toDate   = req.query.to   ? new Date(req.query.to   as string) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const [
      usersTotal,
      usersNew,
      usersActive,
      plansTotal,
      plansPeriod,
      plansToday,
      plansMonth,
      revTotal,
      revPeriod,
      revByPkg,
      convReg,
      repeatBuy,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM users WHERE created_at >= $1 AND created_at <= $2", [fromDate, toDate]),
      pool.query("SELECT COUNT(*) FROM users WHERE subscription_expires_at > NOW()"),
      pool.query("SELECT COUNT(*) FROM plans"),
      pool.query("SELECT COUNT(*) FROM plans WHERE created_at >= $1 AND created_at <= $2", [fromDate, toDate]),
      pool.query("SELECT COUNT(*) FROM plans WHERE created_at >= CURRENT_DATE"),
      pool.query("SELECT COUNT(*) FROM plans WHERE created_at >= DATE_TRUNC('month', NOW())"),
      pool.query("SELECT COALESCE(SUM(amount_kopecks),0) as rev, COUNT(*) as cnt, COALESCE(AVG(amount_kopecks),0) as avg FROM payments WHERE status='success'"),
      pool.query("SELECT COALESCE(SUM(amount_kopecks),0) as rev, COUNT(*) as cnt FROM payments WHERE status='success' AND created_at>=$1 AND created_at<=$2", [fromDate, toDate]),
      pool.query(`
        SELECT pp.name, COUNT(p.id) as count, COALESCE(SUM(p.amount_kopecks),0) as revenue
        FROM payments p LEFT JOIN pricing_packages pp ON p.package_id=pp.id
        WHERE p.status='success' AND p.created_at>=$1 AND p.created_at<=$2
        GROUP BY pp.name ORDER BY revenue DESC
      `, [fromDate, toDate]),
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE created_at>=$1 AND created_at<=$2) as registrations,
          (SELECT COUNT(DISTINCT user_id) FROM payments WHERE status='success' AND created_at>=$1 AND created_at<=$2) as purchasers
      `, [fromDate, toDate]),
      pool.query(`
        SELECT
          COUNT(DISTINCT user_id) as first_buyers,
          COUNT(DISTINCT CASE WHEN pay_count>=2 THEN user_id END) as repeat_buyers
        FROM (SELECT user_id, COUNT(*) as pay_count FROM payments WHERE status='success' GROUP BY user_id) s
      `),
    ]);

    const totalUsers = Number(usersTotal.rows[0].count);
    const totalRev = Number(revTotal.rows[0].rev);
    const ltv = totalUsers > 0 ? Math.round(totalRev / totalUsers) : 0;
    const reg = Number(convReg.rows[0].registrations);
    const pur = Number(convReg.rows[0].purchasers);
    const firstB = Number(repeatBuy.rows[0].first_buyers);
    const repeatB = Number(repeatBuy.rows[0].repeat_buyers);

    res.json({
      period: { from: fromDate, to: toDate },
      users: {
        total: totalUsers,
        new: Number(usersNew.rows[0].count),
        active: Number(usersActive.rows[0].count),
      },
      plans: {
        total: Number(plansTotal.rows[0].count),
        period: Number(plansPeriod.rows[0].count),
        today: Number(plansToday.rows[0].count),
        month: Number(plansMonth.rows[0].count),
      },
      revenue: {
        total: Math.round(Number(revTotal.rows[0].rev) / 100),
        period: Math.round(Number(revPeriod.rows[0].rev) / 100),
        count: Number(revPeriod.rows[0].cnt),
        avgCheck: Math.round(Number(revTotal.rows[0].avg) / 100),
        ltv: Math.round(ltv / 100),
        byPackage: revByPkg.rows.map(r => ({ name: r.name || "Без пакета", count: Number(r.count), revenue: Math.round(Number(r.revenue) / 100) })),
      },
      conversion: {
        regToPurchase: reg > 0 ? Math.round((pur / reg) * 100) : 0,
        repeatPurchase: firstB > 0 ? Math.round((repeatB / firstB) * 100) : 0,
        registrations: reg,
        purchasers: pur,
        firstBuyers: firstB,
        repeatBuyers: repeatB,
      },
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Users ─── */
router.get("/admin/users", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try {
    const search = `%${req.query.search || ""}%`;
    const limit  = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.created_at, u.last_login_at,
             u.subscription_expires_at, u.discount_percent, u.notes,
             COUNT(DISTINCT pl.id) as plan_count,
             COALESCE(SUM(pay.amount_kopecks),0) as total_paid_kopecks
      FROM users u
      LEFT JOIN plans pl ON pl.user_id = u.id
      LEFT JOIN payments pay ON pay.user_id = u.id AND pay.status='success'
      WHERE u.name ILIKE $1 OR u.email ILIKE $1
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $2 OFFSET $3
    `, [search, limit, offset]);
    const total = await pool.query("SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1", [search]);
    res.json({ users: result.rows, total: Number(total.rows[0].count) });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

router.patch("/admin/users/:id", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try {
    const { discountPercent, notes, subscriptionDays } = req.body;
    const id = req.params.id;
    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;
    if (discountPercent !== undefined) { sets.push(`discount_percent=$${i++}`); vals.push(Number(discountPercent)); }
    if (notes !== undefined) { sets.push(`notes=$${i++}`); vals.push(notes); }
    if (subscriptionDays !== undefined) {
      sets.push(`subscription_expires_at = GREATEST(COALESCE(subscription_expires_at, NOW()), NOW()) + ($${i++} * INTERVAL '1 day')`);
      vals.push(Number(subscriptionDays));
    }
    if (sets.length === 0) { res.status(400).json({ error: "Нечего обновлять" }); return; }
    vals.push(id);
    const result = await pool.query(`UPDATE users SET ${sets.join(",")} WHERE id=$${i} RETURNING id,name,email,discount_percent,notes,subscription_expires_at`, vals);
    if (!result.rows[0]) { res.status(404).json({ error: "Пользователь не найден" }); return; }
    res.json(result.rows[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

router.delete("/admin/users/:id", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Promo Codes ─── */
router.get("/admin/promo-codes", requireAdmin, async (req, res) => {
  try { res.json((await pool.query("SELECT * FROM promo_codes ORDER BY created_at DESC")).rows); }
  catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

router.post("/admin/promo-codes", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try {
    const { code, discountPercent, maxUses, expiresAt } = req.body;
    const admin = (req as any).admin as AdminJwtPayload;
    if (!code || !discountPercent) { res.status(400).json({ error: "Укажите код и скидку" }); return; }
    const result = await pool.query(
      "INSERT INTO promo_codes (code,discount_percent,max_uses,expires_at,created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [code.toUpperCase(), Number(discountPercent), maxUses || null, expiresAt || null, admin.adminId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") { res.status(400).json({ error: "Такой промокод уже существует" }); return; }
    req.log.error(err); res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.delete("/admin/promo-codes/:id", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try { await pool.query("DELETE FROM promo_codes WHERE id=$1", [req.params.id]); res.json({ success: true }); }
  catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

router.patch("/admin/promo-codes/:id/toggle", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try { res.json((await pool.query("UPDATE promo_codes SET is_active=NOT is_active WHERE id=$1 RETURNING *", [req.params.id])).rows[0]); }
  catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Articles ─── */
router.get("/admin/articles", requireAdmin, async (req, res) => {
  try { res.json((await pool.query("SELECT * FROM articles ORDER BY created_at DESC")).rows); }
  catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

router.post("/admin/articles", requireAdmin, async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, readTime, isPublished } = req.body;
    const admin = (req as any).admin as AdminJwtPayload;
    if (!title || !slug || !excerpt || !content || !category) { res.status(400).json({ error: "Заполните все поля" }); return; }
    const result = await pool.query(
      "INSERT INTO articles (title,slug,excerpt,content,category,read_time,is_published,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [title, slug, excerpt, content, category, readTime || "5 мин", isPublished !== false, admin.adminId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") { res.status(400).json({ error: "Статья с таким slug уже существует" }); return; }
    req.log.error(err); res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.put("/admin/articles/:id", requireAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, category, readTime, isPublished } = req.body;
    const result = await pool.query(
      "UPDATE articles SET title=$1,excerpt=$2,content=$3,category=$4,read_time=$5,is_published=$6 WHERE id=$7 RETURNING *",
      [title, excerpt, content, category, readTime || "5 мин", isPublished !== false, req.params.id]
    );
    if (!result.rows[0]) { res.status(404).json({ error: "Не найдено" }); return; }
    res.json(result.rows[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

router.delete("/admin/articles/:id", requireAdmin, async (req, res) => {
  try { await pool.query("DELETE FROM articles WHERE id=$1", [req.params.id]); res.json({ success: true }); }
  catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Pricing Packages ─── */
router.get("/admin/pricing", requireAdmin, async (req, res) => {
  try { res.json((await pool.query("SELECT * FROM pricing_packages ORDER BY sort_order, id")).rows); }
  catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

router.post("/admin/pricing", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try {
    const { name, description, priceRubles, features, durationDays, isActive, sortOrder } = req.body;
    if (!name || priceRubles === undefined) { res.status(400).json({ error: "Укажите название и цену" }); return; }
    const result = await pool.query(
      "INSERT INTO pricing_packages (name,description,price_kopecks,features,duration_days,is_active,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [name, description || "", Math.round(Number(priceRubles) * 100), features || [], Number(durationDays) || 30, isActive !== false, Number(sortOrder) || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

router.put("/admin/pricing/:id", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try {
    const { name, description, priceRubles, features, durationDays, isActive, sortOrder } = req.body;
    const result = await pool.query(
      "UPDATE pricing_packages SET name=$1,description=$2,price_kopecks=$3,features=$4,duration_days=$5,is_active=$6,sort_order=$7 WHERE id=$8 RETURNING *",
      [name, description || "", Math.round(Number(priceRubles) * 100), features || [], Number(durationDays) || 30, isActive !== false, Number(sortOrder) || 0, req.params.id]
    );
    if (!result.rows[0]) { res.status(404).json({ error: "Не найдено" }); return; }
    res.json(result.rows[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

router.delete("/admin/pricing/:id", requireAdmin, requireRole("admin", "owner"), async (req, res) => {
  try { await pool.query("DELETE FROM pricing_packages WHERE id=$1", [req.params.id]); res.json({ success: true }); }
  catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

export default router;
