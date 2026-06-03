import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const plansTable = pgTable("plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  duration: text("duration").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mealsTable = pgTable("meals", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull(),
  dayNumber: integer("day_number").notNull(),
  mealNumber: integer("meal_number").notNull(),
  mealType: text("meal_type").notNull(),
  name: text("name").notNull(),
  ingredients: text("ingredients").notNull(),
  recipe: text("recipe").notNull(),
  calories: integer("calories").notNull(),
  proteins: integer("proteins").notNull(),
  fats: integer("fats").notNull(),
  carbs: integer("carbs").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlanSchema = createInsertSchema(plansTable).omit({ id: true, createdAt: true });
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plansTable.$inferSelect;

export const insertMealSchema = createInsertSchema(mealsTable).omit({ id: true, createdAt: true });
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof mealsTable.$inferSelect;
