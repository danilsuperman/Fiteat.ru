export interface BasicSurveyData {
  gender: string;
  goal: string;
  hormonalDisorder: string;
  lifestyle: string;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  dailySteps: number;
  cardioMinutesPerWeek: number;
  strengthMinutesPerWeek: number;
}

export interface MetabolicCalcResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteins: number;
  fats: number;
  carbs: number;
  bmi: number;
  bmiCategory: string;
  weightToGoal: number;
  totalDeficitNeeded: number;
  estimatedMonths: number;
  progressBlockers: string[];
  moderateDeficit: number;
  aggressiveDeficit: number;
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Недостаточная масса тела";
  if (bmi < 25) return "Норма";
  if (bmi < 30) return "Избыточная масса тела";
  if (bmi < 35) return "Ожирение 1 степени";
  if (bmi < 40) return "Ожирение 2 степени";
  return "Ожирение 3 степени";
}

function getHormonalFactor(disorder: string): number {
  switch (disorder) {
    case "hypothyroidism": return 0.88;
    case "insulin_leptin_resistance": return 0.93;
    case "sex_hormone_deficiency": return 0.90;
    case "other_endocrine": return 0.92;
    default: return 1.0;
  }
}

function getGoalFactor(goal: string): number {
  switch (goal) {
    case "lose_weight": return 0.85;
    case "maintain_recompose": return 1.0;
    case "gain_weight": return 1.12;
    default: return 1.0;
  }
}

function getProgressBlockers(disorder: string): string[] {
  const blockers: string[] = [];
  if (disorder === "insulin_leptin_resistance") {
    blockers.push("Инсулинорезистентность — снижает чувствительность к углеводам, усложняет жиросжигание");
  }
  if (disorder === "hypothyroidism") {
    blockers.push("Гипотиреоз — замедляет обмен веществ, снижает скорость жиросжигания");
    blockers.push("Щитовидная железа (ТТГ, Т4) — напрямую влияет на скорость обмена веществ");
  }
  if (disorder === "sex_hormone_deficiency") {
    blockers.push("Дефицит половых гормонов — снижает анаболизм и скорость восстановления");
  }
  if (disorder === "other_endocrine") {
    blockers.push("Эндокринные нарушения — могут снижать эффективность диетических вмешательств");
  }
  blockers.push("Низкий ферритин — скрытая усталость, падение выносливости и восстановления");
  blockers.push("Дефицит витамина D — влияние на иммунитет, инсулин, воспаление");
  blockers.push("Повышенный кортизол — задержка воды, тяга к сладкому, нарушение сна");
  return blockers;
}

export function calculateMetabolics(data: BasicSurveyData): MetabolicCalcResult {
  // BMR via Mifflin-St Jeor
  let bmr: number;
  if (data.gender === "male") {
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
  } else {
    bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
  }
  bmr = Math.round(bmr);

  // Activity calories
  const stepCalories = Math.round(data.dailySteps * 0.05);
  const cardioCalories = Math.round(data.cardioMinutesPerWeek * 3);
  const strengthCalories = Math.round(data.strengthMinutesPerWeek * 4.3);

  const hormonalFactor = getHormonalFactor(data.hormonalDisorder);
  const tdee = Math.round((bmr + stepCalories + cardioCalories + strengthCalories) * hormonalFactor);

  const goalFactor = getGoalFactor(data.goal);
  const targetCalories = Math.round(tdee * goalFactor);

  // Macros
  const proteins = Math.round(data.weight * 2.0);
  const fats = Math.round((targetCalories * 0.25) / 9);
  const proteinCalories = proteins * 4;
  const fatCalories = fats * 9;
  const carbs = Math.max(0, Math.round((targetCalories - proteinCalories - fatCalories) / 4));

  // BMI
  const heightM = data.height / 100;
  const bmi = Math.round((data.weight / (heightM * heightM)) * 10) / 10;
  const bmiCategory = getBmiCategory(bmi);

  // Goal progress
  const weightToGoal = Math.abs(data.weight - data.targetWeight);
  let totalDeficitNeeded = 0;
  let estimatedMonths = 0;
  const moderateDeficit = tdee - 450;
  const aggressiveDeficit = tdee - 650;

  if (data.goal === "lose_weight") {
    totalDeficitNeeded = Math.round(weightToGoal * 7700);
    estimatedMonths = Math.ceil(totalDeficitNeeded / (450 * 30));
  } else if (data.goal === "gain_weight") {
    totalDeficitNeeded = Math.round(weightToGoal * 7700);
    estimatedMonths = Math.ceil(totalDeficitNeeded / (400 * 30));
  } else {
    estimatedMonths = 3;
  }

  const progressBlockers = getProgressBlockers(data.hormonalDisorder);

  return {
    bmr,
    tdee,
    targetCalories,
    proteins,
    fats,
    carbs,
    bmi,
    bmiCategory,
    weightToGoal,
    totalDeficitNeeded,
    estimatedMonths,
    progressBlockers,
    moderateDeficit,
    aggressiveDeficit,
  };
}
