import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

/* ─── Public: validate promo code ─── */
router.get("/promos/validate", async (req, res) => {
  try {
    const code = ((req.query.code as string) || "").toUpperCase().trim();
    if (!code) { res.status(400).json({ error: "Укажите промокод" }); return; }

    const result = await pool.query(
      `SELECT id, code, discount_percent, used_count, max_uses, expires_at
       FROM promo_codes
       WHERE code=$1 AND is_active=true`,
      [code]
    );
    const promo = result.rows[0];
    if (!promo) { res.status(404).json({ error: "Промокод не найден или неактивен" }); return; }
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      res.status(400).json({ error: "Срок действия промокода истёк" }); return;
    }
    if (promo.max_uses && Number(promo.used_count) >= Number(promo.max_uses)) {
      res.status(400).json({ error: "Лимит использований промокода исчерпан" }); return;
    }
    res.json({ id: promo.id, code: promo.code, discountPercent: Number(promo.discount_percent) });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

export default router;
