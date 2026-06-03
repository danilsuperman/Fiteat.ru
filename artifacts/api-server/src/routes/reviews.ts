import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "./admin";
import type { JwtPayload } from "../middlewares/auth";
import type { Request } from "express";

const router = Router();
type AuthRequest = Request & { user: JwtPayload };

/* ─── Public: approved reviews ─── */
router.get("/reviews", async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query.limit)  || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const [rows, cnt] = await Promise.all([
      pool.query(
        `SELECT id, user_name, text, rating, photos, created_at
         FROM reviews WHERE status='approved'
         ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query("SELECT COUNT(*) FROM reviews WHERE status='approved'"),
    ]);
    res.json({ reviews: rows.rows, total: Number(cnt.rows[0].count) });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Auth: create review ─── */
router.post("/reviews", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthRequest).user.userId;
    const { text, rating, photos } = req.body;
    if (!text?.trim()) { res.status(400).json({ error: "Напишите текст отзыва" }); return; }
    if (!rating || rating < 1 || rating > 5) { res.status(400).json({ error: "Укажите оценку от 1 до 5" }); return; }

    const userRow = await pool.query("SELECT name FROM users WHERE id=$1", [userId]);
    const userName = userRow.rows[0]?.name || "Пользователь";
    const safePhotos = Array.isArray(photos) ? photos.slice(0, 4).filter((p: any) => typeof p === "string") : [];

    const r = await pool.query(
      `INSERT INTO reviews (user_id, user_name, text, rating, photos) VALUES ($1,$2,$3,$4,$5) RETURNING id, status, created_at`,
      [userId, userName, text.trim(), Number(rating), JSON.stringify(safePhotos)]
    );
    res.status(201).json({ ...r.rows[0], message: "Отзыв отправлен на модерацию" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Admin: list all reviews ─── */
router.get("/admin/reviews", requireAdmin, async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const where = status && ["pending","approved","rejected"].includes(status) ? `WHERE r.status='${status}'` : "";
    const rows = await pool.query(
      `SELECT r.*, u.email as user_email
       FROM reviews r LEFT JOIN users u ON r.user_id=u.id
       ${where} ORDER BY r.created_at DESC LIMIT 500`
    );
    res.json(rows.rows);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Admin: approve / reject ─── */
router.patch("/admin/reviews/:id", requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!["approved","rejected"].includes(status)) { res.status(400).json({ error: "Некорректный статус" }); return; }
    const r = await pool.query(
      `UPDATE reviews SET status=$1, admin_note=$2 WHERE id=$3 RETURNING *`,
      [status, adminNote || null, req.params.id]
    );
    if (!r.rows[0]) { res.status(404).json({ error: "Не найдено" }); return; }
    res.json(r.rows[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Admin: delete ─── */
router.delete("/admin/reviews/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM reviews WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

export default router;
