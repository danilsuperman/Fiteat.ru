import { Router } from "express";
import { db, progressEntriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import type { Request } from "express";

const router = Router();
type AuthRequest = Request & { user: JwtPayload };

router.get("/progress", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const entries = await db
      .select()
      .from(progressEntriesTable)
      .where(eq(progressEntriesTable.userId, authReq.user.userId))
      .orderBy(desc(progressEntriesTable.date));
    res.json(entries.map(e => ({
      id: e.id,
      date: e.date,
      weight: e.weight,
      waistCm: e.waistCm,
      neckCm: e.neckCm,
      chestCm: e.chestCm,
      hipsCm: e.hipsCm,
      notes: e.notes,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка получения данных прогресса" });
  }
});

router.post("/progress", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { date, weight, waistCm, neckCm, chestCm, hipsCm, notes } = req.body;
    if (!date) {
      res.status(400).json({ error: "Дата обязательна" });
      return;
    }
    const [entry] = await db.insert(progressEntriesTable).values({
      userId: authReq.user.userId,
      date,
      weight: weight ? Number(weight) : null,
      waistCm: waistCm ? Number(waistCm) : null,
      neckCm: neckCm ? Number(neckCm) : null,
      chestCm: chestCm ? Number(chestCm) : null,
      hipsCm: hipsCm ? Number(hipsCm) : null,
      notes: notes || null,
    }).returning();
    res.status(201).json({
      id: entry.id, date: entry.date, weight: entry.weight,
      waistCm: entry.waistCm, neckCm: entry.neckCm, chestCm: entry.chestCm,
      hipsCm: entry.hipsCm, notes: entry.notes,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сохранения прогресса" });
  }
});

router.delete("/progress/:id", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const id = Number(req.params.id);
    await db.delete(progressEntriesTable)
      .where(eq(progressEntriesTable.id, id));
    res.json({ message: "Удалено" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка удаления" });
  }
});

export default router;
