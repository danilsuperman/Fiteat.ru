import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, Loader2, Check } from "lucide-react";

/* ─── Types ─── */
type Answers = Record<string, any>;

interface Question {
  id: string;
  label: string;
  hint?: string;
  type: "radio" | "checkbox" | "number" | "scale5" | "scale3" | "text" | "yes_text" | "freq_table";
  options?: { value: string; label: string }[];
  rows?: { id: string; label: string }[];
  min?: number; max?: number; placeholder?: string;
  genderOnly?: "male" | "female";
}

interface Block {
  part: 1 | 2;
  title: string;
  subtitle?: string;
  questions: Question[];
}

/* ─── Survey Data ─── */
const BLOCKS: Block[] = [
  /* ── ЧАСТЬ 1 ── */
  {
    part: 1,
    title: "Метаболическая основа",
    subtitle: "Оцениваем базовый обмен, риски инсулинорезистентности и метаболических нарушений.",
    questions: [
      { id: "gender", label: "Пол", type: "radio", options: [{ value: "male", label: "Мужской" }, { value: "female", label: "Женский" }] },
      { id: "age", label: "Возраст", type: "number", min: 14, max: 100, placeholder: "30" },
      { id: "height", label: "Рост", type: "number", min: 100, max: 250, placeholder: "170" },
      { id: "weight", label: "Вес", type: "number", min: 30, max: 300, placeholder: "70" },
      { id: "waist", label: "Объём талии", hint: "Измерьте на уровне пупка", type: "number", min: 40, max: 200, placeholder: "80" },
      { id: "weightChange12m", label: "Изменения веса за последние 12 месяцев", type: "radio", options: [
        { value: "stable", label: "Вес стабилен (±2 кг)" },
        { value: "lost_3_7", label: "Похудел(а) на 3–7 кг" },
        { value: "lost_7plus", label: "Похудел(а) более чем на 7 кг" },
        { value: "gained_3_7", label: "Набрал(а) 3–7 кг" },
        { value: "gained_7plus", label: "Набрал(а) более 7 кг" },
      ]},
      { id: "goal", label: "Основная цель", type: "radio", options: [
        { value: "fat_loss", label: "Снижение жира" },
        { value: "muscle_gain", label: "Набор мышечной массы" },
        { value: "recomposition", label: "Рекомпозиция (жир ↓, мышцы ↑)" },
        { value: "health", label: "Здоровье, энергия, самочувствие" },
      ]},
    ],
  },
  {
    part: 1,
    title: "Энергия в течение дня",
    subtitle: "Уровень энергии помогает выявить возможные дефициты и перегрузку нервной системы.",
    questions: [
      { id: "energyMorning",    label: "Уровень энергии утром",  type: "scale5" },
      { id: "energyAfternoon",  label: "Уровень энергии днём",   type: "scale5" },
      { id: "energyEvening",    label: "Уровень энергии вечером",type: "scale5" },
    ],
  },
  {
    part: 1,
    title: "Качество сна",
    subtitle: "Сон — ключевой фактор гормонального баланса и восстановления.",
    questions: [
      { id: "sleepFallAsleep", label: "Засыпание", type: "radio", options: [
        { value: "easy", label: "Засыпаю легко" },
        { value: "slow_30_60", label: "Засыпаю долго (30–60 мин)" },
        { value: "insomnia", label: "Часто не могу уснуть" },
      ]},
      { id: "sleepWakeUps", label: "Ночные пробуждения", type: "radio", options: [
        { value: "none", label: "Нет" },
        { value: "once", label: "1 раз" },
        { value: "two_plus", label: "2+ раз" },
      ]},
      { id: "sleepRest", label: "Ощущение отдыха утром", type: "radio", options: [
        { value: "rested", label: "Чувствую себя отдохнувшим(ей)" },
        { value: "medium", label: "Средне" },
        { value: "tired", label: "Уставшим(ей)" },
      ]},
    ],
  },
  {
    part: 1,
    title: "Стрессовая нагрузка",
    subtitle: "Хронический стресс влияет на кортизол, аппетит и накопление жира.",
    questions: [
      { id: "stressLevel", label: "Хронический стресс", type: "scale5" },
      { id: "caffeine", label: "Кофеин (кофе, энергетики, чай)", type: "radio", options: [
        { value: "none", label: "Не употребляю" },
        { value: "1_2", label: "1–2 порции в день" },
        { value: "3plus", label: "3+ порции в день" },
      ]},
    ],
  },
  {
    part: 1,
    title: "Пищеварение и усвоение",
    subtitle: "Даже идеальный рацион не сработает, если есть проблемы с усвоением.",
    questions: [
      { id: "bloating",  label: "Вздутие после еды",  type: "radio", options: [{ value: "never", label: "Никогда" }, { value: "sometimes", label: "Иногда" }, { value: "often", label: "Часто" }] },
      { id: "gas",       label: "Газообразование",    type: "radio", options: [{ value: "never", label: "Никогда" }, { value: "sometimes", label: "Иногда" }, { value: "often", label: "Часто" }] },
      { id: "heaviness", label: "Тяжесть после еды",  type: "radio", options: [{ value: "never", label: "Никогда" }, { value: "sometimes", label: "Иногда" }, { value: "often", label: "Часто" }] },
      { id: "stool", label: "Стул", type: "radio", options: [
        { value: "daily_formed", label: "Ежедневно, оформленный" },
        { value: "rare", label: "Реже 3 раз в неделю" },
        { value: "liquid", label: "Часто жидкий" },
      ]},
      { id: "foodReactions", label: "Реакция на продукты", type: "checkbox", options: [
        { value: "dairy", label: "Молочные продукты" },
        { value: "bread", label: "Хлеб / выпечка" },
        { value: "fatty", label: "Жирная пища" },
        { value: "none", label: "Нет реакции" },
      ]},
    ],
  },
  {
    part: 1,
    title: "Сигналы микронутриентов",
    subtitle: "Внешние признаки могут указывать на дефициты железа, цинка, витаминов и омега-3.",
    questions: [
      { id: "skinSigns", label: "Что наблюдаете?", type: "checkbox", options: [
        { value: "hair_loss", label: "Выпадение волос" },
        { value: "dry_skin", label: "Сухость кожи" },
        { value: "acne", label: "Акне / воспаления" },
        { value: "brittle_nails", label: "Ломкость ногтей" },
        { value: "slow_healing", label: "Медленное заживление" },
        { value: "none", label: "Ничего из перечисленного" },
      ]},
    ],
  },
  {
    part: 1,
    title: "Иммунная устойчивость",
    subtitle: "Частые болезни и воспаления — индикатор системной нагрузки организма.",
    questions: [
      { id: "illnessFreq", label: "Как часто болеете ОРВИ?", type: "radio", options: [
        { value: "rare", label: "1 раз в год или реже" },
        { value: "moderate", label: "2–3 раза в год" },
        { value: "often", label: "4+ раз в год" },
      ]},
      { id: "recoverySpeed", label: "Восстановление после болезни", type: "radio", options: [
        { value: "fast", label: "Быстро (3–5 дней)" },
        { value: "medium", label: "Средне" },
        { value: "slow", label: "Долго (2+ недели)" },
      ]},
      { id: "chronicInflammation", label: "Есть ли хронические воспаления?", type: "checkbox", options: [
        { value: "throat", label: "Горло" },
        { value: "skin", label: "Кожа" },
        { value: "gut", label: "ЖКТ" },
        { value: "joints", label: "Суставы" },
        { value: "none", label: "Нет" },
      ]},
      { id: "allergies", label: "Аллергии", type: "radio", options: [
        { value: "none", label: "Нет" },
        { value: "seasonal", label: "Сезонные" },
        { value: "food", label: "Пищевые" },
      ]},
    ],
  },
  {
    part: 1,
    title: "Гормональные маркеры",
    subtitle: "Некоторые симптомы помогают заподозрить нарушения щитовидной железы и половых гормонов.",
    questions: [
      { id: "hormonalSigns", label: "Для всех — отметьте, что наблюдаете:", type: "checkbox", options: [
        { value: "cold_extremities", label: "Холодные руки / ноги" },
        { value: "edema", label: "Отёки" },
        { value: "mood_swings", label: "Перепады настроения" },
        { value: "low_libido", label: "Снижение либидо" },
      ]},
      // Female-only
      { id: "cycleRegularity", label: "Регулярность менструального цикла", type: "radio", genderOnly: "female", options: [
        { value: "regular", label: "Регулярный (26–32 дня, отклонения ≤ 3 дней)" },
        { value: "mostly_regular", label: "Условно регулярный (иногда смещается на 4–7 дней)" },
        { value: "irregular", label: "Нерегулярный (часто меняется, сложно предсказать)" },
        { value: "absent", label: "Цикл отсутствует (аменорея / гормональная контрацепция / беременность)" },
      ]},
      { id: "pms", label: "Предменструальный синдром (ПМС)", type: "radio", genderOnly: "female", options: [
        { value: "none", label: "Нет или минимальный" },
        { value: "moderate", label: "Умеренный (раздражительность, тяга к сладкому)" },
        { value: "severe", label: "Выраженный (перепады настроения, отёки, боль, сильная усталость)" },
      ]},
      { id: "menstrualPain", label: "Болевые ощущения во время менструации", type: "radio", genderOnly: "female", options: [
        { value: "none", label: "Нет боли" },
        { value: "mild", label: "Лёгкая (не требует обезболивающих)" },
        { value: "moderate", label: "Умеренная (иногда принимаю обезболивающее)" },
        { value: "severe", label: "Сильная (регулярно принимаю обезболивающие)" },
      ]},
      { id: "femaleEdema", label: "Отёчность", type: "radio", genderOnly: "female", options: [
        { value: "none", label: "Нет" },
        { value: "slight", label: "Незначительная (иногда, к вечеру)" },
        { value: "before_period", label: "Выраженная перед менструацией" },
        { value: "constant", label: "Постоянная" },
      ]},
      // Male-only
      { id: "morningErections", label: "Утренние эрекции", type: "radio", genderOnly: "male", options: [
        { value: "regular", label: "Регулярно" },
        { value: "rare", label: "Редко" },
        { value: "absent", label: "Отсутствуют" },
      ]},
      { id: "workoutRecovery", label: "Восстановление после тренировок", type: "radio", genderOnly: "male", options: [
        { value: "fast", label: "Быстро" },
        { value: "medium", label: "Средне" },
        { value: "poor", label: "Плохо" },
      ]},
    ],
  },
  {
    part: 1,
    title: "Реальный рацион",
    subtitle: "Анализируем текущие привычки, чтобы скорректировать белок, клетчатку, жиры и воду.",
    questions: [
      { id: "dietFreq", label: "Как часто вы употребляете:", type: "freq_table", rows: [
        { id: "freqProtein",      label: "Белок (мясо, рыба, яйца)" },
        { id: "freqFish",         label: "Рыба / морепродукты" },
        { id: "freqVeggies",      label: "Овощи" },
        { id: "freqFruits",       label: "Фрукты" },
        { id: "freqWholegrains",  label: "Цельнозерновые / клетчатка" },
      ]},
      { id: "carbType", label: "Углеводы", type: "radio", options: [
        { value: "fast", label: "В основном быстрые" },
        { value: "complex", label: "В основном сложные" },
        { value: "mixed", label: "Смешанные" },
      ]},
      { id: "waterIntake", label: "Вода", type: "radio", options: [
        { value: "under_1", label: "< 1 л" },
        { value: "1_1_5", label: "1–1,5 л" },
        { value: "2plus", label: "2+ л" },
      ]},
    ],
  },
  {
    part: 1,
    title: "Глубина стратегии",
    subtitle: "Выберите приоритет: скорость, точность или максимальная безопасность.",
    questions: [
      { id: "strategyPriority", label: "Что для вас важнее?", type: "radio", options: [
        { value: "speed", label: "Быстрый результат" },
        { value: "accuracy", label: "Максимальная точность" },
        { value: "safety", label: "Безопасность" },
      ]},
    ],
  },

  /* ── ЧАСТЬ 2 ── */
  {
    part: 2,
    title: "Режим питания",
    subtitle: "Настроим частоту приёмов пищи под ваш образ жизни и метаболизм.",
    questions: [
      { id: "mealsPerDay", label: "Сколько раз в день вы обычно питаетесь?", type: "radio", options: [
        { value: "1_2", label: "1–2 раза" },
        { value: "3", label: "3 раза" },
        { value: "4_5", label: "4–5 раз" },
        { value: "6plus", label: "6 раз и более" },
      ]},
    ],
  },
  {
    part: 2,
    title: "Формат и ограничения",
    subtitle: "Учтём ваши предпочтения, принципы и ограничения, чтобы питание было комфортным и устойчивым.",
    questions: [
      { id: "dietTypes", label: "Ваши предпочтения по типу питания:", type: "checkbox", options: [
        { value: "omnivore", label: "Всеядность" },
        { value: "vegetarian", label: "Вегетарианство" },
        { value: "vegan", label: "Веганство" },
        { value: "pescatarian", label: "Пескетарианство (едите рыбу)" },
        { value: "gluten_free", label: "Безглютеновая диета" },
        { value: "keto", label: "Кето" },
      ]},
      { id: "culturalRestrictions", label: "Ограничения по культурным, религиозным или иным причинам?", type: "yes_text",
        options: [{ value: "no", label: "Нет" }, { value: "yes", label: "Да, указать:" }] },
    ],
  },
  {
    part: 2,
    title: "Вкусовые предпочтения",
    subtitle: "Рацион должен нравиться — это снижает риск срывов и повышает соблюдение плана.",
    questions: [
      { id: "likedFoods", label: "Какие продукты и блюда особенно нравятся?", type: "yes_text",
        options: [{ value: "no", label: "Нет таких" }, { value: "yes", label: "Да, перечислите:" }] },
      { id: "dislikedFoods", label: "Есть ли продукты, которые вы не любите / не переносите?", type: "yes_text",
        options: [{ value: "no", label: "Нет" }, { value: "yes", label: "Да, укажите:" }] },
    ],
  },
  {
    part: 2,
    title: "Безопасность питания и медицинский контекст",
    subtitle: "Исключим продукты, которые могут вызывать реакции, и учтём хронические состояния.",
    questions: [
      { id: "foodAllergy", label: "Есть ли пищевая аллергия или непереносимость?", type: "yes_text",
        options: [{ value: "no", label: "Нет" }, { value: "yes", label: "Да, указать:" }] },
      { id: "chronicDiseases", label: "Есть ли хронические заболевания?", hint: "Диабет, гипертония, проблемы с ЖКТ и т.д.", type: "yes_text",
        options: [{ value: "no", label: "Нет" }, { value: "yes", label: "Да, указать:" }] },
      { id: "medications", label: "Принимаете ли вы лекарства на постоянной основе?", type: "yes_text",
        options: [{ value: "no", label: "Нет" }, { value: "yes", label: "Да, указать:" }] },
    ],
  },
  {
    part: 2,
    title: "Прошлый опыт и отношения с едой",
    subtitle: "Чтобы не повторять ошибки и сделать план психологически безопасным.",
    questions: [
      { id: "weightHistory", label: "Были ли попытки снизить или набрать вес ранее?", type: "yes_text",
        options: [{ value: "no", label: "Нет" }, { value: "yes", label: "Да, каким образом:" }] },
      { id: "dietHistory", label: "Придерживались ли вы какой-либо диеты?", type: "yes_text",
        options: [{ value: "no", label: "Нет" }, { value: "yes", label: "Да, указать:" }] },
      { id: "eatingDisorder", label: "Были ли нарушения пищевого поведения (переедание, анорексия и т.д.)?", type: "radio", options: [
        { value: "never", label: "Нет, никогда" },
        { value: "past", label: "Да, в прошлом" },
        { value: "current", label: "Да, в настоящее время испытываю трудности" },
        { value: "unsure", label: "Не уверен(а), возможно были признаки" },
      ]},
    ],
  },
  {
    part: 2,
    title: "Пищевые привычки и тяга к сладкому",
    subtitle: "Перекусы и сладкое влияют на уровень сахара в крови и общий суточный баланс.",
    questions: [
      { id: "snacksFreq", label: "Часто ли вы перекусываете в течение дня?", type: "yes_text",
        options: [{ value: "no", label: "Нет" }, { value: "yes", label: "Да, сколько раз:" }] },
      { id: "favoriteSnacks", label: "Есть ли у вас любимые перекусы?", type: "yes_text",
        options: [{ value: "no", label: "Нет" }, { value: "yes", label: "Да, перечислите:" }] },
      { id: "sweetFreq", label: "Как часто едите сладкое?", type: "radio", options: [
        { value: "daily", label: "Почти каждый день" },
        { value: "few_week", label: "Несколько раз в неделю" },
        { value: "rarely", label: "Очень редко" },
        { value: "never", label: "Вообще не ем" },
      ]},
      { id: "sweetAddiction", label: "Есть ли у вас зависимость от сладкого?", type: "radio", options: [
        { value: "no", label: "Нет" },
        { value: "yes", label: "Да" },
      ]},
    ],
  },
  {
    part: 2,
    title: "Бытовые возможности и гидратация",
    subtitle: "Рацион должен соответствовать вашему бюджету, времени и привычкам.",
    questions: [
      { id: "budget", label: "Какой у вас бюджет на продукты питания?", type: "radio", options: [
        { value: "minimal", label: "Минимальный" },
        { value: "medium", label: "Средний" },
        { value: "high", label: "Высокий" },
      ]},
      { id: "cookingTime", label: "Сколько времени готовы уделять приготовлению пищи?", type: "radio", options: [
        { value: "under_15", label: "Минимум, до 15 минут" },
        { value: "15_30", label: "15–30 минут" },
        { value: "over_30", label: "Более 30 минут, люблю готовить" },
      ]},
      { id: "coffeePerDay", label: "Сколько чашек кофе или чая в день?", type: "radio", options: [
        { value: "0", label: "0" },
        { value: "1_2", label: "1–2" },
        { value: "3_4", label: "3–4" },
        { value: "5plus", label: "5 и более" },
      ]},
      { id: "waterPerDay", label: "Сколько литров воды в день?", type: "radio", options: [
        { value: "0", label: "0" },
        { value: "0_5", label: "0,5 л" },
        { value: "1_2", label: "1–2 л" },
        { value: "2_3", label: "2–3 л" },
      ]},
    ],
  },
];

const PART_TITLES: Record<1 | 2, string> = {
  1: "Состояние организма",
  2: "Формат питания",
};

const FREQ_LABELS = [
  { value: "rarely",    label: "Редко" },
  { value: "sometimes", label: "Иногда" },
  { value: "regularly", label: "Регулярно" },
];

/* ─── Input Components ─── */

function RadioGroup({ options, value, onChange }: { options: { value: string; label: string }[]; value: string | undefined; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${value === o.value ? "border-foreground bg-foreground text-background font-medium" : "border-border hover:border-foreground/30 hover:bg-secondary/40"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function CheckboxGroup({ options, values, onChange }: { options: { value: string; label: string }[]; values: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) => {
    const next = values.includes(v) ? values.filter(x => x !== v) : [...values, v];
    onChange(next);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => {
        const sel = values.includes(o.value);
        return (
          <button key={o.value} type="button" onClick={() => toggle(o.value)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${sel ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/30 hover:bg-secondary/40"}`}>
            {sel && <Check className="h-3.5 w-3.5 shrink-0" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Scale5({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`flex-1 h-12 rounded-xl border text-sm font-bold transition-colors ${value === n ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/30 hover:bg-secondary/40"}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>Очень низкий</span>
        <span>Высокий</span>
      </div>
    </div>
  );
}

function YesTextInput({ options, value, textValue, onToggle, onText }: {
  options: { value: string; label: string }[];
  value: string | undefined; textValue: string;
  onToggle: (v: string) => void; onText: (t: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map(o => (
        <div key={o.value}>
          <button type="button" onClick={() => onToggle(o.value)}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${value === o.value ? "border-foreground bg-foreground text-background font-medium" : "border-border hover:border-foreground/30 hover:bg-secondary/40"}`}>
            {o.label}
          </button>
          {o.value === "yes" && value === "yes" && (
            <input type="text" value={textValue} onChange={e => onText(e.target.value)}
              placeholder="Введите ответ..."
              className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          )}
        </div>
      ))}
    </div>
  );
}

function FreqTable({ rows, values, onChange }: { rows: { id: string; label: string }[]; values: Record<string, string>; onChange: (id: string, v: string) => void }) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      {rows.map((row, i) => (
        <div key={row.id} className={`flex items-center gap-3 px-4 py-3 ${i < rows.length - 1 ? "border-b border-border" : ""}`}>
          <span className="text-sm flex-1 min-w-0 leading-tight">{row.label}</span>
          <div className="flex gap-1.5 shrink-0">
            {FREQ_LABELS.map(fl => (
              <button key={fl.value} type="button" onClick={() => onChange(row.id, fl.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${values[row.id] === fl.value ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/30"}`}>
                {fl.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Survey Component ─── */
export default function ExtendedSurvey() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => {
    try { return JSON.parse(localStorage.getItem("fitit_extended_survey") || "{}"); } catch { return {}; }
  });
  const [saving, setSaving] = useState(false);

  const block = BLOCKS[step];
  const gender = answers.gender || "male";

  // Filter gender-specific questions
  const visibleQuestions = block.questions.filter(q => !q.genderOnly || q.genderOnly === gender);

  const totalPart1 = BLOCKS.filter(b => b.part === 1).length;
  const totalPart2 = BLOCKS.filter(b => b.part === 2).length;
  const partBlocks = BLOCKS.filter(b => b.part === block.part);
  const stepInPart = partBlocks.indexOf(block);

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem("fitit_extended_survey", JSON.stringify(answers));
  }, [answers]);

  const set = useCallback((id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }, []);

  const setFreq = useCallback((rowId: string, value: string) => {
    setAnswers(prev => ({ ...prev, freqTable: { ...(prev.freqTable || {}), [rowId]: value } }));
  }, []);

  const setYesText = useCallback((id: string, toggle: string) => {
    setAnswers(prev => ({ ...prev, [id]: toggle }));
  }, []);

  const setYesTextValue = useCallback((id: string, text: string) => {
    setAnswers(prev => ({ ...prev, [`${id}Text`]: text }));
  }, []);

  const handleNext = async () => {
    if (step < BLOCKS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      await finish();
    }
  };

  const handleBack = () => {
    if (step > 0) { setStep(step - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const finish = async () => {
    setSaving(true);
    if (!isAuthenticated) {
      localStorage.setItem("fitit_pending_extended_survey", JSON.stringify(answers));
      setLocation("/register");
      setSaving(false);
      return;
    }
    try {
      const token = localStorage.getItem("fitit_token");
      await fetch("/api/survey/extended", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(answers),
      });
      localStorage.removeItem("fitit_extended_survey");
      setLocation("/payment");
    } catch {
      setLocation("/payment");
    } finally {
      setSaving(false);
    }
  };

  const isLastStep = step === BLOCKS.length - 1;

  const renderQuestion = (q: Question) => {
    switch (q.type) {
      case "radio":
        return <RadioGroup key={q.id} options={q.options!} value={answers[q.id]} onChange={v => set(q.id, v)} />;
      case "checkbox":
        return <CheckboxGroup key={q.id} options={q.options!} values={answers[q.id] || []} onChange={v => set(q.id, v)} />;
      case "scale5":
        return <Scale5 key={q.id} value={answers[q.id]} onChange={v => set(q.id, v)} />;
      case "number":
        return (
          <input key={q.id} type="number" min={q.min} max={q.max} placeholder={q.placeholder}
            value={answers[q.id] || ""}
            onChange={e => set(q.id, e.target.value ? Number(e.target.value) : "")}
            className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        );
      case "yes_text":
        return <YesTextInput key={q.id} options={q.options!} value={answers[q.id]} textValue={answers[`${q.id}Text`] || ""} onToggle={v => setYesText(q.id, v)} onText={t => setYesTextValue(q.id, t)} />;
      case "freq_table":
        return <FreqTable key={q.id} rows={q.rows!} values={answers.freqTable || {}} onChange={setFreq} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="flex-1 bg-muted/20 py-6 sm:py-10">
        <div className="container max-w-2xl px-4">

          {/* Part badge + progress */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${block.part === 1 ? "bg-foreground text-background" : "bg-secondary text-foreground"}`}>
                Часть 1: {PART_TITLES[1]}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${block.part === 2 ? "bg-foreground text-background" : "bg-secondary text-foreground"}`}>
                Часть 2: {PART_TITLES[2]}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-medium">{PART_TITLES[block.part]}</span>
                <span>Блок {stepInPart + 1} из {block.part === 1 ? totalPart1 : totalPart2}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-foreground rounded-full transition-all"
                  style={{ width: `${((step + 1) / BLOCKS.length) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Block card */}
          <div className="bg-card border border-border shadow-sm rounded-2xl p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold leading-snug">{block.title}</h2>
              {block.subtitle && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{block.subtitle}</p>}
            </div>

            <div className="space-y-6">
              {visibleQuestions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label className="text-sm font-semibold leading-snug block">{q.label}</label>
                  {q.hint && <p className="text-xs text-muted-foreground">{q.hint}</p>}
                  {renderQuestion(q)}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button className="w-full h-12 text-base rounded-xl" onClick={handleNext} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLastStep ? "Завершить и продолжить →" : "Далее →"}
              </Button>
            </div>
          </div>

          {/* Back + skip */}
          <div className="mt-4 flex items-center justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={handleBack} className="text-muted-foreground gap-1">
                <ChevronLeft className="h-4 w-4" />
                Назад
              </Button>
            ) : <div />}
            <button onClick={handleNext} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Пропустить блок →
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}
