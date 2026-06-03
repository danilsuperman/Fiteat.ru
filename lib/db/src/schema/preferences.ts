import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const preferencesSurveysTable = pgTable("preferences_surveys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mealsPerDay: text("meals_per_day").notNull(),
  dietType: text("diet_type").notNull(),
  dislikedFoods: text("disliked_foods"),
  foodAllergyOrIntolerance: text("food_allergy_or_intolerance"),
  favoriteFoods: text("favorite_foods"),
  culturalRestrictions: text("cultural_restrictions"),
  chronicDiseases: text("chronic_diseases"),
  medications: text("medications"),
  physicalLimitations: text("physical_limitations"),
  stressLevel: text("stress_level"),
  previousWeightAttempts: text("previous_weight_attempts"),
  previousDiets: text("previous_diets"),
  eatingDisorders: text("eating_disorders"),
  snacksPerDay: integer("snacks_per_day"),
  favoriteSnacks: text("favorite_snacks"),
  sweetFrequency: text("sweet_frequency"),
  sugarAddiction: boolean("sugar_addiction"),
  budget: text("budget"),
  cookingTimeMinutes: text("cooking_time_minutes"),
  coffeeTeaCupsPerDay: text("coffee_tea_cups_per_day"),
  waterLitersPerDay: text("water_liters_per_day"),
  motivationLevel: text("motivation_level"),
  motivationHelpers: jsonb("motivation_helpers").$type<string[]>().default([]),
  favoriteCuisines: jsonb("favorite_cuisines").$type<string[]>().default([]),
  preferredProteinSources: jsonb("preferred_protein_sources").$type<string[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPreferencesSurveySchema = createInsertSchema(preferencesSurveysTable).omit({ id: true, createdAt: true });
export type InsertPreferencesSurvey = z.infer<typeof insertPreferencesSurveySchema>;
export type PreferencesSurvey = typeof preferencesSurveysTable.$inferSelect;
