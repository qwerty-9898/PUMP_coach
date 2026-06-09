// База продуктов. Значения на 100 г. portion — типичная порция в граммах для быстрого добавления.
// p/f/c — белки/жиры/углеводы в граммах на 100 г.
export const FOOD_CATS = ['Снеки и сладкое', 'Мясо и рыба', 'Крупы и гарниры', 'Молочное', 'Овощи и фрукты', 'Выпечка и хлеб', 'Орехи', 'Напитки', 'Фастфуд', 'Яйца']

export const FOODS = [
  // Снеки и сладкое
  { id: 'mars', name: 'Батончик Марс', cat: 'Снеки и сладкое', kcal: 449, p: 4, f: 17, c: 70, portion: 51 },
  { id: 'snickers', name: 'Батончик Сникерс', cat: 'Снеки и сладкое', kcal: 491, p: 8, f: 24, c: 60, portion: 50 },
  { id: 'twix', name: 'Батончик Твикс', cat: 'Снеки и сладкое', kcal: 502, p: 5, f: 25, c: 64, portion: 50 },
  { id: 'milkchoc', name: 'Молочный шоколад', cat: 'Снеки и сладкое', kcal: 535, p: 7, f: 30, c: 59, portion: 30 },
  { id: 'darkchoc', name: 'Тёмный шоколад', cat: 'Снеки и сладкое', kcal: 546, p: 6, f: 35, c: 48, portion: 30 },
  { id: 'cookie', name: 'Печенье овсяное', cat: 'Снеки и сладкое', kcal: 437, p: 6, f: 14, c: 71, portion: 25 },
  { id: 'icecream', name: 'Мороженое пломбир', cat: 'Снеки и сладкое', kcal: 227, p: 4, f: 12, c: 26, portion: 100 },
  { id: 'honey', name: 'Мёд', cat: 'Снеки и сладкое', kcal: 329, p: 1, f: 0, c: 81, portion: 20 },
  { id: 'sugar', name: 'Сахар', cat: 'Снеки и сладкое', kcal: 398, p: 0, f: 0, c: 100, portion: 10 },
  { id: 'halva', name: 'Халва', cat: 'Снеки и сладкое', kcal: 523, p: 12, f: 30, c: 50, portion: 30 },
  { id: 'marshmallow', name: 'Зефир', cat: 'Снеки и сладкое', kcal: 326, p: 1, f: 0, c: 80, portion: 30 },
  { id: 'jam', name: 'Варенье', cat: 'Снеки и сладкое', kcal: 271, p: 0, f: 0, c: 68, portion: 20 },
  { id: 'protein_bar', name: 'Протеиновый батончик', cat: 'Снеки и сладкое', kcal: 350, p: 30, f: 10, c: 35, portion: 60 },
  { id: 'chips', name: 'Чипсы картофельные', cat: 'Снеки и сладкое', kcal: 525, p: 6, f: 33, c: 53, portion: 50 },

  // Мясо и рыба
  { id: 'chicken_breast', name: 'Куриная грудка варёная', cat: 'Мясо и рыба', kcal: 137, p: 29, f: 2, c: 0, portion: 150 },
  { id: 'chicken_thigh', name: 'Куриное бедро', cat: 'Мясо и рыба', kcal: 211, p: 21, f: 14, c: 0, portion: 150 },
  { id: 'beef', name: 'Говядина варёная', cat: 'Мясо и рыба', kcal: 254, p: 27, f: 16, c: 0, portion: 150 },
  { id: 'pork', name: 'Свинина', cat: 'Мясо и рыба', kcal: 259, p: 27, f: 18, c: 0, portion: 150 },
  { id: 'beef_mince', name: 'Фарш говяжий', cat: 'Мясо и рыба', kcal: 254, p: 17, f: 20, c: 0, portion: 150 },
  { id: 'cutlet', name: 'Котлета жареная', cat: 'Мясо и рыба', kcal: 248, p: 15, f: 18, c: 8, portion: 100 },
  { id: 'salmon', name: 'Лосось', cat: 'Мясо и рыба', kcal: 208, p: 20, f: 13, c: 0, portion: 150 },
  { id: 'tuna_can', name: 'Тунец консервированный', cat: 'Мясо и рыба', kcal: 116, p: 26, f: 1, c: 0, portion: 100 },
  { id: 'cod', name: 'Треска', cat: 'Мясо и рыба', kcal: 82, p: 18, f: 1, c: 0, portion: 150 },
  { id: 'herring', name: 'Сельдь', cat: 'Мясо и рыба', kcal: 217, p: 18, f: 16, c: 0, portion: 100 },
  { id: 'sausage', name: 'Колбаса варёная', cat: 'Мясо и рыба', kcal: 257, p: 13, f: 22, c: 2, portion: 50 },
  { id: 'sausages', name: 'Сосиски', cat: 'Мясо и рыба', kcal: 266, p: 11, f: 24, c: 2, portion: 100 },
  { id: 'bacon', name: 'Бекон', cat: 'Мясо и рыба', kcal: 500, p: 37, f: 40, c: 0, portion: 30 },
  { id: 'shrimp', name: 'Креветки', cat: 'Мясо и рыба', kcal: 99, p: 24, f: 0, c: 0, portion: 100 },

  // Крупы и гарниры
  { id: 'buckwheat', name: 'Гречка варёная', cat: 'Крупы и гарниры', kcal: 110, p: 4, f: 1, c: 21, portion: 200 },
  { id: 'rice_white', name: 'Рис белый варёный', cat: 'Крупы и гарниры', kcal: 116, p: 2, f: 0, c: 25, portion: 200 },
  { id: 'rice_brown', name: 'Рис бурый варёный', cat: 'Крупы и гарниры', kcal: 111, p: 3, f: 1, c: 23, portion: 200 },
  { id: 'oats', name: 'Овсянка на воде', cat: 'Крупы и гарниры', kcal: 88, p: 3, f: 2, c: 15, portion: 250 },
  { id: 'oats_milk', name: 'Овсянка на молоке', cat: 'Крупы и гарниры', kcal: 102, p: 3, f: 4, c: 14, portion: 250 },
  { id: 'pasta', name: 'Макароны варёные', cat: 'Крупы и гарниры', kcal: 112, p: 4, f: 1, c: 23, portion: 200 },
  { id: 'potato_boiled', name: 'Картофель варёный', cat: 'Крупы и гарниры', kcal: 82, p: 2, f: 0, c: 17, portion: 200 },
  { id: 'potato_fried', name: 'Картофель жареный', cat: 'Крупы и гарниры', kcal: 192, p: 3, f: 9, c: 23, portion: 200 },
  { id: 'mashed', name: 'Пюре картофельное', cat: 'Крупы и гарниры', kcal: 106, p: 2, f: 4, c: 15, portion: 200 },
  { id: 'pearl', name: 'Перловка варёная', cat: 'Крупы и гарниры', kcal: 109, p: 3, f: 0, c: 23, portion: 200 },
  { id: 'lentils', name: 'Чечевица варёная', cat: 'Крупы и гарниры', kcal: 116, p: 9, f: 0, c: 20, portion: 200 },
  { id: 'beans', name: 'Фасоль варёная', cat: 'Крупы и гарниры', kcal: 123, p: 8, f: 1, c: 21, portion: 150 },

  // Молочное
  { id: 'milk', name: 'Молоко 2.5%', cat: 'Молочное', kcal: 52, p: 3, f: 3, c: 5, portion: 250 },
  { id: 'kefir', name: 'Кефир 1%', cat: 'Молочное', kcal: 40, p: 3, f: 1, c: 4, portion: 250 },
  { id: 'cottage5', name: 'Творог 5%', cat: 'Молочное', kcal: 121, p: 17, f: 5, c: 2, portion: 150 },
  { id: 'cottage0', name: 'Творог обезжиренный', cat: 'Молочное', kcal: 71, p: 16, f: 0, c: 2, portion: 150 },
  { id: 'yogurt', name: 'Йогурт натуральный', cat: 'Молочное', kcal: 60, p: 5, f: 3, c: 4, portion: 150 },
  { id: 'greek_yogurt', name: 'Греческий йогурт', cat: 'Молочное', kcal: 97, p: 9, f: 5, c: 4, portion: 150 },
  { id: 'cheese', name: 'Сыр твёрдый', cat: 'Молочное', kcal: 363, p: 25, f: 29, c: 0, portion: 40 },
  { id: 'sour_cream', name: 'Сметана 20%', cat: 'Молочное', kcal: 206, p: 3, f: 20, c: 3, portion: 30 },
  { id: 'butter', name: 'Масло сливочное', cat: 'Молочное', kcal: 748, p: 1, f: 82, c: 1, portion: 10 },
  { id: 'whey', name: 'Протеин (сыворотка)', cat: 'Молочное', kcal: 400, p: 75, f: 7, c: 10, portion: 30 },

  // Овощи и фрукты
  { id: 'banana', name: 'Банан', cat: 'Овощи и фрукты', kcal: 89, p: 1, f: 0, c: 23, portion: 120 },
  { id: 'apple', name: 'Яблоко', cat: 'Овощи и фрукты', kcal: 52, p: 0, f: 0, c: 14, portion: 180 },
  { id: 'orange', name: 'Апельсин', cat: 'Овощи и фрукты', kcal: 47, p: 1, f: 0, c: 12, portion: 180 },
  { id: 'grape', name: 'Виноград', cat: 'Овощи и фрукты', kcal: 69, p: 1, f: 0, c: 17, portion: 100 },
  { id: 'strawberry', name: 'Клубника', cat: 'Овощи и фрукты', kcal: 33, p: 1, f: 0, c: 8, portion: 100 },
  { id: 'avocado', name: 'Авокадо', cat: 'Овощи и фрукты', kcal: 160, p: 2, f: 15, c: 9, portion: 100 },
  { id: 'tomato', name: 'Помидор', cat: 'Овощи и фрукты', kcal: 20, p: 1, f: 0, c: 4, portion: 100 },
  { id: 'cucumber', name: 'Огурец', cat: 'Овощи и фрукты', kcal: 15, p: 1, f: 0, c: 3, portion: 100 },
  { id: 'broccoli', name: 'Брокколи', cat: 'Овощи и фрукты', kcal: 34, p: 3, f: 0, c: 7, portion: 150 },
  { id: 'carrot', name: 'Морковь', cat: 'Овощи и фрукты', kcal: 41, p: 1, f: 0, c: 10, portion: 100 },
  { id: 'salad', name: 'Салат овощной', cat: 'Овощи и фрукты', kcal: 50, p: 1, f: 3, c: 5, portion: 150 },
  { id: 'potato_raw', name: 'Картофель сырой', cat: 'Овощи и фрукты', kcal: 77, p: 2, f: 0, c: 17, portion: 150 },

  // Выпечка и хлеб
  { id: 'bread_white', name: 'Хлеб белый', cat: 'Выпечка и хлеб', kcal: 265, p: 8, f: 3, c: 51, portion: 30 },
  { id: 'bread_rye', name: 'Хлеб ржаной', cat: 'Выпечка и хлеб', kcal: 214, p: 6, f: 1, c: 42, portion: 30 },
  { id: 'lavash', name: 'Лаваш', cat: 'Выпечка и хлеб', kcal: 236, p: 8, f: 1, c: 48, portion: 50 },
  { id: 'bun', name: 'Булочка', cat: 'Выпечка и хлеб', kcal: 300, p: 8, f: 6, c: 54, portion: 70 },
  { id: 'pancake', name: 'Блины', cat: 'Выпечка и хлеб', kcal: 233, p: 6, f: 12, c: 26, portion: 100 },
  { id: 'pelmeni', name: 'Пельмени', cat: 'Выпечка и хлеб', kcal: 275, p: 12, f: 13, c: 29, portion: 200 },
  { id: 'pirozhok', name: 'Пирожок с мясом', cat: 'Выпечка и хлеб', kcal: 294, p: 9, f: 13, c: 36, portion: 100 },

  // Орехи
  { id: 'peanut', name: 'Арахис', cat: 'Орехи', kcal: 567, p: 26, f: 49, c: 16, portion: 30 },
  { id: 'walnut', name: 'Грецкий орех', cat: 'Орехи', kcal: 654, p: 15, f: 65, c: 14, portion: 30 },
  { id: 'almond', name: 'Миндаль', cat: 'Орехи', kcal: 579, p: 21, f: 50, c: 22, portion: 30 },
  { id: 'cashew', name: 'Кешью', cat: 'Орехи', kcal: 553, p: 18, f: 44, c: 30, portion: 30 },
  { id: 'peanut_butter', name: 'Арахисовая паста', cat: 'Орехи', kcal: 588, p: 25, f: 50, c: 20, portion: 20 },

  // Напитки
  { id: 'cola', name: 'Кола', cat: 'Напитки', kcal: 42, p: 0, f: 0, c: 11, portion: 330 },
  { id: 'juice', name: 'Сок апельсиновый', cat: 'Напитки', kcal: 45, p: 1, f: 0, c: 10, portion: 250 },
  { id: 'beer', name: 'Пиво', cat: 'Напитки', kcal: 43, p: 0, f: 0, c: 4, portion: 500 },
  { id: 'coffee_milk', name: 'Кофе с молоком', cat: 'Напитки', kcal: 36, p: 2, f: 1, c: 4, portion: 200 },
  { id: 'energy', name: 'Энергетик', cat: 'Напитки', kcal: 45, p: 0, f: 0, c: 11, portion: 250 },

  // Фастфуд
  { id: 'bigmac', name: 'Бургер (Биг Мак)', cat: 'Фастфуд', kcal: 257, p: 12, f: 15, c: 19, portion: 215 },
  { id: 'fries', name: 'Картошка фри', cat: 'Фастфуд', kcal: 312, p: 3, f: 15, c: 41, portion: 130 },
  { id: 'pizza', name: 'Пицца', cat: 'Фастфуд', kcal: 266, p: 11, f: 10, c: 33, portion: 150 },
  { id: 'shawarma', name: 'Шаурма', cat: 'Фастфуд', kcal: 215, p: 12, f: 11, c: 17, portion: 250 },
  { id: 'hotdog', name: 'Хот-дог', cat: 'Фастфуд', kcal: 247, p: 10, f: 15, c: 19, portion: 150 },
  { id: 'nuggets', name: 'Наггетсы', cat: 'Фастфуд', kcal: 297, p: 15, f: 18, c: 18, portion: 100 },

  // Яйца
  { id: 'egg', name: 'Яйцо куриное', cat: 'Яйца', kcal: 157, p: 13, f: 11, c: 1, portion: 55 },
  { id: 'egg_white', name: 'Яичный белок', cat: 'Яйца', kcal: 52, p: 11, f: 0, c: 1, portion: 33 },
  { id: 'omelette', name: 'Омлет', cat: 'Яйца', kcal: 184, p: 10, f: 15, c: 2, portion: 150 },
  { id: 'fried_eggs', name: 'Яичница', cat: 'Яйца', kcal: 196, p: 14, f: 15, c: 1, portion: 110 }
]

export function searchFoods(q) {
  q = (q || '').trim().toLowerCase()
  if (!q) return FOODS
  return FOODS.filter(f => f.name.toLowerCase().includes(q))
}

export function macrosFor(food, grams) {
  const k = grams / 100
  return {
    kcal: Math.round(food.kcal * k),
    p: Math.round(food.p * k),
    f: Math.round(food.f * k),
    c: Math.round(food.c * k)
  }
}
