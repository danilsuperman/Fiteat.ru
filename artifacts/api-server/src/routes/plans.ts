import { Router } from "express";
import { db, plansTable, mealsTable, basicSurveysTable, preferencesSurveysTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import { generateMealsForPlan, generateSingleMeal, getEndDateStr, formatDate } from "../lib/mealGenerator";
import type { Request } from "express";

const router = Router();
type AuthRequest = Request & { user: JwtPayload };

function formatPlan(plan: typeof plansTable.$inferSelect) {
  return {
    id: plan.id,
    userId: plan.userId,
    duration: plan.duration,
    startDate: plan.startDate,
    endDate: plan.endDate,
    status: plan.status,
    createdAt: plan.createdAt.toISOString(),
  };
}

function formatMeal(meal: typeof mealsTable.$inferSelect) {
  return {
    id: meal.id,
    planId: meal.planId,
    dayNumber: meal.dayNumber,
    mealNumber: meal.mealNumber,
    mealType: meal.mealType,
    name: meal.name,
    ingredients: meal.ingredients,
    recipe: meal.recipe,
    calories: meal.calories,
    proteins: meal.proteins,
    fats: meal.fats,
    carbs: meal.carbs,
  };
}

router.post("/plans", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const { duration } = req.body;

    if (!["week", "month", "three_months", "six_months"].includes(duration)) {
      res.status(400).json({ error: "Недопустимая продолжительность плана" });
      return;
    }

    // Mark existing active plans as expired
    await db.update(plansTable)
      .set({ status: "expired" })
      .where(and(eq(plansTable.userId, userId), eq(plansTable.status, "active")));

    const startDate = formatDate(new Date());
    const endDate = getEndDateStr(startDate, duration);

    const [plan] = await db.insert(plansTable).values({
      userId, duration, startDate, endDate, status: "active",
    }).returning();

    // Get user preferences for meal generation
    const [prefs] = await db.select().from(preferencesSurveysTable)
      .where(eq(preferencesSurveysTable.userId, userId))
      .orderBy(desc(preferencesSurveysTable.createdAt))
      .limit(1);

    const [survey] = await db.select().from(basicSurveysTable)
      .where(eq(basicSurveysTable.userId, userId))
      .orderBy(desc(basicSurveysTable.createdAt))
      .limit(1);

    const targetCalories = survey?.targetCalories ?? 2000;
    const dietType = prefs?.dietType ?? "omnivore";
    const mealsPerDay = prefs?.mealsPerDay ?? "three";

    // Generate meals
    const meals = generateMealsForPlan(plan.id, duration, targetCalories, dietType, mealsPerDay);

    // Insert meals in batches
    if (meals.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < meals.length; i += batchSize) {
        const batch = meals.slice(i, i + batchSize).map(m => ({
          planId: m.planId,
          dayNumber: m.dayNumber,
          mealNumber: m.mealNumber,
          mealType: m.mealType,
          name: m.name,
          ingredients: m.ingredients,
          recipe: m.recipe,
          calories: m.calories,
          proteins: m.proteins,
          fats: m.fats,
          carbs: m.carbs,
        }));
        await db.insert(mealsTable).values(batch);
      }
    }

    res.status(201).json(formatPlan(plan));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка создания плана" });
  }
});

router.get("/plans", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const plans = await db.select().from(plansTable)
      .where(eq(plansTable.userId, userId))
      .orderBy(desc(plansTable.createdAt));
    res.json(plans.map(formatPlan));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка получения планов" });
  }
});

router.get("/plans/current", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const [plan] = await db.select().from(plansTable)
      .where(and(eq(plansTable.userId, userId), eq(plansTable.status, "active")))
      .orderBy(desc(plansTable.createdAt))
      .limit(1);

    if (!plan) {
      res.status(404).json({ error: "Активный план не найден" });
      return;
    }

    const meals = await db.select().from(mealsTable)
      .where(eq(mealsTable.planId, plan.id))
      .orderBy(mealsTable.dayNumber, mealsTable.mealNumber);

    res.json({ ...formatPlan(plan), meals: meals.map(formatMeal) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка получения плана" });
  }
});

router.get("/plans/:planId", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const planId = Number(req.params.planId);

    const [plan] = await db.select().from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)))
      .limit(1);

    if (!plan) {
      res.status(404).json({ error: "План не найден" });
      return;
    }

    const meals = await db.select().from(mealsTable)
      .where(eq(mealsTable.planId, plan.id))
      .orderBy(mealsTable.dayNumber, mealsTable.mealNumber);

    res.json({ ...formatPlan(plan), meals: meals.map(formatMeal) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка получения плана" });
  }
});

router.post("/plans/:planId/regenerate", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const planId = Number(req.params.planId);

    const [plan] = await db.select().from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)))
      .limit(1);

    if (!plan) {
      res.status(404).json({ error: "План не найден" });
      return;
    }

    // Delete existing meals
    await db.delete(mealsTable).where(eq(mealsTable.planId, planId));

    const [prefs] = await db.select().from(preferencesSurveysTable)
      .where(eq(preferencesSurveysTable.userId, userId))
      .orderBy(desc(preferencesSurveysTable.createdAt))
      .limit(1);

    const [survey] = await db.select().from(basicSurveysTable)
      .where(eq(basicSurveysTable.userId, userId))
      .orderBy(desc(basicSurveysTable.createdAt))
      .limit(1);

    const targetCalories = survey?.targetCalories ?? 2000;
    const dietType = prefs?.dietType ?? "omnivore";
    const mealsPerDay = prefs?.mealsPerDay ?? "three";

    const meals = generateMealsForPlan(planId, plan.duration, targetCalories, dietType, mealsPerDay);

    const batchSize = 50;
    for (let i = 0; i < meals.length; i += batchSize) {
      const batch = meals.slice(i, i + batchSize).map(m => ({
        planId: m.planId,
        dayNumber: m.dayNumber,
        mealNumber: m.mealNumber,
        mealType: m.mealType,
        name: m.name,
        ingredients: m.ingredients,
        recipe: m.recipe,
        calories: m.calories,
        proteins: m.proteins,
        fats: m.fats,
        carbs: m.carbs,
      }));
      await db.insert(mealsTable).values(batch);
    }

    const updatedMeals = await db.select().from(mealsTable)
      .where(eq(mealsTable.planId, planId))
      .orderBy(mealsTable.dayNumber, mealsTable.mealNumber);

    res.json({ ...formatPlan(plan), meals: updatedMeals.map(formatMeal) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка пересборки плана" });
  }
});

router.patch("/plans/:planId/meals/:mealId", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const planId = Number(req.params.planId);
    const mealId = Number(req.params.mealId);

    const [plan] = await db.select().from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)))
      .limit(1);

    if (!plan) {
      res.status(404).json({ error: "План не найден" });
      return;
    }

    const [currentMeal] = await db.select().from(mealsTable)
      .where(and(eq(mealsTable.id, mealId), eq(mealsTable.planId, planId)))
      .limit(1);

    if (!currentMeal) {
      res.status(404).json({ error: "Блюдо не найдено" });
      return;
    }

    const [prefs] = await db.select().from(preferencesSurveysTable)
      .where(eq(preferencesSurveysTable.userId, userId))
      .orderBy(desc(preferencesSurveysTable.createdAt))
      .limit(1);

    const [survey] = await db.select().from(basicSurveysTable)
      .where(eq(basicSurveysTable.userId, userId))
      .orderBy(desc(basicSurveysTable.createdAt))
      .limit(1);

    const targetCalories = survey?.targetCalories ?? 2000;
    const dietType = prefs?.dietType ?? "omnivore";

    const mealCalories = currentMeal.calories;
    const newMeal = generateSingleMeal(
      planId, currentMeal.dayNumber, currentMeal.mealNumber,
      currentMeal.mealType, mealCalories, dietType,
    ) as Record<string, unknown>;

    const [updated] = await db.update(mealsTable)
      .set({
        name: newMeal.name as string,
        ingredients: newMeal.ingredients as string,
        recipe: newMeal.recipe as string,
        calories: newMeal.calories as number,
        proteins: newMeal.proteins as number,
        fats: newMeal.fats as number,
        carbs: newMeal.carbs as number,
      })
      .where(eq(mealsTable.id, mealId))
      .returning();

    res.json(formatMeal(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка замены блюда" });
  }
});

router.get("/plans/:planId/export/:format", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const planId = Number(req.params.planId);
    const format = req.params.format;

    const [plan] = await db.select().from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)))
      .limit(1);

    if (!plan) {
      res.status(404).json({ error: "План не найден" });
      return;
    }

    // For now return a placeholder URL — PDF/DOCX generation can be added later
    res.json({
      url: `/api/plans/${planId}/download/${format}`,
      format,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка экспорта плана" });
  }
});

router.get("/plans/:planId/summary", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const planId = Number(req.params.planId);

    const [plan] = await db.select().from(plansTable)
      .where(and(eq(plansTable.id, planId), eq(plansTable.userId, userId)))
      .limit(1);

    if (!plan) {
      res.status(404).json({ error: "План не найден" });
      return;
    }

    const meals = await db.select().from(mealsTable)
      .where(eq(mealsTable.planId, planId));

    if (meals.length === 0) {
      res.json({ avgCalories: 0, avgProteins: 0, avgFats: 0, avgCarbs: 0, totalDays: 0, mealsPerDay: 0 });
      return;
    }

    const dayNumbers = [...new Set(meals.map(m => m.dayNumber))];
    const totalDays = dayNumbers.length;
    const mealsPerDay = Math.round(meals.length / totalDays);

    const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
    const totalProteins = meals.reduce((s, m) => s + m.proteins, 0);
    const totalFats = meals.reduce((s, m) => s + m.fats, 0);
    const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);

    res.json({
      avgCalories: Math.round(totalCalories / totalDays),
      avgProteins: Math.round(totalProteins / totalDays),
      avgFats: Math.round(totalFats / totalDays),
      avgCarbs: Math.round(totalCarbs / totalDays),
      totalDays,
      mealsPerDay,
      weeklyCalories: Math.round((totalCalories / totalDays) * 7),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка получения сводки" });
  }
});

export default router;
