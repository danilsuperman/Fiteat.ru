import { Router } from "express";
import { pool } from "@workspace/db";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "fitit-secret-key-2024";

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) { res.status(401).json({ error: "Требуется авторизация" }); return; }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as any).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Токен недействителен" });
  }
}

router.get("/survey/extended", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const result = await pool.query(
      "SELECT answers FROM extended_surveys WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows[0]?.answers || {});
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/survey/extended", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const answers = req.body;
    await pool.query(
      `INSERT INTO extended_surveys (user_id, answers, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET answers = $2, updated_at = NOW()`,
      [userId, JSON.stringify(answers)]
    );
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
