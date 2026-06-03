import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const progressEntriesTable = pgTable("progress_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  weight: real("weight"),
  waistCm: real("waist_cm"),
  neckCm: real("neck_cm"),
  chestCm: real("chest_cm"),
  hipsCm: real("hips_cm"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProgressEntrySchema = createInsertSchema(progressEntriesTable).omit({ id: true, createdAt: true });
export type InsertProgressEntry = z.infer<typeof insertProgressEntrySchema>;
export type ProgressEntry = typeof progressEntriesTable.$inferSelect;
