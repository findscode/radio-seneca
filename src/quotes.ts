import type { Lang } from "./i18n";

const quotes: Record<Lang, string[]> = {
  en: [
    "Nothing is ours except time.",
    "We suffer more in imagination than in reality.",
    "While we wait, life speeds by.",
    "Luck is preparation meeting opportunity.",
    "Begin at once to live.",
    "Difficulties strengthen the mind.",
    "No wind helps a ship without a port.",
    "He who is brave is free.",
    "Life is long if you know how to use it.",
    "As long as you live, keep learning how to live.",
    "Count each day as a separate life.",
    "Poor is the one who craves more.",
    "We are more often frightened than hurt.",
    "A gem is not polished without friction.",
    "Sometimes even to live is an act of courage.",
    "Keep company with those who improve you.",
    "The whole future lies in uncertainty.",
    "Live immediately.",
    "No one becomes wise by chance.",
    "Quality matters more than quantity.",
    "Fate leads the willing.",
    "Time is the one thing that is ours.",
    "Hold on to your youthful enthusiasms.",
    "Happiness is to enjoy the present.",
  ],
  ru: [
    "Нам принадлежит только время.",
    "Мы больше страдаем в воображении, чем наяву.",
    "Пока мы ждём, жизнь проходит.",
    "Удача — это подготовка и случай.",
    "Начни жить сразу.",
    "Трудности укрепляют ум.",
    "Без порта никакой ветер не поможет.",
    "Кто храбр, тот свободен.",
    "Жизнь долгая, если уметь ею жить.",
    "Пока живёшь, учись жить.",
    "Считай каждый день отдельной жизнью.",
    "Беден тот, кто хочет всё больше.",
    "Мы чаще пугаемся, чем страдаем.",
    "Камень не полируют без трения.",
    "Иногда даже жить — это смелость.",
    "Будь рядом с теми, кто делает тебя лучше.",
    "Будущее целиком неясно.",
    "Живи сейчас.",
    "Мудрым не становятся случайно.",
    "Важно качество, а не количество.",
    "Судьба ведёт того, кто хочет.",
    "Время — единственное, что наше.",
    "Храни юношеский пыл.",
    "Счастье — пользоваться настоящим.",
  ],
};

export function utcHour(date: Date): number {
  return date.getUTCHours();
}

export function quoteAt(date: Date, lang: Lang): string {
  const list = quotes[lang];
  return list[utcHour(date) % list.length] ?? list[0];
}
