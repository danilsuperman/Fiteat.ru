export interface MealTemplate {
  mealType: string;
  name: string;
  ingredients: string;
  recipe: string;
  baseCalories: number;
  baseProteins: number;
  baseFats: number;
  baseCarbs: number;
  dietTypes: string[];
}

const breakfastMeals: MealTemplate[] = [
  {
    mealType: "Завтрак",
    name: "Овсяная каша с ягодами и орехами",
    ingredients: "Овсяные хлопья — 80 г, молоко 2.5% — 200 мл, черника — 80 г, грецкие орехи — 20 г, мёд — 1 ч.л.",
    recipe: "Залейте овсяные хлопья молоком и варите на среднем огне 5-7 минут, помешивая. Снимите с огня, добавьте ягоды, дроблёные орехи и мёд. Перемешайте и подавайте горячим.",
    baseCalories: 420, baseProteins: 15, baseFats: 14, baseCarbs: 58,
    dietTypes: ["omnivore", "vegetarian", "gluten_free"],
  },
  {
    mealType: "Завтрак",
    name: "Яичница с овощами и тостом",
    ingredients: "Яйца — 3 шт, болгарский перец — 1/2 шт, помидор — 1 шт, шпинат — 30 г, масло оливковое — 1 ч.л., хлеб цельнозерновой — 1 ломтик, соль, перец",
    recipe: "Разогрейте оливковое масло на сковороде. Нарежьте перец и помидор, обжарьте 2 минуты. Добавьте шпинат. Вбейте яйца и готовьте под крышкой 3-4 минуты до желаемой степени готовности. Подавайте с тостом.",
    baseCalories: 380, baseProteins: 24, baseFats: 16, baseCarbs: 32,
    dietTypes: ["omnivore", "vegetarian"],
  },
  {
    mealType: "Завтрак",
    name: "Творог с фруктами и льняным семенем",
    ingredients: "Творог 5% — 200 г, банан — 1/2 шт, клубника — 80 г, семена льна — 1 ст.л., мёд — 1 ч.л.",
    recipe: "Нарежьте фрукты кусочками. Выложите творог в миску, сверху разместите фрукты. Посыпьте льняным семенем и сбрызните мёдом.",
    baseCalories: 320, baseProteins: 28, baseFats: 7, baseCarbs: 38,
    dietTypes: ["omnivore", "vegetarian", "gluten_free"],
  },
  {
    mealType: "Завтрак",
    name: "Гречневая каша с яйцом",
    ingredients: "Гречка — 80 г, яйцо — 2 шт, масло сливочное — 1 ч.л., соль",
    recipe: "Сварите гречку в подсоленной воде (1:2) в течение 15-20 минут. Отдельно сварите яйца вкрутую или вкрутую. Подавайте гречку с яйцом и кусочком масла.",
    baseCalories: 360, baseProteins: 20, baseFats: 12, baseCarbs: 44,
    dietTypes: ["omnivore", "vegetarian", "gluten_free"],
  },
  {
    mealType: "Завтрак",
    name: "Протеиновый смузи с бананом и миндалём",
    ingredients: "Протеиновый порошок ваниль — 30 г, банан — 1 шт, миндальное молоко — 300 мл, миндаль — 15 г, корица — щепотка",
    recipe: "Поместите все ингредиенты в блендер. Взбейте до однородной массы. Подавайте сразу, охлаждённым.",
    baseCalories: 370, baseProteins: 30, baseFats: 9, baseCarbs: 42,
    dietTypes: ["omnivore", "vegetarian", "gluten_free", "keto"],
  },
  {
    mealType: "Завтрак",
    name: "Авокадо-тост с яйцом пашот",
    ingredients: "Хлеб цельнозерновой — 2 ломтика, авокадо — 1/2 шт, яйца — 2 шт, лимонный сок — 1 ч.л., соль, перец, микрозелень",
    recipe: "Поджарьте хлеб. Разомните авокадо с лимонным соком, солью и перцем. Намажьте на тост. Сварите яйца пашот: вскипятите воду с уксусом, создайте воронку и аккуратно опустите яйца на 3 минуты. Выложите на тост.",
    baseCalories: 420, baseProteins: 20, baseFats: 20, baseCarbs: 36,
    dietTypes: ["omnivore", "vegetarian", "vegan"],
  },
  {
    mealType: "Завтрак",
    name: "Омлет с сыром и зеленью",
    ingredients: "Яйца — 3 шт, молоко — 50 мл, сыр твёрдый — 30 г, укроп, петрушка — 10 г, масло сливочное — 1 ч.л., соль",
    recipe: "Взбейте яйца с молоком и солью. Растопите масло на сковороде, вылейте яичную смесь. Готовьте на малом огне под крышкой 5 минут. Посыпьте тёртым сыром и зеленью, сложите пополам.",
    baseCalories: 340, baseProteins: 26, baseFats: 22, baseCarbs: 5,
    dietTypes: ["omnivore", "vegetarian", "gluten_free", "keto"],
  },
  {
    mealType: "Завтрак",
    name: "Гранола с йогуртом и ягодами",
    ingredients: "Гранола без сахара — 50 г, греческий йогурт 2% — 150 г, малина — 80 г, мёд — 1 ч.л.",
    recipe: "В миску выложите йогурт. Сверху насыпьте гранолу и ягоды. Сбрызните мёдом. Подавайте сразу.",
    baseCalories: 380, baseProteins: 18, baseFats: 8, baseCarbs: 54,
    dietTypes: ["omnivore", "vegetarian"],
  },
];

const lunchMeals: MealTemplate[] = [
  {
    mealType: "Обед",
    name: "Куриная грудка с гречкой и овощами",
    ingredients: "Куриная грудка — 200 г, гречка — 80 г, брокколи — 150 г, морковь — 1 шт, масло оливковое — 1 ст.л., чеснок — 2 зубчика, соль, перец",
    recipe: "Куриную грудку нарежьте, посолите, поперчите. Обжарьте на оливковом масле с чесноком 6-8 минут с каждой стороны. Сварите гречку. Брокколи и морковь отварите или приготовьте на пару 7 минут. Подавайте всё вместе.",
    baseCalories: 480, baseProteins: 48, baseFats: 12, baseCarbs: 44,
    dietTypes: ["omnivore"],
  },
  {
    mealType: "Обед",
    name: "Борщ с говядиной",
    ingredients: "Говядина — 150 г, свёкла — 1 шт, капуста — 200 г, картофель — 2 шт, морковь — 1 шт, лук — 1 шт, томатная паста — 2 ст.л., масло растительное — 1 ст.л., лавровый лист, соль, перец, сметана — 1 ст.л.",
    recipe: "Сварите говядину в 1.5 л воды 40 минут. Добавьте нарезанный картофель. Обжарьте лук, морковь и свёклу, добавьте томатную пасту. Добавьте зажарку в бульон вместе с капустой. Варите ещё 20 минут. Подавайте со сметаной.",
    baseCalories: 420, baseProteins: 28, baseFats: 14, baseCarbs: 42,
    dietTypes: ["omnivore"],
  },
  {
    mealType: "Обед",
    name: "Лосось с рисом и спаржей",
    ingredients: "Лосось — 180 г, бурый рис — 80 г, спаржа — 150 г, лимон — 1/2 шт, масло оливковое — 1 ст.л., соль, перец, укроп",
    recipe: "Сварите бурый рис 30-35 минут. Лосось посолите, поперчите, сбрызните лимоном. Запеките в духовке при 180°C 15-18 минут. Спаржу бланшируйте 3-4 минуты. Подавайте с рисом и зеленью.",
    baseCalories: 520, baseProteins: 40, baseFats: 18, baseCarbs: 48,
    dietTypes: ["omnivore", "pescatarian", "gluten_free"],
  },
  {
    mealType: "Обед",
    name: "Чечевичный суп с овощами",
    ingredients: "Чечевица красная — 100 г, помидоры — 2 шт, болгарский перец — 1 шт, лук — 1 шт, морковь — 1 шт, чеснок — 3 зубчика, специи (куркума, кумин) — по 1/2 ч.л., масло оливковое — 1 ст.л., соль",
    recipe: "Обжарьте лук, морковь и перец на масле 5 минут. Добавьте чеснок и специи. Добавьте нарезанные помидоры, чечевицу и 1 л воды. Варите 20-25 минут до мягкости чечевицы. Приправьте по вкусу.",
    baseCalories: 380, baseProteins: 20, baseFats: 8, baseCarbs: 58,
    dietTypes: ["omnivore", "vegetarian", "vegan", "gluten_free"],
  },
  {
    mealType: "Обед",
    name: "Индейка с картофелем и зелёным салатом",
    ingredients: "Филе индейки — 180 г, картофель — 200 г, огурец — 1 шт, помидор — 1 шт, листья салата — 50 г, оливковое масло — 1 ст.л., лимонный сок — 1 ч.л., соль, розмарин",
    recipe: "Картофель нарежьте, сбрызните маслом, посолите и запеките при 200°C 30 минут. Индейку посолите с розмарином, обжарьте 8 минут с каждой стороны. Смешайте овощи для салата, заправьте маслом и лимоном.",
    baseCalories: 460, baseProteins: 42, baseFats: 12, baseCarbs: 46,
    dietTypes: ["omnivore", "gluten_free"],
  },
  {
    mealType: "Обед",
    name: "Тофу с овощами и рисом",
    ingredients: "Тофу твёрдый — 200 г, бурый рис — 80 г, брокколи — 120 г, морковь — 1 шт, соевый соус — 2 ст.л., чеснок — 2 зубчика, имбирь — 1 ч.л., кунжутное масло — 1 ч.л.",
    recipe: "Сварите рис. Нарежьте тофу кубиками, обжарьте до золотистой корочки. Добавьте нарезанные овощи, чеснок и имбирь. Влейте соевый соус, готовьте ещё 5 минут. Сбрызните кунжутным маслом.",
    baseCalories: 420, baseProteins: 22, baseFats: 12, baseCarbs: 54,
    dietTypes: ["omnivore", "vegetarian", "vegan", "gluten_free"],
  },
  {
    mealType: "Обед",
    name: "Куриный суп с лапшой",
    ingredients: "Куриное бедро — 200 г, лапша — 60 г, морковь — 1 шт, лук — 1 шт, сельдерей — 2 стебля, соль, перец, лавровый лист, петрушка",
    recipe: "Сварите куриное бедро в 1.5 л воды 30 минут. Достаньте, нарежьте мясо. Добавьте нарезанные овощи, варите 15 минут. Добавьте лапшу и мясо, варите по инструкции на упаковке. Подавайте с петрушкой.",
    baseCalories: 390, baseProteins: 30, baseFats: 10, baseCarbs: 44,
    dietTypes: ["omnivore"],
  },
  {
    mealType: "Обед",
    name: "Нут с овощным рагу",
    ingredients: "Нут консервированный — 200 г, кабачок — 1 шт, помидоры — 2 шт, болгарский перец — 1 шт, лук — 1 шт, чеснок — 3 зубчика, паприка — 1 ч.л., масло оливковое — 1 ст.л., соль, зелень",
    recipe: "Обжарьте лук и чеснок. Добавьте нарезанные овощи, тушите 10 минут. Добавьте помидоры и специи, готовьте ещё 10 минут. Добавьте нут, перемешайте, прогрейте 5 минут. Подавайте с зеленью.",
    baseCalories: 400, baseProteins: 18, baseFats: 10, baseCarbs: 58,
    dietTypes: ["omnivore", "vegetarian", "vegan", "gluten_free"],
  },
];

const dinnerMeals: MealTemplate[] = [
  {
    mealType: "Ужин",
    name: "Запечённая рыба с овощами",
    ingredients: "Треска или тилапия — 200 г, цукини — 1 шт, помидор — 1 шт, лимон — 1/2 шт, оливковое масло — 1 ст.л., чеснок — 2 зубчика, тимьян, соль, перец",
    recipe: "Нарежьте овощи. Выложите на противень, сбрызните маслом. Сверху положите рыбу, полейте лимонным соком, посыпьте чесноком и тимьяном. Запеките при 190°C 20-22 минуты.",
    baseCalories: 320, baseProteins: 38, baseFats: 10, baseCarbs: 16,
    dietTypes: ["omnivore", "pescatarian", "gluten_free"],
  },
  {
    mealType: "Ужин",
    name: "Куриные котлеты с тушёной капустой",
    ingredients: "Куриный фарш — 250 г, лук — 1/2 шт, яйцо — 1 шт, белокочанная капуста — 300 г, морковь — 1 шт, масло — 1 ст.л., соль, перец, укроп",
    recipe: "Смешайте фарш с тёртым луком, яйцом, солью и перцем. Сформируйте котлеты, обжарьте по 5 минут с каждой стороны. Капусту и морковь нашинкуйте, тушите с маслом и 50 мл воды 20 минут. Подавайте вместе.",
    baseCalories: 380, baseProteins: 40, baseFats: 14, baseCarbs: 20,
    dietTypes: ["omnivore", "gluten_free"],
  },
  {
    mealType: "Ужин",
    name: "Греческий салат с тунцом",
    ingredients: "Тунец в собственном соку — 150 г, огурец — 1 шт, помидор — 2 шт, оливки — 50 г, сыр фета — 50 г, лук красный — 1/4 шт, масло оливковое — 1 ст.л., орегано, лимонный сок",
    recipe: "Нарежьте все овощи, смешайте с тунцом и оливками. Добавьте кусочки феты. Заправьте оливковым маслом, лимонным соком и орегано. Перемешайте и подавайте.",
    baseCalories: 340, baseProteins: 32, baseFats: 18, baseCarbs: 12,
    dietTypes: ["omnivore", "pescatarian", "gluten_free"],
  },
  {
    mealType: "Ужин",
    name: "Говяжий стейк с овощами гриль",
    ingredients: "Говядина (вырезка) — 180 г, кабачок — 1 шт, перец — 1 шт, баклажан — 1/2 шт, масло оливковое — 1 ст.л., чеснок, розмарин, соль, перец",
    recipe: "Мясо посолите, поперчите, смажьте маслом с чесноком и розмарином. Оставьте мариноваться 15 минут. Жарьте на раскалённой сковороде по 3-4 минуты с каждой стороны. Дайте отдохнуть 5 минут. Овощи нарежьте и обжарьте на гриле.",
    baseCalories: 420, baseProteins: 42, baseFats: 22, baseCarbs: 14,
    dietTypes: ["omnivore", "gluten_free", "keto"],
  },
  {
    mealType: "Ужин",
    name: "Яичный омлет с брокколи и сыром",
    ingredients: "Яйца — 3 шт, брокколи — 100 г, сыр — 30 г, молоко — 30 мл, масло сливочное — 1 ч.л., соль, перец, зелень",
    recipe: "Брокколи отварите 3 минуты, нарежьте. Взбейте яйца с молоком, солью, перцем. Растопите масло, вылейте яичную смесь. Добавьте брокколи и тёртый сыр. Готовьте под крышкой 4-5 минут.",
    baseCalories: 300, baseProteins: 26, baseFats: 18, baseCarbs: 8,
    dietTypes: ["omnivore", "vegetarian", "gluten_free", "keto"],
  },
  {
    mealType: "Ужин",
    name: "Запечённая куриная грудка с кабачками",
    ingredients: "Куриная грудка — 180 г, кабачок — 2 шт, чеснок — 3 зубчика, прованские травы — 1 ч.л., масло оливковое — 1 ст.л., лимон, соль, перец",
    recipe: "Грудку отбейте, посолите, поперчите, натрите чесноком и травами. Кабачки нарежьте кружочками. Выложите всё на противень, сбрызните маслом и лимонным соком. Запеките при 200°C 25 минут.",
    baseCalories: 330, baseProteins: 44, baseFats: 10, baseCarbs: 14,
    dietTypes: ["omnivore", "gluten_free", "keto"],
  },
  {
    mealType: "Ужин",
    name: "Лосось с авокадо и салатом",
    ingredients: "Лосось — 150 г, авокадо — 1/2 шт, микс-салат — 80 г, помидор черри — 100 г, огурец — 1/2 шт, оливковое масло — 1 ст.л., лимон",
    recipe: "Лосось посолите, поперчите, запеките при 180°C 15 минут. Нарежьте авокадо, помидоры и огурец. Смешайте с салатом, заправьте маслом и лимоном. Подавайте с лососем.",
    baseCalories: 420, baseProteins: 34, baseFats: 26, baseCarbs: 12,
    dietTypes: ["omnivore", "pescatarian", "gluten_free", "keto"],
  },
  {
    mealType: "Ужин",
    name: "Тушёная фасоль с овощами",
    ingredients: "Фасоль консервированная — 200 г, шпинат — 80 г, помидоры — 2 шт, лук — 1 шт, чеснок — 3 зубчика, перец болгарский — 1 шт, масло — 1 ст.л., паприка, куркума, соль",
    recipe: "Обжарьте лук и чеснок. Добавьте перец, тушите 5 минут. Добавьте помидоры и специи. Когда соус загустеет, добавьте фасоль и шпинат. Тушите ещё 10 минут.",
    baseCalories: 320, baseProteins: 16, baseFats: 8, baseCarbs: 48,
    dietTypes: ["omnivore", "vegetarian", "vegan", "gluten_free"],
  },
];

const snackMeals: MealTemplate[] = [
  {
    mealType: "Перекус",
    name: "Яблоко с миндальной пастой",
    ingredients: "Яблоко — 1 шт, миндальная паста — 2 ст.л.",
    recipe: "Нарежьте яблоко дольками. Подавайте с миндальной пастой для обмакивания.",
    baseCalories: 200, baseProteins: 5, baseFats: 10, baseCarbs: 24,
    dietTypes: ["omnivore", "vegetarian", "vegan", "gluten_free", "keto"],
  },
  {
    mealType: "Перекус",
    name: "Творог с ягодами",
    ingredients: "Творог 5% — 150 г, смородина или черника — 80 г",
    recipe: "Выложите творог в миску, сверху добавьте ягоды. Можно сбрызнуть мёдом по желанию.",
    baseCalories: 180, baseProteins: 20, baseFats: 4, baseCarbs: 16,
    dietTypes: ["omnivore", "vegetarian", "gluten_free"],
  },
  {
    mealType: "Перекус",
    name: "Смесь орехов и сухофруктов",
    ingredients: "Грецкие орехи — 15 г, миндаль — 15 г, кешью — 10 г, курага — 30 г",
    recipe: "Смешайте орехи и сухофрукты. Готово к употреблению.",
    baseCalories: 210, baseProteins: 6, baseFats: 14, baseCarbs: 18,
    dietTypes: ["omnivore", "vegetarian", "vegan", "gluten_free"],
  },
  {
    mealType: "Перекус",
    name: "Греческий йогурт",
    ingredients: "Греческий йогурт 2% — 200 г, семена чиа — 1 ч.л., мёд — 1 ч.л.",
    recipe: "Смешайте йогурт с семенами чиа. Сверху добавьте мёд.",
    baseCalories: 160, baseProteins: 16, baseFats: 4, baseCarbs: 16,
    dietTypes: ["omnivore", "vegetarian", "gluten_free"],
  },
  {
    mealType: "Перекус",
    name: "Овощные палочки с хумусом",
    ingredients: "Морковь — 1 шт, огурец — 1/2 шт, сельдерей — 2 стебля, хумус — 80 г",
    recipe: "Нарежьте овощи палочками. Подавайте с хумусом.",
    baseCalories: 180, baseProteins: 7, baseFats: 8, baseCarbs: 20,
    dietTypes: ["omnivore", "vegetarian", "vegan", "gluten_free"],
  },
  {
    mealType: "Перекус",
    name: "Банан с арахисовым маслом",
    ingredients: "Банан — 1 шт, арахисовое масло — 1 ст.л.",
    recipe: "Нарежьте банан ломтиками. Подавайте с арахисовым маслом.",
    baseCalories: 190, baseProteins: 5, baseFats: 8, baseCarbs: 26,
    dietTypes: ["omnivore", "vegetarian", "vegan", "gluten_free"],
  },
];

function getDurationDays(duration: string): number {
  switch (duration) {
    case "week": return 7;
    case "month": return 30;
    case "three_months": return 90;
    case "six_months": return 180;
    default: return 7;
  }
}

function getEndDate(startDate: Date, duration: string): Date {
  const end = new Date(startDate);
  end.setDate(end.getDate() + getDurationDays(duration) - 1);
  return end;
}

function filterByDiet(meals: MealTemplate[], dietType: string): MealTemplate[] {
  return meals.filter(m => m.dietTypes.includes(dietType));
}

function scaleMeal(meal: MealTemplate, targetCalories: number): MealTemplate {
  const factor = targetCalories / meal.baseCalories;
  return {
    ...meal,
    baseCalories: Math.round(targetCalories),
    baseProteins: Math.round(meal.baseProteins * factor),
    baseFats: Math.round(meal.baseFats * factor),
    baseCarbs: Math.round(meal.baseCarbs * factor),
  };
}

export function generateMealsForPlan(
  planId: number,
  duration: string,
  targetCalories: number,
  dietType: string,
  mealsPerDayOption: string,
) {
  const days = getDurationDays(duration);
  const filteredBreakfast = filterByDiet(breakfastMeals, dietType);
  const filteredLunch = filterByDiet(lunchMeals, dietType);
  const filteredDinner = filterByDiet(dinnerMeals, dietType);
  const filteredSnack = filterByDiet(snackMeals, dietType);

  const bfList = filteredBreakfast.length > 0 ? filteredBreakfast : breakfastMeals;
  const lunchList = filteredLunch.length > 0 ? filteredLunch : lunchMeals;
  const dinnerList = filteredDinner.length > 0 ? filteredDinner : dinnerMeals;
  const snackList = filteredSnack.length > 0 ? filteredSnack : snackMeals;

  const includeSnack = mealsPerDayOption !== "one_two";
  const mealCount = includeSnack ? 4 : 3;

  const bfCalories = Math.round(targetCalories * 0.28);
  const lunchCalories = Math.round(targetCalories * 0.35);
  const dinnerCalories = Math.round(targetCalories * 0.27);
  const snackCalories = Math.round(targetCalories * 0.10);

  const result = [];
  for (let day = 1; day <= days; day++) {
    const bf = scaleMeal(bfList[(day - 1) % bfList.length], bfCalories);
    const lunch = scaleMeal(lunchList[(day - 1) % lunchList.length], lunchCalories);
    const dinner = scaleMeal(dinnerList[(day - 1) % dinnerList.length], dinnerCalories);

    result.push({ planId, dayNumber: day, mealNumber: 1, ...bf, calories: bf.baseCalories, proteins: bf.baseProteins, fats: bf.baseFats, carbs: bf.baseCarbs });
    result.push({ planId, dayNumber: day, mealNumber: 2, ...lunch, calories: lunch.baseCalories, proteins: lunch.baseProteins, fats: lunch.baseFats, carbs: lunch.baseCarbs });
    result.push({ planId, dayNumber: day, mealNumber: 3, ...dinner, calories: dinner.baseCalories, proteins: dinner.baseProteins, fats: dinner.baseFats, carbs: dinner.baseCarbs });

    if (includeSnack) {
      const snack = scaleMeal(snackList[(day - 1) % snackList.length], snackCalories);
      result.push({ planId, dayNumber: day, mealNumber: 4, ...snack, calories: snack.baseCalories, proteins: snack.baseProteins, fats: snack.baseFats, carbs: snack.baseCarbs });
    }
  }

  return result;
}

export function generateSingleMeal(
  planId: number,
  dayNumber: number,
  mealNumber: number,
  mealType: string,
  targetCalories: number,
  dietType: string,
): object {
  let pool: MealTemplate[];
  if (mealType === "Завтрак") pool = filterByDiet(breakfastMeals, dietType);
  else if (mealType === "Обед") pool = filterByDiet(lunchMeals, dietType);
  else if (mealType === "Ужин") pool = filterByDiet(dinnerMeals, dietType);
  else pool = filterByDiet(snackMeals, dietType);

  if (pool.length === 0) pool = breakfastMeals;
  const template = pool[Math.floor(Math.random() * pool.length)];
  const scaled = scaleMeal(template, targetCalories);
  return { planId, dayNumber, mealNumber, ...scaled, calories: scaled.baseCalories, proteins: scaled.baseProteins, fats: scaled.baseFats, carbs: scaled.baseCarbs };
}

export function getEndDateStr(startDateStr: string, duration: string): string {
  const start = new Date(startDateStr);
  return getEndDate(start, duration).toISOString().split("T")[0];
}

export function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}
