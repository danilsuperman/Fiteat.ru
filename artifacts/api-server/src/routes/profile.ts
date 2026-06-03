import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, pool } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import type { Request } from "express";

const router = Router();

router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const user = (req as Request & { user: JwtPayload }).user;
    const { name, email } = req.body;
    if (!name && !email) { res.status(400).json({ error: "Нечего обновлять" }); return; }

    if (email) {
      const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (existing.length > 0 && existing[0].id !== user.userId) {
        res.status(400).json({ error: "Email уже занят" }); return;
      }
    }

    const sets: string[] = [];
    const vals: any[] = [];
    let i = 1;
    if (name) { sets.push(`name=$${i++}`); vals.push(name.trim()); }
    if (email) { sets.push(`email=$${i++}`); vals.push(email.trim().toLowerCase()); }
    vals.push(user.userId);
    const result = await pool.query(
      `UPDATE users SET ${sets.join(",")} WHERE id=$${i} RETURNING id, name, email`,
      vals
    );
    res.json(result.rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/profile/password", requireAuth, async (req, res) => {
  try {
    const user = (req as Request & { user: JwtPayload }).user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) { res.status(400).json({ error: "Укажите текущий и новый пароль" }); return; }
    if (newPassword.length < 6) { res.status(400).json({ error: "Новый пароль должен быть минимум 6 символов" }); return; }

    const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.userId)).limit(1);
    if (!dbUser) { res.status(404).json({ error: "Пользователь не найден" }); return; }

    const valid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!valid) { res.status(400).json({ error: "Неверный текущий пароль" }); return; }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hash, user.userId]);
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/profile/payments", requireAuth, async (req, res) => {
  try {
    const user = (req as Request & { user: JwtPayload }).user;
    const result = await pool.query(
      `SELECT p.id, p.amount_kopecks, p.status, p.created_at, pp.name as package_name, pp.duration_days
       FROM payments p
       LEFT JOIN pricing_packages pp ON pp.id = p.package_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
