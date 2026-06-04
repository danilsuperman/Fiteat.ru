import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.post("/support", async (req, res) => {
  try {
    const { name, email, topic, message } = req.body;
    if (!name || !email || !topic || !message) {
      res.status(400).json({ error: "Заполните все поля" });
      return;
    }
    const result = await pool.query(
      "INSERT INTO support_tickets (name, email, topic, message) VALUES ($1,$2,$3,$4) RETURNING id",
      [name.trim(), email.trim().toLowerCase(), topic.trim(), message.trim()]
    );
    res.status(201).json({ id: result.rows[0].id, success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/packages", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, price_kopecks, ai_upsell_price_kopecks, duration_days, features, is_active, is_popular, sort_order FROM pricing_packages WHERE is_active = true ORDER BY sort_order, id"
    );
    res.json(result.rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/pages/:slug", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pages WHERE slug=$1 LIMIT 1", [req.params.slug]);
    if (!result.rows[0]) { res.status(404).json({ error: "Страница не найдена" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/articles", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, slug, excerpt, category, read_time, author, image_url, published_at FROM articles WHERE is_published=true ORDER BY published_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/articles/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM articles WHERE slug=$1 AND is_published=true LIMIT 1",
      [req.params.slug]
    );
    if (!result.rows[0]) { res.status(404).json({ error: "Статья не найдена" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
