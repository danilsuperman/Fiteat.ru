import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import type { Request } from "express";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "Укажите email, пароль и имя" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Пользователь с таким email уже существует" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({ email, password: hashedPassword, name }).returning();
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt.toISOString() },
      token,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Укажите email и пароль" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }
    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt.toISOString() },
      token,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Выход выполнен" });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const user = (req as Request & { user: JwtPayload }).user;
    const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.userId)).limit(1);
    if (!dbUser) {
      res.status(401).json({ error: "Пользователь не найден" });
      return;
    }
    res.json({ id: dbUser.id, email: dbUser.email, name: dbUser.name, createdAt: dbUser.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
