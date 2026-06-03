import { Router } from "express";
import { db, basicSurveysTable, preferencesSurveysTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { JwtPayload } from "../middlewares/auth";
import { calculateMetabolics } from "../lib/metabolic";
import type { Request } from "express";

const router = Router();
type AuthRequest = Request & { user: JwtPayload };

router.post("/survey/basic", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const body = req.body;

    const calc = calculateMetabolics({
      gender: body.gender,
      goal: body.goal,
      hormonalDisorder: body.hormonalDisorder,
      lifestyle: body.lifestyle,
      age: Number(body.age),
      height: Number(body.height),
      weight: Number(body.weight),
      targetWeight: Number(body.targetWeight),
      dailySteps: Number(body.dailySteps),
      cardioMinutesPerWeek: Number(body.cardioMinutesPerWeek),
      strengthMinutesPerWeek: Number(body.strengthMinutesPerWeek),
    });

    await db.insert(basicSurveysTable).values({
      userId,
      gender: body.gender,
      goal: body.goal,
      hormonalDisorder: body.hormonalDisorder,
      lifestyle: body.lifestyle,
      age: Number(body.age),
      height: Number(body.height),
      weight: Number(body.weight),
      targetWeight: Number(body.targetWeight),
      sport: body.sport ?? null,
      dailySteps: Number(body.dailySteps),
      cardioMinutesPerWeek: Number(body.cardioMinutesPerWeek),
      strengthMinutesPerWeek: Number(body.strengthMinutesPerWeek),
      waistCm: body.waistCm ? Number(body.waistCm) : null,
      weightChangePast12Months: body.weightChangePast12Months ?? null,
      energyMorning: body.energyMorning ? Number(body.energyMorning) : null,
      energyAfternoon: body.energyAfternoon ? Number(body.energyAfternoon) : null,
      energyEvening: body.energyEvening ? Number(body.energyEvening) : null,
      sleepFallingAsleep: body.sleepFallingAsleep ?? null,
      sleepNightWakeups: body.sleepNightWakeups ?? null,
      sleepRestfulness: body.sleepRestfulness ?? null,
      chronicStressLevel: body.chronicStressLevel ? Number(body.chronicStressLevel) : null,
      caffeineIntake: body.caffeineIntake ?? null,
      bloatingAfterEating: body.bloatingAfterEating ?? null,
      gasForming: body.gasForming ?? null,
      heavinessAfterEating: body.heavinessAfterEating ?? null,
      stoolRegularity: body.stoolRegularity ?? null,
      foodReactions: body.foodReactions ?? [],
      skinHairNailSymptoms: body.skinHairNailSymptoms ?? [],
      illnessFrequency: body.illnessFrequency ?? null,
      recoverySpeed: body.recoverySpeed ?? null,
      chronicInflammations: body.chronicInflammations ?? [],
      allergies: body.allergies ?? null,
      generalSymptoms: body.generalSymptoms ?? [],
      menstrualRegularity: body.menstrualRegularity ?? null,
      pmsLevel: body.pmsLevel ?? null,
      menstrualPain: body.menstrualPain ?? null,
      edemaLevel: body.edemaLevel ?? null,
      morningErections: body.morningErections ?? null,
      trainingRecovery: body.trainingRecovery ?? null,
      proteinFrequency: body.proteinFrequency ?? null,
      fishFrequency: body.fishFrequency ?? null,
      vegetableFrequency: body.vegetableFrequency ?? null,
      fruitFrequency: body.fruitFrequency ?? null,
      wholeGrainFrequency: body.wholeGrainFrequency ?? null,
      carbType: body.carbType ?? null,
      ...calc,
    });

    res.json({
      bmr: calc.bmr,
      tdee: calc.tdee,
      targetCalories: calc.targetCalories,
      proteins: calc.proteins,
      fats: calc.fats,
      carbs: calc.carbs,
      bmi: calc.bmi,
      bmiCategory: calc.bmiCategory,
      weightToGoal: calc.weightToGoal,
      totalDeficitNeeded: calc.totalDeficitNeeded,
      estimatedMonths: calc.estimatedMonths,
      progressBlockers: calc.progressBlockers,
      moderateDeficit: calc.moderateDeficit,
      aggressiveDeficit: calc.aggressiveDeficit,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка расчёта метаболики" });
  }
});

router.post("/survey/preferences", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const body = req.body;

    await db.insert(preferencesSurveysTable).values({
      userId,
      mealsPerDay: body.mealsPerDay,
      dietType: body.dietType,
      dislikedFoods: body.dislikedFoods ?? null,
      foodAllergyOrIntolerance: body.foodAllergyOrIntolerance ?? null,
      favoriteFoods: body.favoriteFoods ?? null,
      culturalRestrictions: body.culturalRestrictions ?? null,
      chronicDiseases: body.chronicDiseases ?? null,
      medications: body.medications ?? null,
      physicalLimitations: body.physicalLimitations ?? null,
      stressLevel: body.stressLevel ?? null,
      previousWeightAttempts: body.previousWeightAttempts ?? null,
      previousDiets: body.previousDiets ?? null,
      eatingDisorders: body.eatingDisorders ?? null,
      snacksPerDay: body.snacksPerDay ? Number(body.snacksPerDay) : null,
      favoriteSnacks: body.favoriteSnacks ?? null,
      sweetFrequency: body.sweetFrequency ?? null,
      sugarAddiction: body.sugarAddiction ?? null,
      budget: body.budget ?? null,
      cookingTimeMinutes: body.cookingTimeMinutes ?? null,
      coffeeTeaCupsPerDay: body.coffeeTeaCupsPerDay ?? null,
      waterLitersPerDay: body.waterLitersPerDay ?? null,
      motivationLevel: body.motivationLevel ?? null,
      motivationHelpers: body.motivationHelpers ?? [],
      favoriteCuisines: Array.isArray(body.favoriteCuisines) ? body.favoriteCuisines : [],
      preferredProteinSources: Array.isArray(body.preferredProteinSources) ? body.preferredProteinSources : [],
    });

    res.json({ message: "Предпочтения сохранены" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка сохранения предпочтений" });
  }
});

router.get("/survey/result", requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user.userId;
    const [survey] = await db
      .select()
      .from(basicSurveysTable)
      .where(eq(basicSurveysTable.userId, userId))
      .orderBy(desc(basicSurveysTable.createdAt))
      .limit(1);

    if (!survey) {
      res.status(404).json({ error: "Результаты опроса не найдены" });
      return;
    }

    res.json({
      id: survey.id,
      goal: survey.goal,
      weight: survey.weight,
      targetWeight: survey.targetWeight,
      bmr: survey.bmr,
      tdee: survey.tdee,
      targetCalories: survey.targetCalories,
      proteins: survey.proteins,
      fats: survey.fats,
      carbs: survey.carbs,
      bmi: survey.bmi,
      bmiCategory: survey.bmiCategory,
      weightToGoal: survey.weightToGoal,
      totalDeficitNeeded: survey.totalDeficitNeeded,
      estimatedMonths: survey.estimatedMonths,
      progressBlockers: survey.progressBlockers,
      moderateDeficit: survey.moderateDeficit,
      aggressiveDeficit: survey.aggressiveDeficit,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Ошибка получения результатов" });
  }
});

export default router;
