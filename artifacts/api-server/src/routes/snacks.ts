import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./admin";

const router = Router();

/* ─── Public: random 4 active snacks ─── */
router.get("/snacks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM snacks WHERE is_active=true ORDER BY RANDOM() LIMIT 4"
    );
    res.json(result.rows);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Public: all active snacks with optional tag filter ─── */
router.get("/snacks/all", async (req, res) => {
  try {
    const tag = req.query.tag as string | undefined;
    let query = "SELECT * FROM snacks WHERE is_active=true";
    const params: any[] = [];
    if (tag) {
      params.push(tag);
      query += ` AND $${params.length} = ANY(tags)`;
    }
    query += " ORDER BY id";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Admin: list all snacks ─── */
router.get("/admin/snacks", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM snacks ORDER BY id");
    res.json(result.rows);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Admin: create snack ─── */
router.post("/admin/snacks", requireAdmin, async (req, res) => {
  try {
    const { name, description, calories, proteins, fats, carbs, photoUrl, tags, isActive } = req.body;
    if (!name) { res.status(400).json({ error: "Укажите название" }); return; }
    const result = await pool.query(
      "INSERT INTO snacks (name,description,calories,proteins,fats,carbs,photo_url,tags,is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [name, description || "", Number(calories) || 0, Number(proteins) || 0, Number(fats) || 0, Number(carbs) || 0, photoUrl || null, tags || [], isActive !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Admin: update snack ─── */
router.put("/admin/snacks/:id", requireAdmin, async (req, res) => {
  try {
    const { name, description, calories, proteins, fats, carbs, photoUrl, tags, isActive } = req.body;
    const result = await pool.query(
      "UPDATE snacks SET name=$1,description=$2,calories=$3,proteins=$4,fats=$5,carbs=$6,photo_url=$7,tags=$8,is_active=$9 WHERE id=$10 RETURNING *",
      [name, description || "", Number(calories) || 0, Number(proteins) || 0, Number(fats) || 0, Number(carbs) || 0, photoUrl || null, tags || [], isActive !== false, req.params.id]
    );
    if (!result.rows[0]) { res.status(404).json({ error: "Не найдено" }); return; }
    res.json(result.rows[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Admin: toggle active ─── */
router.patch("/admin/snacks/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE snacks SET is_active=NOT is_active WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

/* ─── Admin: delete snack ─── */
router.delete("/admin/snacks/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM snacks WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Ошибка сервера" }); }
});

export default router;
